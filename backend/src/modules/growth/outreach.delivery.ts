import { whatsappService } from "../whatsapp/whatsapp.service.js";
import { sendTransactionalSms } from "./sms.provider.js";
import type { GrowthRepository } from "./growth.repository.js";

export type LeadMergeFields = {
  customerName: string;
  mobile: string;
  email?: string | null;
  leadNumber?: string | null;
  status?: string | null;
};

export function renderMessageTemplate(template: string, fields: LeadMergeFields): string {
  return template
    .replace(/\{\{\s*customerName\s*\}\}/gi, fields.customerName)
    .replace(/\{\{\s*name\s*\}\}/gi, fields.customerName)
    .replace(/\{\{\s*mobile\s*\}\}/gi, fields.mobile)
    .replace(/\{\{\s*email\s*\}\}/gi, fields.email ?? "")
    .replace(/\{\{\s*leadNumber\s*\}\}/gi, fields.leadNumber ?? "")
    .replace(/\{\{\s*status\s*\}\}/gi, fields.status ?? "");
}

export type DeliverOutboundInput = {
  companyId: number;
  userId?: number;
  leadId?: number;
  customerName: string;
  channel: "EMAIL" | "SMS" | "WHATSAPP";
  recipient: string;
  body: string;
  subject?: string | null;
  campaignId?: number;
};

export async function deliverOutboundMessage(
  growthRepository: GrowthRepository,
  input: DeliverOutboundInput,
): Promise<{ status: "SENT" | "QUEUED" | "FAILED"; error?: string }> {
  const trimmedBody = input.body.trim();
  if (!trimmedBody) {
    return { status: "FAILED", error: "Empty message body" };
  }

  try {
    if (input.channel === "WHATSAPP") {
      const message = await whatsappService.createMessage({
        companyId: input.companyId,
        userId: input.userId,
        leadId: input.leadId,
        customerName: input.customerName,
        customerMobile: input.recipient,
        direction: "outbound",
        status: "queued",
        body: trimmedBody,
      });
      await whatsappService.markAsSent(input.companyId, message.uuid);
      await growthRepository.insertOutreachMessage({
        companyId: input.companyId,
        campaignId: input.campaignId,
        leadId: input.leadId,
        channel: "WHATSAPP",
        recipient: input.recipient,
        body: trimmedBody,
        status: "SENT",
      });
      return { status: "SENT" };
    }

    if (input.channel === "SMS") {
      const sms = await sendTransactionalSms(input.recipient, trimmedBody);
      const outreachStatus =
        sms.outcome === "sent" ? "SENT" : sms.outcome === "queued" ? "QUEUED" : "FAILED";

      await growthRepository.insertOutreachMessage({
        companyId: input.companyId,
        campaignId: input.campaignId,
        leadId: input.leadId,
        channel: "SMS",
        recipient: input.recipient,
        body: trimmedBody,
        status: outreachStatus,
      });

      if (sms.outcome === "failed") {
        return { status: "FAILED", error: sms.error };
      }
      if (sms.outcome === "queued") {
        return { status: "QUEUED" };
      }
      return { status: "SENT" };
    }

    await growthRepository.insertOutreachMessage({
      companyId: input.companyId,
      campaignId: input.campaignId,
      leadId: input.leadId,
      channel: input.channel,
      recipient: input.recipient,
      subject: input.subject ?? undefined,
      body: trimmedBody,
      status: "QUEUED",
    });
    return { status: "QUEUED" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delivery failed";
    await growthRepository.insertOutreachMessage({
      companyId: input.companyId,
      campaignId: input.campaignId,
      leadId: input.leadId,
      channel: input.channel,
      recipient: input.recipient,
      subject: input.subject ?? undefined,
      body: trimmedBody,
      status: "FAILED",
    });
    return { status: "FAILED", error: message };
  }
}
