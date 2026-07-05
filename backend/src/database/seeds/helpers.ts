import type { Knex } from "knex";

type IdRow = { id: number };

export async function findById(
  trx: Knex.Transaction,
  table: string,
  where: Record<string, unknown>,
): Promise<number | null> {
  const row = await trx(table).where(where).whereNull("deleted_at").first<IdRow>();
  return row?.id ?? null;
}

export async function findByIdAllowDeleted(
  trx: Knex.Transaction,
  table: string,
  where: Record<string, unknown>,
): Promise<number | null> {
  const row = await trx(table).where(where).first<IdRow>();
  return row?.id ?? null;
}

export async function findOrCreate(
  trx: Knex.Transaction,
  table: string,
  where: Record<string, unknown>,
  insert: Record<string, unknown>,
): Promise<{ id: number; created: boolean }> {
  const existing = await trx(table).where(where).first<IdRow>();

  if (existing) {
    return { id: existing.id, created: false };
  }

  const [created] = await trx(table).insert(insert).returning("id");
  return { id: created.id, created: true };
}

export async function ensureRolePermission(
  trx: Knex.Transaction,
  roleId: number,
  permissionId: number,
  grants: {
    can_view: boolean;
    can_create: boolean;
    can_update: boolean;
    can_delete: boolean;
    can_export: boolean;
    can_approve: boolean;
  },
): Promise<boolean> {
  const existing = await trx("role_permissions")
    .where({ role_id: roleId, permission_id: permissionId })
    .first<IdRow>();

  if (existing) {
    return false;
  }

  await trx("role_permissions").insert({
    role_id: roleId,
    permission_id: permissionId,
    ...grants,
  });

  return true;
}
