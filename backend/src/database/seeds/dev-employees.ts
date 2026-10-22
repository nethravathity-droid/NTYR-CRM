/*
 * DEVELOPMENT-ONLY SEED: test employees for a local database.
 *
 * Usage:
 *   npm run seed:dev-employees
 *
 * Creates three test employees for an existing tenant company so the
 * employee login flow can be tested locally. Never run in production.
 *
 * The temporary password is documented here and printed by the script.
 * Seeded users are flagged to force a password change on first login
 * (must_change_password = TRUE), and the login response tells the
 * frontend to require a password change before the session continues.
 * Credentials are intentionally NOT stored anywhere in frontend code.
 */
import bcrypt from "bcrypt";
import type { Knex } from "knex";
import { seedDb, BCRYPT_ROUNDS } from "./db.js";
import { findOrCreate } from "./helpers.js";
import { ensureTenantEmployeeDefaults } from "../../modules/companies/tenant-employee-defaults.service.js";

/** Temporary dev password — must satisfy the password policy. */
const DEV_TEMP_PASSWORD = "Dev@Temp123";

interface DevEmployee {
  roleCode: string;
  employeeCode: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  mobile: string;
  departmentCode: string;
  designationCode: string;
}

const DEV_EMPLOYEES: DevEmployee[] = [
  {
    roleCode: "MANAGER",
    employeeCode: "DEV-MGR-001",
    username: "manager",
    email: "manager@example.com",
    firstName: "Dev",
    lastName: "Manager",
    mobile: "9000000011",
    departmentCode: "SALES",
    designationCode: "MGR",
  },
  {
    roleCode: "TELECALLER",
    employeeCode: "DEV-TC-001",
    username: "telecaller",
    email: "telecaller@example.com",
    firstName: "Dev",
    lastName: "Telecaller",
    mobile: "9000000012",
    departmentCode: "TEL",
    designationCode: "TC",
  },
  {
    roleCode: "SALES_EXECUTIVE",
    employeeCode: "DEV-SE-001",
    username: "sales",
    email: "sales@example.com",
    firstName: "Dev",
    lastName: "Sales",
    mobile: "9000000013",
    departmentCode: "SALES",
    designationCode: "SE",
  },
];

async function seedDevEmployees(): Promise<void> {
  const companyCode = process.env.DEV_COMPANY_CODE;

  if (!companyCode) {
    console.error(
      "Set DEV_COMPANY_CODE to the tenant company code the employees belong to (not PLATFORM).",
    );
    process.exitCode = 1;
    return;
  }

  const company = await seedDb("companies")
    .whereRaw("LOWER(company_code) = LOWER(?)", [companyCode])
    .first<{ id: number }>("id");

  if (!company) {
    console.error(`Company "${companyCode}" not found. Create the company first.`);
    process.exitCode = 1;
    return;
  }

  const companyId = company.id;

  // Reuse the same tenant defaults service as employee creation.
  await ensureTenantEmployeeDefaults(seedDb as unknown as Knex, companyId);

  const branch = await seedDb("branches")
    .where({ company_id: companyId, branch_code: "MAIN" })
    .whereNull("deleted_at")
    .first<{ id: number }>("id");

  if (!branch) {
    console.error("Company has no MAIN branch; cannot attach employees.");
    process.exitCode = 1;
    return;
  }

  const passwordHash = await bcrypt.hash(DEV_TEMP_PASSWORD, BCRYPT_ROUNDS);

  await seedDb.transaction(async (trx) => {
    for (const employee of DEV_EMPLOYEES) {
      const role = await trx("roles")
        .where({ company_id: companyId, role_code: employee.roleCode })
        .first<{ id: number }>("id");

      const department = await trx("departments")
        .where({ branch_id: branch.id, department_code: employee.departmentCode })
        .first<{ id: number }>("id");

      const designation = await trx("designations")
        .where({ company_id: companyId, designation_code: employee.designationCode })
        .first<{ id: number }>("id");

      if (!role || !department || !designation) {
        throw new Error(
          `Missing org records for ${employee.roleCode} (role/department/designation).`,
        );
      }

      const existing = await trx("users")
        .where({ company_id: companyId, username: employee.username })
        .first<{ id: number }>("id");

      if (existing) {
        await trx("users")
          .where({ id: existing.id })
          .update({
            password_hash: passwordHash,
            password_changed_at: null,
            role_id: role.id,
            branch_id: branch.id,
            department_id: department.id,
            designation_id: designation.id,
            status: "ACTIVE",
            failed_login_attempts: 0,
            account_locked_until: null,
            must_change_password: true,
            updated_at: trx.fn.now(),
          });
        console.log(`Updated dev employee: ${employee.email}`);
        continue;
      }

      const [created] = await trx("users")
        .insert({
          company_id: companyId,
          branch_id: branch.id,
          department_id: department.id,
          designation_id: designation.id,
          role_id: role.id,
          employee_code: employee.employeeCode,
          username: employee.username,
          password_hash: passwordHash,
          first_name: employee.firstName,
          last_name: employee.lastName,
          display_name: `${employee.firstName} ${employee.lastName}`,
          official_email: employee.email,
          mobile: employee.mobile,
          status: "ACTIVE",
          email_verified: true,
          mobile_verified: true,
          password_changed_at: null,
          must_change_password: true,
        })
        .returning<{ id: number }[]>("id");

      if (!created) {
        throw new Error(`Failed to create dev employee ${employee.email}`);
      }

      await findOrCreate(trx, "employee_profiles", { user_id: created.id }, {
        company_id: companyId,
        user_id: created.id,
        joining_date: new Date().toISOString().slice(0, 10),
        personal_email: employee.email,
        country: "India",
      });

      console.log(`Created dev employee: ${employee.email}`);
    }
  });

  console.log("\nDevelopment employee seed completed.");
  console.log("=====================================");
  console.log("DEV-ONLY temporary password (change on first login):");
  console.log(`Password: ${DEV_TEMP_PASSWORD}`);
  console.log("");
  console.log("Logins (company code is your DEV_COMPANY_CODE):");
  for (const employee of DEV_EMPLOYEES) {
    console.log(`  ${employee.email.padEnd(30)} username: ${employee.username}`);
  }
  console.log("");
  console.log("These users are flagged to force a password change at first login.");
}

seedDevEmployees()
  .catch((error) => {
    console.error("Dev employee seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await seedDb.destroy();
  });
