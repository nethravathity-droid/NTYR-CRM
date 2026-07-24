import bcrypt from "bcrypt";
import type { Knex } from "knex";
import { env } from "../../config/env.js";
import { AppError } from "../../common/errors/AppError.js";

const FULL_ACCESS = {
  can_view: true,
  can_create: true,
  can_update: true,
  can_delete: true,
  can_export: true,
  can_approve: true,
} as const;

/** Default CRM permissions granted to a newly provisioned company admin. */
export const COMPANY_ADMIN_PERMISSION_CODES = [
  "users.view",
  "users.create",
  "users.update",
  "users.delete",
  "branches.view",
  "departments.view",
  "roles.view",
  "leads.view",
  "leads.create",
  "leads.update",
  "leads.delete",
  "projects.view",
  "projects.create",
  "projects.update",
  "projects.delete",
  "visits.view",
  "visits.create",
  "visits.update",
  "visits.delete",
  "bookings.view",
  "bookings.create",
  "bookings.update",
  "bookings.delete",
  "payments.view",
  "payments.create",
  "payments.update",
  "payments.delete",
  "reports.view",
  "reports.export",
  "calls.view",
  "calls.create",
  "calls.update",
  "calls.delete",
] as const;

export type ProvisionAdminInput = {
  username: string;
  password: string;
  employeeCode?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
};

export type ProvisionAdminResult = {
  companyCode: string;
  username: string;
  employeeCode: string;
};

type CompanyContext = {
  companyId: number;
  companyCode: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  ownerName: string;
};

async function findOrCreateId(
  trx: Knex.Transaction,
  table: string,
  where: Record<string, unknown>,
  insert: Record<string, unknown>,
): Promise<number> {
  const existing = await trx(table).where(where).first<{ id: number }>("id");
  if (existing) return existing.id;

  const [created] = await trx(table).insert(insert).returning<{ id: number }[]>("id");
  if (!created) {
    throw new AppError(500, "Failed to create organization record.");
  }
  return created.id;
}

async function ensureRolePermissions(
  trx: Knex.Transaction,
  roleId: number,
  permissionCodes: readonly string[],
): Promise<void> {
  const permissions = await trx("permissions")
    .whereIn("permission_code", permissionCodes as string[])
    .select("id", "permission_code");

  const permissionMap = new Map(
    permissions.map((row: { id: number; permission_code: string }) => [
      row.permission_code,
      row.id,
    ]),
  );

  for (const code of permissionCodes) {
    const permissionId = permissionMap.get(code);
    if (!permissionId) {
      throw new AppError(500, `Permission "${code}" is not configured on the platform.`);
    }

    const exists = await trx("role_permissions")
      .where({ role_id: roleId, permission_id: permissionId })
      .first("id");

    if (!exists) {
      await trx("role_permissions").insert({
        role_id: roleId,
        permission_id: permissionId,
        ...FULL_ACCESS,
      });
    }
  }
}

export async function companyHasAdminUser(
  db: Knex,
  companyId: number,
): Promise<boolean> {
  const row = await db("users as u")
    .join("roles as r", "r.id", "u.role_id")
    .where("u.company_id", companyId)
    .where("r.role_code", "COMPANY_ADMIN")
    .whereNull("u.deleted_at")
    .count<{ count: string }>("u.id as count")
    .first();

  return Number(row?.count ?? 0) > 0;
}

export async function provisionCompanyAdmin(
  db: Knex,
  context: CompanyContext,
  admin: ProvisionAdminInput,
  createdBy: number,
): Promise<ProvisionAdminResult> {
  const hasAdmin = await companyHasAdminUser(db, context.companyId);
  if (hasAdmin) {
    throw new AppError(
      409,
      "This company already has a company admin login. Create additional users from the company admin workspace.",
    );
  }

  const employeeCode = (admin.employeeCode ?? "ADM001").trim().toUpperCase();
  const username = admin.username.trim().toLowerCase();
  const ownerParts = context.ownerName.trim().split(/\s+/);
  const firstName = admin.firstName?.trim() || ownerParts[0] || "Company";
  const lastName =
    admin.lastName?.trim() || (ownerParts.length > 1 ? ownerParts.slice(1).join(" ") : "Admin");
  const displayName = admin.displayName?.trim() || `${firstName} ${lastName}`.trim();

  return db.transaction(async (trx) => {
    const duplicateUsername = await trx("users")
      .where({ company_id: context.companyId, username })
      .whereNull("deleted_at")
      .first("id");

    if (duplicateUsername) {
      throw new AppError(409, "Username is already taken in this company.");
    }

    const duplicateCode = await trx("users")
      .where({ company_id: context.companyId, employee_code: employeeCode })
      .whereNull("deleted_at")
      .first("id");

    if (duplicateCode) {
      throw new AppError(409, "Employee code is already taken in this company.");
    }

    const branchId = await findOrCreateId(
      trx,
      "branches",
      { company_id: context.companyId, branch_code: "MAIN" },
      {
        company_id: context.companyId,
        branch_code: "MAIN",
        branch_name: "Main Branch",
        email: context.email,
        phone: context.phone,
        city: context.city,
        state: context.state,
        country: "India",
        status: "ACTIVE",
      },
    );

    const departmentId = await findOrCreateId(
      trx,
      "departments",
      { branch_id: branchId, department_code: "ADMIN" },
      {
        company_id: context.companyId,
        branch_id: branchId,
        department_code: "ADMIN",
        department_name: "Administration",
        status: "ACTIVE",
      },
    );

    const designationId = await findOrCreateId(
      trx,
      "designations",
      { company_id: context.companyId, designation_code: "CA" },
      {
        company_id: context.companyId,
        designation_code: "CA",
        designation_name: "Company Administrator",
        status: "ACTIVE",
      },
    );

    const roleId = await findOrCreateId(
      trx,
      "roles",
      { company_id: context.companyId, role_code: "COMPANY_ADMIN" },
      {
        company_id: context.companyId,
        role_code: "COMPANY_ADMIN",
        role_name: "Company Admin",
        description: "Company administrator with full CRM access",
        is_system: true,
        status: "ACTIVE",
      },
    );

    await ensureRolePermissions(trx, roleId, COMPANY_ADMIN_PERMISSION_CODES);

    const passwordHash = await bcrypt.hash(admin.password, env.BCRYPT_ROUNDS);

    const [user] = await trx("users")
      .insert({
        company_id: context.companyId,
        branch_id: branchId,
        department_id: departmentId,
        designation_id: designationId,
        role_id: roleId,
        employee_code: employeeCode,
        username,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        display_name: displayName,
        official_email: context.email,
        mobile: context.phone,
        status: "ACTIVE",
        email_verified: true,
        mobile_verified: true,
        created_by: createdBy,
        updated_by: createdBy,
      })
      .returning<{ id: number }[]>("id");

    if (!user) {
      throw new AppError(500, "Failed to create company admin user.");
    }

    await trx("employee_profiles").insert({
      company_id: context.companyId,
      user_id: user.id,
      joining_date: new Date().toISOString().slice(0, 10),
      personal_email: context.email,
      city: context.city,
      state: context.state,
      country: "India",
    });

    return {
      companyCode: context.companyCode.toUpperCase(),
      username,
      employeeCode,
    };
  });
}
