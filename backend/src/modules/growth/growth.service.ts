import winston, { type Logger } from "winston";
import { AppError } from "../../common/errors/AppError.js";
import { db } from "../../database/knex.js";
import { leadsService } from "../leads/leads.service.js";
import { deliverOutboundMessage, renderMessageTemplate } from "./outreach.delivery.js";
import { GrowthRepository } from "./growth.repository.js";
import type {
  CreateAppointmentInput,
  CreateCampaignInput,
  CreateFormInput,
  CreateFunnelInput,
  CreateReviewInput,
  CreateTemplateInput,
  CreateWorkflowInput,
} from "./growth.validation.js";

export class GrowthService {
  constructor(
    private readonly growthRepository: GrowthRepository,
    private readonly logger: Logger,
  ) {}

  getHubSummary(companyId: number) {
    return this.growthRepository.getHubSummary(companyId);
  }

  listTemplates(companyId: number, page: number, limit: number, channel?: string) {
    return this.growthRepository.listTemplates(companyId, page, limit, channel);
  }

  createTemplate(companyId: number, userId: number, input: CreateTemplateInput) {
    return this.growthRepository.createTemplate(companyId, userId, input);
  }

  async updateTemplate(
    companyId: number,
    uuid: string,
    userId: number,
    input: Partial<CreateTemplateInput>,
  ) {
    const updated = await this.growthRepository.updateTemplate(companyId, uuid, userId, input);
    if (!updated) throw new AppError(404, "Template not found");
    return updated;
  }

  async deleteTemplate(companyId: number, uuid: string) {
    const count = await this.growthRepository.softDeleteTemplate(companyId, uuid);
    if (!count) throw new AppError(404, "Template not found");
  }

  listCampaigns(companyId: number, page: number, limit: number, status?: string) {
    return this.growthRepository.listCampaigns(companyId, page, limit, status);
  }

  createCampaign(companyId: number, userId: number, input: CreateCampaignInput) {
    return this.growthRepository.createCampaign(companyId, userId, input);
  }

  async updateCampaign(companyId: number, uuid: string, input: Record<string, unknown>) {
    const updated = await this.growthRepository.updateCampaign(companyId, uuid, input);
    if (!updated) throw new AppError(404, "Campaign not found");
    return updated;
  }

  async runCampaign(companyId: number, uuid: string, userId: number) {
    const run = await this.growthRepository.findCampaignForRun(companyId, uuid);
    if (!run) throw new AppError(404, "Campaign not found");

    const { campaign, templateBody, templateSubject, id: campaignId } = run;
    const leads = await this.growthRepository.listLeadsForCampaign(
      companyId,
      campaign.audienceFilter,
    );

    await this.growthRepository.updateCampaign(companyId, uuid, { status: "RUNNING" });

    let sent = 0;
    let failed = 0;
    const defaultBody = `Hi {{customerName}}, ${campaign.name}`;

    for (const lead of leads) {
      const fields = {
        customerName: String(lead.customer_name),
        mobile: String(lead.mobile),
        email: lead.email as string | null,
        leadNumber: lead.lead_number != null ? String(lead.lead_number) : null,
        status: null,
      };
      const body = renderMessageTemplate(templateBody ?? defaultBody, fields);
      const subject = templateSubject
        ? renderMessageTemplate(templateSubject, fields)
        : campaign.name;

      const recipient =
        campaign.channel === "EMAIL"
          ? (lead.email as string | null)
          : (lead.mobile as string | null);
      if (!recipient) {
        failed += 1;
        continue;
      }

      const result = await deliverOutboundMessage(this.growthRepository, {
        companyId,
        userId,
        leadId: lead.id as number,
        customerName: fields.customerName,
        channel: campaign.channel,
        recipient,
        body,
        subject,
        campaignId,
      });

      if (result.status === "FAILED") failed += 1;
      else sent += 1;
    }

    await this.growthRepository.updateCampaign(companyId, uuid, {
      status: "COMPLETED",
      sent_count: sent,
    });

    this.logger.info(`Campaign ${uuid} finished`, { companyId, userId, sent, failed });
    return { sent, failed, audienceSize: leads.length };
  }

  listWorkflows(companyId: number, page: number, limit: number, status?: string) {
    return this.growthRepository.listWorkflows(companyId, page, limit, status);
  }

  createWorkflow(companyId: number, userId: number, input: CreateWorkflowInput) {
    return this.growthRepository.createWorkflow(companyId, userId, input);
  }

  async updateWorkflow(companyId: number, uuid: string, input: Record<string, unknown>) {
    const updated = await this.growthRepository.updateWorkflow(companyId, uuid, input);
    if (!updated) throw new AppError(404, "Workflow not found");
    return updated;
  }

  listForms(companyId: number, page: number, limit: number) {
    return this.growthRepository.listForms(companyId, page, limit);
  }

  createForm(companyId: number, userId: number, input: CreateFormInput) {
    return this.growthRepository.createForm(companyId, userId, input);
  }

  async updateForm(companyId: number, uuid: string, input: Record<string, unknown>) {
    const updated = await this.growthRepository.updateForm(companyId, uuid, input);
    if (!updated) throw new AppError(404, "Form not found");
    return updated;
  }

  async getPublicForm(uuid: string) {
    const form = await this.growthRepository.findFormByUuid(uuid);
    if (!form) throw new AppError(404, "Form not found");
    const { companyId: _c, id: _i, ...publicForm } = form;
    return publicForm;
  }

  async submitPublicForm(uuid: string, payload: Record<string, unknown>) {
    const form = await this.growthRepository.findFormByUuid(uuid);
    if (!form) throw new AppError(404, "Form not found");

    const name =
      String(payload.name ?? payload.customerName ?? payload.fullName ?? "Web lead").trim() ||
      "Web lead";
    const mobile = String(payload.mobile ?? payload.phone ?? "").trim();
    if (!mobile) {
      throw new AppError(400, "Mobile number is required");
    }

    const actorId = form.createdBy ?? 1;
    const lead = await leadsService.createLead(
      form.companyId,
      {
        customerName: name,
        mobile,
        email: payload.email ? String(payload.email) : null,
        leadSource: "WEB_FORM",
        notes: `Submitted via form: ${form.name}`,
      },
      actorId,
      { allowDuplicate: true },
    );

    const leadId = await this.growthRepository.resolveLeadIdForUuid(form.companyId, lead.uuid);
    await this.growthRepository.recordFormSubmission(form.companyId, form.id, payload, leadId ?? undefined);

    return { success: true, leadUuid: lead.uuid };
  }

  listFunnels(companyId: number, page: number, limit: number) {
    return this.growthRepository.listFunnels(companyId, page, limit);
  }

  createFunnel(companyId: number, input: CreateFunnelInput) {
    return this.growthRepository.createFunnel(companyId, input);
  }

  async updateFunnel(companyId: number, uuid: string, input: Record<string, unknown>) {
    const updated = await this.growthRepository.updateFunnel(companyId, uuid, input);
    if (!updated) throw new AppError(404, "Funnel not found");
    return updated;
  }

  listAppointments(companyId: number, page: number, limit: number, from?: string, to?: string) {
    return this.growthRepository.listAppointments(companyId, page, limit, from, to);
  }

  createAppointment(companyId: number, userId: number, input: CreateAppointmentInput) {
    return this.growthRepository.createAppointment(companyId, userId, input);
  }

  async updateAppointment(companyId: number, uuid: string, input: Record<string, unknown>) {
    const updated = await this.growthRepository.updateAppointment(companyId, uuid, input);
    if (!updated) throw new AppError(404, "Appointment not found");
    return updated;
  }

  listReviews(companyId: number, page: number, limit: number) {
    return this.growthRepository.listReviews(companyId, page, limit);
  }

  createReview(companyId: number, input: CreateReviewInput) {
    return this.growthRepository.createReview(companyId, input);
  }

  async updateReview(companyId: number, uuid: string, input: Record<string, unknown>) {
    const updated = await this.growthRepository.updateReview(companyId, uuid, input);
    if (!updated) throw new AppError(404, "Review not found");
    return updated;
  }

  listInbox(companyId: number, limit: number, channel?: string) {
    return this.growthRepository.listInboxThreads(companyId, limit, channel);
  }

  getInboxThread(companyId: number, channel: string, recipient: string) {
    return this.growthRepository.listInboxMessages(companyId, channel, recipient);
  }

  async replyInbox(
    companyId: number,
    userId: number,
    input: {
      channel: "EMAIL" | "SMS" | "WHATSAPP";
      recipient: string;
      body: string;
      customerName: string;
      leadUuid?: string | null;
    },
  ) {
    const leadId = input.leadUuid
      ? await this.growthRepository.resolveLeadIdForUuid(companyId, input.leadUuid)
      : null;

    const result = await deliverOutboundMessage(this.growthRepository, {
      companyId,
      userId,
      leadId: leadId ?? undefined,
      customerName: input.customerName,
      channel: input.channel,
      recipient: input.recipient,
      body: input.body,
    });

    if (result.status === "FAILED") {
      throw new AppError(502, result.error ?? "Failed to send message");
    }

    return result;
  }
}

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
});

export const growthService = new GrowthService(new GrowthRepository(db), logger);
