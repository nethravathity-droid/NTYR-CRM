import type { Knex } from "knex";
import { AppError } from "../../common/errors/AppError.js";

const FULL_ACCESS = {
  can_view: true,
  can_create: true,
  can_update: true,
  can_delete: true,
  can_export: true,
  can_approve: true,
} as const;

type RoleDefinition = {
  roleCode: string;
  roleName: string;
  description: string;
  permissionCodes: readonly string[];
};

type DesignationDefinition = {
  code: string;
  name: string;
};

type DepartmentDefinition = {
  code: string;
  name: string;
};

const TENANT_DESIGNATIONS: DesignationDefinition[] = [
  { code: "MGR", name: "Sales Manager" },
  { code: "TC", name: "Telecaller" },
  { code: "SE", name: "Sales Executive" },
];

const TENANT_DEPARTMENTS: DepartmentDefinition[] = [
  { code: "SALES", name: "Sales" },
  { code: "TEL", name: "Telecalling" },
];

const TENANT_ROLES: RoleDefinition[] = [
  {
    roleCode: "MANAGER",
    roleName: "Manager",
    description: "Team manager with pipeline and reporting access",
    permissionCodes: [
      "users.view",
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
      "reports.view",
      "reports.export",
      "calls.view",
      "calls.create",
      "calls.update",
      "calls.delete",
    ],
  },
  {
    roleCode: "TELECALLER",
    roleName: "Telecaller",
    description: "Lead generation and call desk workspace",
    permissionCodes: [
      "leads.view",
      "leads.create",
      "leads.update",
      "calls.view",
      "calls.create",
      "calls.update",
    ],
  },
  {
    roleCode: "SALES_EXECUTIVE",
    roleName: "Sales Executive",
    description: "Site visits, bookings, and sales pipeline",
    permissionCodes: [
      "leads.view",
      "leads.create",
      "leads.update",
      "calls.view",
      "calls.create",
      "calls.update",
      "projects.view",
      "visits.view",
      "visits.create",
      "visits.update",
      "bookings.view",
      "bookings.create",
      "bookings.update",
      "payments.view",
      "payments.create",
    ],
  },
];

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

/** Ensures standard CRM roles, designations, and departments exist for a tenant. */
export async function ensureTenantEmployeeDefaults(
  db: Knex,
  companyId: number,
): Promise<void> {
  const branch = await db("branches")
    .where({ company_id: companyId, branch_code: "MAIN" })
    .whereNull("deleted_at")
    .first<{ id: number }>("id");

  if (!branch) {
    return;
  }

  await db.transaction(async (trx) => {
    for (const department of TENANT_DEPARTMENTS) {
      await findOrCreateId(
        trx,
        "departments",
        { branch_id: branch.id, department_code: department.code },
        {
          company_id: companyId,
          branch_id: branch.id,
          department_code: department.code,
          department_name: department.name,
          status: "ACTIVE",
        },
      );
    }

    for (const designation of TENANT_DESIGNATIONS) {
      await findOrCreateId(
        trx,
        "designations",
        { company_id: companyId, designation_code: designation.code },
        {
          company_id: companyId,
          designation_code: designation.code,
          designation_name: designation.name,
          status: "ACTIVE",
        },
      );
    }

    for (const role of TENANT_ROLES) {
      const roleId = await findOrCreateId(
        trx,
        "roles",
        { company_id: companyId, role_code: role.roleCode },
        {
          company_id: companyId,
          role_code: role.roleCode,
          role_name: role.roleName,
          description: role.description,
          is_system: true,
          status: "ACTIVE",
        },
      );

      await ensureRolePermissions(trx, roleId, role.permissionCodes);
    }
  });
}
