import { db } from "../../database/knex.js";
import { AppError } from "../../common/errors/AppError.js";
import { WhatsAppRepository } from "./whatsapp.repository.js";
import type {
  CreateWhatsAppMessageInput,
  ListWhatsAppMessagesQuery,
  WhatsAppMessageResponse,
} from "./whatsapp.types.js";

export class WhatsAppService {
  constructor(private readonly whatsappRepository: WhatsAppRepository) {}

  async listMessages(query: ListWhatsAppMessagesQuery, companyId: number): Promise<{
    messages: WhatsAppMessageResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.whatsappRepository.listMessages(query, companyId);
  }

  async createMessage(input: CreateWhatsAppMessageInput): Promise<WhatsAppMessageResponse> {
    if (!input.body?.trim()) {
      throw new AppError(400, "Message body is required");
    }

    const record = await this.whatsappRepository.createMessage({
      ...input,
      status: input.status ?? "queued",
    });

    return {
      uuid: String(record.uuid),
      customerName: String(record.customer_name),
      customerMobile: String(record.customer_mobile),
      direction: String(record.direction) as WhatsAppMessageResponse["direction"],
      status: String(record.status) as WhatsAppMessageResponse["status"],
      templateId: record.template_id,
      body: String(record.body),
      mediaUrl: record.media_url,
      sentAt: record.sent_at ? new Date(record.sent_at).toISOString() : null,
      deliveredAt: record.delivered_at ? new Date(record.delivered_at).toISOString() : null,
      readAt: record.read_at ? new Date(record.read_at).toISOString() : null,
      createdAt: new Date(record.created_at).toISOString(),
      updatedAt: record.updated_at ? new Date(record.updated_at).toISOString() : null,
    };
  }

  async getMessage(uuid: string, companyId: number): Promise<WhatsAppMessageResponse> {
    const record = await this.whatsappRepository.findMessageByUuid(uuid, companyId);

    if (!record) {
      throw new AppError(404, "WhatsApp message not found");
    }

    return {
      uuid: String(record.uuid),
      customerName: String(record.customer_name),
      customerMobile: String(record.customer_mobile),
      direction: String(record.direction) as WhatsAppMessageResponse["direction"],
      status: String(record.status) as WhatsAppMessageResponse["status"],
      templateId: record.template_id,
      body: String(record.body),
      mediaUrl: record.media_url,
      sentAt: record.sent_at ? new Date(record.sent_at).toISOString() : null,
      deliveredAt: record.delivered_at ? new Date(record.delivered_at).toISOString() : null,
      readAt: record.read_at ? new Date(record.read_at).toISOString() : null,
      createdAt: new Date(record.created_at).toISOString(),
      updatedAt: record.updated_at ? new Date(record.updated_at).toISOString() : null,
    };
  }

  async markAsSent(companyId: number, uuid: string, externalId?: string): Promise<void> {
    await this.whatsappRepository.updateStatus(companyId, uuid, "sent", {
      externalId,
      sentAt: new Date(),
    });
  }

  async markAsDelivered(companyId: number, uuid: string): Promise<void> {
    await this.whatsappRepository.updateStatus(companyId, uuid, "delivered", {
      deliveredAt: new Date(),
    });
  }

  async markAsRead(companyId: number, uuid: string): Promise<void> {
    await this.whatsappRepository.updateStatus(companyId, uuid, "read", {
      readAt: new Date(),
    });
  }

  async markAsFailed(companyId: number, uuid: string, errorMessage?: string): Promise<void> {
    await this.whatsappRepository.updateStatus(companyId, uuid, "failed", {
      errorMessage,
    });
  }

  async deleteMessage(companyId: number, uuid: string): Promise<void> {
    const record = await this.whatsappRepository.findMessageByUuid(uuid, companyId);

    if (!record) {
      throw new AppError(404, "WhatsApp message not found");
    }

    await this.whatsappRepository.softDelete(companyId, uuid);
  }
}

export const whatsappService = new WhatsAppService(new WhatsAppRepository(db));
