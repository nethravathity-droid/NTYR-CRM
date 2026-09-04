import type { Knex } from "knex";
import type {
  CreateWhatsAppMessageInput,
  ListWhatsAppMessagesQuery,
  WhatsAppMessageRecord,
  WhatsAppMessageResponse,
} from "./whatsapp.types.js";

export class WhatsAppRepository {
  constructor(private readonly db: Knex) {}

  async createMessage(input: CreateWhatsAppMessageInput): Promise<WhatsAppMessageRecord> {
    const [row] = await this.db("whatsapp_messages")
      .insert({
        company_id: input.companyId,
        user_id: input.userId ?? null,
        lead_id: input.leadId ?? null,
        customer_name: input.customerName,
        customer_mobile: input.customerMobile,
        direction: input.direction ?? "outbound",
        status: input.status ?? "queued",
        template_id: input.templateId ?? null,
        body: input.body,
        media_url: input.mediaUrl ?? null,
        external_id: input.externalId ?? null,
        sent_at: input.sentAt ?? null,
        delivered_at: input.deliveredAt ?? null,
        read_at: input.readAt ?? null,
      })
      .returning("*");

    return row as WhatsAppMessageRecord;
  }

  async findMessageByUuid(uuid: string, companyId: number): Promise<WhatsAppMessageRecord | null> {
    const message = await this.db<WhatsAppMessageRecord>("whatsapp_messages")
      .where({ uuid, company_id: companyId })
      .whereNull("deleted_at")
      .first();

    return message ?? null;
  }

  async listMessages(query: ListWhatsAppMessagesQuery, companyId: number): Promise<{
    messages: WhatsAppMessageResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const offset = (page - 1) * limit;

    const qb = this.db("whatsapp_messages")
      .where("company_id", companyId)
      .whereNull("deleted_at")
      .orderBy("created_at", "desc");

    if (query.search) {
      const term = `%${query.search}%`;
      qb.where(function search() {
        this.whereILike("customer_name", term)
          .orWhereILike("customer_mobile", term)
          .orWhereILike("body", term);
      });
    }

    if (query.direction) {
      qb.where("direction", query.direction);
    }

    if (query.status) {
      qb.where("status", query.status);
    }

    if (query.startDate) {
      qb.where("created_at", ">=", query.startDate);
    }

    if (query.endDate) {
      qb.where("created_at", "<=", query.endDate);
    }

    if (query.leadId) {
      qb.where("lead_id", query.leadId);
    }

    const totalQuery = qb.clone();
    const { total } = await totalQuery.count("id as total").first<{ total: string }>();
    const rows = await qb.clone().limit(limit).offset(offset);

    const messages: WhatsAppMessageResponse[] = rows.map((row) => ({
      uuid: String(row.uuid),
      customerName: String(row.customer_name),
      customerMobile: String(row.customer_mobile),
      direction: String(row.direction) as WhatsAppMessageResponse["direction"],
      status: String(row.status) as WhatsAppMessageResponse["status"],
      templateId: row.template_id ? String(row.template_id) : null,
      body: String(row.body),
      mediaUrl: row.media_url ? String(row.media_url) : null,
      sentAt: row.sent_at ? new Date(String(row.sent_at)).toISOString() : null,
      deliveredAt: row.delivered_at ? new Date(String(row.delivered_at)).toISOString() : null,
      readAt: row.read_at ? new Date(String(row.read_at)).toISOString() : null,
      createdAt: new Date(String(row.created_at)).toISOString(),
      updatedAt: row.updated_at ? new Date(String(row.updated_at)).toISOString() : null,
    }));

    return {
      messages,
      total: Number(total),
      page,
      limit,
    };
  }

  async updateStatus(
    companyId: number,
    uuid: string,
    status: WhatsAppMessageRecord["status"],
    extra: {
      externalId?: string;
      errorMessage?: string;
      sentAt?: Date;
      deliveredAt?: Date;
      readAt?: Date;
    } = {},
  ): Promise<void> {
    const update: Record<string, unknown> = {
      status,
      updated_at: this.db.fn.now(),
    };

    if (extra.externalId !== undefined) update.external_id = extra.externalId;
    if (extra.errorMessage !== undefined) update.error_message = extra.errorMessage;
    if (extra.sentAt !== undefined) update.sent_at = extra.sentAt;
    if (extra.deliveredAt !== undefined) update.delivered_at = extra.deliveredAt;
    if (extra.readAt !== undefined) update.read_at = extra.readAt;

    await this.db("whatsapp_messages")
      .where({ uuid, company_id: companyId })
      .update(update);
  }

  async softDelete(companyId: number, uuid: string): Promise<void> {
    await this.db("whatsapp_messages")
      .where({ uuid, company_id: companyId })
      .update({ deleted_at: this.db.fn.now() });
  }
}
