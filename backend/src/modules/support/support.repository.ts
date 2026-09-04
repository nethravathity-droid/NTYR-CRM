import type { Knex } from "knex";
import type {
  CompanyThread,
  SupportMessageRecord,
  ThreadMessage,
} from "./support.types.js";

export class SupportRepository {
  constructor(private readonly db: Knex) {}

  async listCompanyThreads(query: {
    search?: string;
    status?: string;
  }): Promise<CompanyThread[]> {
    const rows = await this.db("companies as c")
      .leftJoin("users as admin", function joinAdmin() {
        this.on("admin.company_id", "=", "c.id")
          .andOnVal("admin.role", "COMPANY_ADMIN")
          .andOnNull("admin.deleted_at");
      })
      .leftJoin(
        this.db("support_messages as sm")
          .whereNull("sm.deleted_at")
          .select(
            "sm.company_id",
            "sm.body",
            "sm.sender_role",
            "sm.is_read_by_super_admin",
            "sm.created_at",
          )
          .orderBy("sm.created_at", "desc")
          .as("last_msg"),
        "last_msg.company_id",
        "c.id",
      )
      .whereNull("c.deleted_at")
      .where("c.company_code", "!=", "PLATFORM")
      .modify((qb) => {
        if (query.search) {
          const term = `%${query.search}%`;
          qb.where(function search() {
            this.whereILike("c.company_name", term)
              .orWhereILike("c.company_code", term)
              .orWhereILike("c.owner_name", term);
          });
        }
        if (query.status) {
          qb.where("c.status", query.status);
        }
      })
      .groupBy(
        "c.id",
        "c.uuid",
        "c.company_code",
        "c.company_name",
        "c.owner_name",
        "c.status",
        "last_msg.body",
        "last_msg.sender_role",
        "last_msg.is_read_by_super_admin",
        "last_msg.created_at",
        "admin.display_name",
        "admin.email",
      )
      .select([
        "c.id as company_id",
        "c.uuid as company_uuid",
        "c.company_code",
        "c.company_name",
        "c.owner_name",
        "c.status",
        "last_msg.body as last_body",
        "last_msg.sender_role as last_role",
        "last_msg.is_read_by_super_admin as last_read",
        "last_msg.created_at as last_created_at",
        "admin.display_name as admin_display_name",
        "admin.email as admin_email",
      ])
      .orderByRaw("COALESCE(last_msg.created_at, c.created_at) DESC NULLS LAST");

    const unreadCounts = await this.db("support_messages")
      .whereNull("deleted_at")
      .where("is_read_by_super_admin", false)
      .where("sender_role", "COMPANY_ADMIN")
      .groupBy("company_id")
      .select("company_id")
      .count("id as unread");

    const unreadMap = new Map<number, number>();
    for (const row of unreadCounts as Array<{ company_id: number; unread: string }>) {
      unreadMap.set(Number(row.company_id), Number(row.unread));
    }

    return rows.map((row: Record<string, unknown>) => ({
      companyUuid: String(row.company_uuid),
      companyCode: String(row.company_code),
      companyName: String(row.company_name),
      ownerName: row.admin_display_name
        ? String(row.admin_display_name)
        : String(row.owner_name),
      status: String(row.status),
      lastMessage: row.last_body ? String(row.last_body) : null,
      lastMessageAt: row.last_created_at ? new Date(String(row.last_created_at)).toISOString() : null,
      lastMessageFrom: row.last_role ? String(row.last_role) : null,
      unreadCount: unreadMap.get(Number(row.company_id)) ?? 0,
    })) as CompanyThread[];
  }

  async getCompanyByUuid(uuid: string): Promise<{ id: number } | null> {
    const company = await this.db("companies")
      .where({ uuid })
      .whereNull("deleted_at")
      .first<{ id: number }>();
    return company ?? null;
  }

  async listThreadMessages(companyId: number): Promise<ThreadMessage[]> {
    const rows = await this.db("support_messages as sm")
      .leftJoin("users as u", "u.id", "sm.sender_user_id")
      .where("sm.company_id", companyId)
      .whereNull("sm.deleted_at")
      .orderBy("sm.created_at", "asc")
      .select([
        "sm.uuid",
        "sm.sender_role",
        "sm.body",
        "sm.created_at",
        "u.display_name",
        "u.email",
      ]);

    return rows.map((row: Record<string, unknown>) => ({
      uuid: String(row.uuid),
      senderRole: String(row.sender_role) as ThreadMessage["senderRole"],
      senderName: row.display_name ? String(row.display_name) : String(row.email ?? "User"),
      body: String(row.body),
      createdAt: new Date(String(row.created_at)).toISOString(),
    }));
  }

  async insertMessage(data: {
    companyId: number;
    senderUserId: number;
    senderRole: SupportMessageRecord["sender_role"];
    body: string;
  }): Promise<ThreadMessage> {
    const [inserted] = await this.db("support_messages")
      .insert({
        company_id: data.companyId,
        sender_user_id: data.senderUserId,
        sender_role: data.senderRole,
        body: data.body,
        is_read_by_super_admin: data.senderRole === "PLATFORM_SUPER_ADMIN",
        is_read_by_company_admin: data.senderRole === "COMPANY_ADMIN",
      })
      .returning(["uuid", "created_at"]);

    return {
      uuid: String(inserted.uuid),
      senderRole: data.senderRole,
      senderName: "You",
      body: data.body,
      createdAt: new Date(inserted.created_at).toISOString(),
    };
  }

  async markThreadRead(companyId: number, readerRole: string): Promise<void> {
    const column =
      readerRole === "PLATFORM_SUPER_ADMIN"
        ? "is_read_by_super_admin"
        : "is_read_by_company_admin";

    await this.db("support_messages")
      .where("company_id", companyId)
      .whereNull("deleted_at")
      .where(column, false)
      .whereNot("sender_role", readerRole)
      .update({ [column]: true, updated_at: this.db.fn.now() });
  }

  async countUnreadThreads(): Promise<number> {
    const rows = await this.db("support_messages")
      .whereNull("deleted_at")
      .where("is_read_by_super_admin", false)
      .where("sender_role", "COMPANY_ADMIN")
      .countDistinct("company_id as total");
    return Number((rows[0] as { total: string }).total ?? 0);
  }

  async listAllCompanies(): Promise<Array<{ id: number; uuid: string }>> {
    const rows = await this.db("companies")
      .whereNull("deleted_at")
      .where("company_code", "!=", "PLATFORM")
      .select("id", "uuid");
    return rows as Array<{ id: number; uuid: string }>;
  }

  async broadcastMessage(data: {
    companyIds: number[];
    senderUserId: number;
    body: string;
  }): Promise<number> {
    const rows = data.companyIds.map((companyId) => ({
      company_id: companyId,
      sender_user_id: data.senderUserId,
      sender_role: "PLATFORM_SUPER_ADMIN",
      body: data.body,
      is_read_by_super_admin: true,
      is_read_by_company_admin: false,
    }));

    if (rows.length === 0) {
      return 0;
    }

    await this.db("support_messages").insert(rows);
    return rows.length;
  }
}
