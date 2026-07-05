import bcrypt from "bcrypt";
import type { Knex } from "knex";
import {
  FULL_ACCESS,
  PERMISSIONS,
  SEED,
} from "./constants.js";
import { BCRYPT_ROUNDS, seedDb } from "./db.js";
import {
  ensureRolePermission,
  findByIdAllowDeleted,
  findOrCreate,
} from "./helpers.js";

interface CompanySeedInput {
  companyCode: string;
  companyName: string;
  legalName?: string;
  ownerName: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  status: "TRIAL" | "ACTIVE";
  branchCode: string;
  branchName: string;
  departmentCode: string;
  departmentName: string;
  designationCode: string;
  designationName: string;
  roleCode: string;
  roleName: string;
  isSystemRole: boolean;
  permissionCodes: string[];
  permissionGrants?: typeof FULL_ACCESS;
  user: {
    employeeCode: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    displayName: string;
    officialEmail: string;
    mobile: string;
  };
}

async function seedPermissions(trx: Knex.Transaction): Promise<Map<string, number>> {
  const permissionMap = new Map<string, number>();

  for (const permission of PERMISSIONS) {
    const { id } = await findOrCreate(
      trx,
      "permissions",
      { permission_code: permission.code },
      {
        permission_code: permission.code,
        permission_name: permission.name,
        module_name: permission.module,
        status: "ACTIVE",
      },
    );

    permissionMap.set(permission.code, id);
  }

  return permissionMap;
}

async function seedCompanyBundle(
  trx: Knex.Transaction,
  input: CompanySeedInput,
  permissionMap: Map<string, number>,
): Promise<{ companyId: number; userId: number; created: boolean }> {
  const { id: companyId, created: companyCreated } = await findOrCreate(
    trx,
    "companies",
    { company_code: input.companyCode },
    {
      company_code: input.companyCode,
      company_name: input.companyName,
      legal_name: input.legalName ?? input.companyName,
      owner_name: input.ownerName,
      email: input.email,
      phone: input.phone,
      address_line1: input.addressLine1,
      city: input.city,
      state: input.state,
      country: "India",
      postal_code: input.postalCode,
      status: input.status,
    },
  );

  const { id: branchId } = await findOrCreate(
    trx,
    "branches",
    { company_id: companyId, branch_code: input.branchCode },
    {
      company_id: companyId,
      branch_code: input.branchCode,
      branch_name: input.branchName,
      email: input.email,
      phone: input.phone,
      city: input.city,
      state: input.state,
      country: "India",
      status: "ACTIVE",
    },
  );

  const { id: departmentId } = await findOrCreate(
    trx,
    "departments",
    { branch_id: branchId, department_code: input.departmentCode },
    {
      company_id: companyId,
      branch_id: branchId,
      department_code: input.departmentCode,
      department_name: input.departmentName,
      status: "ACTIVE",
    },
  );

  const { id: designationId } = await findOrCreate(
    trx,
    "designations",
    { company_id: companyId, designation_code: input.designationCode },
    {
      company_id: companyId,
      designation_code: input.designationCode,
      designation_name: input.designationName,
      status: "ACTIVE",
    },
  );

  const { id: roleId } = await findOrCreate(
    trx,
    "roles",
    { company_id: companyId, role_code: input.roleCode },
    {
      company_id: companyId,
      role_code: input.roleCode,
      role_name: input.roleName,
      description: `${input.roleName} system role`,
      is_system: input.isSystemRole,
      status: "ACTIVE",
    },
  );

  const grants = input.permissionGrants ?? FULL_ACCESS;

  for (const permissionCode of input.permissionCodes) {
    const permissionId = permissionMap.get(permissionCode);

    if (!permissionId) {
      throw new Error(`Permission not found: ${permissionCode}`);
    }

    await ensureRolePermission(trx, roleId, permissionId, grants);
  }

  const existingUserId = await findByIdAllowDeleted(trx, "users", {
    company_id: companyId,
    username: input.user.username,
  });

  let userId = existingUserId;
  let userCreated = false;

  if (!existingUserId) {
    const passwordHash = await bcrypt.hash(input.user.password, BCRYPT_ROUNDS);

    const [createdUser] = await trx("users")
      .insert({
        company_id: companyId,
        branch_id: branchId,
        department_id: departmentId,
        designation_id: designationId,
        role_id: roleId,
        employee_code: input.user.employeeCode,
        username: input.user.username,
        password_hash: passwordHash,
        first_name: input.user.firstName,
        last_name: input.user.lastName,
        display_name: input.user.displayName,
        official_email: input.user.officialEmail,
        mobile: input.user.mobile,
        status: "ACTIVE",
        email_verified: true,
        mobile_verified: true,
      })
      .returning("id");

    userId = createdUser.id;
    userCreated = true;
  }

  if (!userId) {
    throw new Error(`Failed to resolve user for ${input.user.username}`);
  }

  await findOrCreate(trx, "employee_profiles", { user_id: userId }, {
    company_id: companyId,
    user_id: userId,
    joining_date: new Date().toISOString().slice(0, 10),
    personal_email: input.user.officialEmail,
    city: input.city,
    state: input.state,
    country: "India",
  });

  return {
    companyId,
    userId,
    created: companyCreated || userCreated,
  };
}

async function runSeed(): Promise<void> {
  console.log("Starting database seed...\n");

  await seedDb.transaction(async (trx) => {
    const permissionMap = await seedPermissions(trx);
    console.log(`Permissions ready: ${permissionMap.size}`);

    await seedCompanyBundle(
      trx,
      {
        ...SEED.platform,
        status: "ACTIVE",
        isSystemRole: true,
        permissionCodes: PERMISSIONS.map((permission) => permission.code),
        permissionGrants: FULL_ACCESS,
      },
      permissionMap,
    );

    await seedCompanyBundle(
      trx,
      {
        ...SEED.demo,
        status: "TRIAL",
        isSystemRole: true,
        permissionCodes: [
          "users.view",
          "users.create",
          "users.update",
          "users.delete",
          "branches.view",
          "departments.view",
          "roles.view",
        ],
        permissionGrants: FULL_ACCESS,
      },
      permissionMap,
    );
  });

  console.log("\nSeed completed successfully.\n");
  console.log("Platform Super Admin");
  console.log("--------------------");
  console.log(`Company Code : ${SEED.platform.companyCode}`);
  console.log(`Username     : ${SEED.platform.user.username}`);
  console.log(`Password     : ${SEED.platform.user.password}`);
  console.log("");
  console.log("Demo Company Admin");
  console.log("------------------");
  console.log(`Company Code : ${SEED.demo.companyCode}`);
  console.log(`Username     : ${SEED.demo.user.username}`);
  console.log(`Password     : ${SEED.demo.user.password}`);
  console.log("");
  console.log("Note: Re-running this seed is safe. Existing records are preserved.");
}

runSeed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await seedDb.destroy();
  });
