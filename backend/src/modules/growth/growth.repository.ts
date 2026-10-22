import type { Knex } from "knex";
import type {
  AutomationWorkflow,
  GrowthHubSummary,
  InboxThread,
  MarketingCampaign,
  MessageTemplate,
  ReputationReview,
  SalesFunnel,
  ScheduledAppointment,
  WebForm,
} from "./growth.types.js";
import type {
  CreateAppointmentInput,
  CreateCampaignInput,
  CreateFormInput,
  CreateFunnelInput,
  CreateReviewInput,
  CreateTemplateInput,
  CreateWorkflowInput,
} from "./growth.validation.js";

function toIso(value: Date | string | null | undefined): string {
  if (!value) return new Date(0).toISOString();
  return value instanceof Date ? value.toISOString() : String(value);
}

export class GrowthRepository {
  constructor(private readonly db: Knex) {}

  async getHubSummary(companyId: number): Promise<GrowthHubSummary> {
    const [templates, campaigns, workflows, forms, funnels, appointments, reviews, rating] =
      await Promise.all([
        this.db("message_templates").where({ company_id: companyId }).whereNull("deleted_at").count("id as c").first(),
        this.db("marketing_campaigns").where({ company_id: companyId }).whereNull("deleted_at").count("id as c").first(),
        this.db("automation_workflows").where({ company_id: companyId }).whereNull("deleted_at").count("id as c").first(),
        this.db("web_forms").where({ company_id: companyId }).whereNull("deleted_at").count("id as c").first(),
        this.db("sales_funnels").where({ company_id: companyId }).whereNull("deleted_at").count("id as c").first(),
        this.db("scheduled_appointments").where({ company_id: companyId }).whereNull("deleted_at").count("id as c").first(),
        this.db("reputation_reviews").where({ company_id: companyId }).whereNull("deleted_at").count("id as c").first(),
        this.db("reputation_reviews")
          .where({ company_id: companyId, status: "PUBLISHED" })
          .whereNull("deleted_at")
          .avg("rating as avg")
          .first<{ avg: string | null }>(),
      ]);

    return {
      templates: Number(templates?.c ?? 0),
      campaigns: Number(campaigns?.c ?? 0),
      workflows: Number(workflows?.c ?? 0),
      forms: Number(forms?.c ?? 0),
      funnels: Number(funnels?.c ?? 0),
      appointments: Number(appointments?.c ?? 0),
      reviews: Number(reviews?.c ?? 0),
      averageRating: rating?.avg != null ? Number(rating.avg) : null,
    };
  }

  // Templates
  async listTemplates(companyId: number, page: number, limit: number, channel?: string) {
    const q = this.db("message_templates").where({ company_id: companyId }).whereNull("deleted_at");
    if (channel) q.andWhere("channel", channel);
    const total = Number((await q.clone().count("id as c").first())?.c ?? 0);
    const rows = await q.orderBy("created_at", "desc").limit(limit).offset((page - 1) * limit);
    return { items: rows.map(this.mapTemplate), total };
  }

  async createTemplate(companyId: number, userId: number, input: CreateTemplateInput) {
    const [row] = await this.db("message_templates")
      .insert({
        company_id: companyId,
        name: input.name,
        channel: input.channel,
        subject: input.subject ?? null,
        body: input.body,
        created_by: userId,
        updated_by: userId,
      })
      .returning("*");
    return this.mapTemplate(row);
  }

  async updateTemplate(companyId: number, uuid: string, userId: number, patch: Partial<CreateTemplateInput>) {
    const [row] = await this.db("message_templates")
      .where({ company_id: companyId, uuid })
      .whereNull("deleted_at")
      .update({
        ...patch,
        subject: patch.subject === undefined ? undefined : patch.subject,
        updated_by: userId,
        updated_at: this.db.fn.now(),
      })
      .returning("*");
    return row ? this.mapTemplate(row) : null;
  }

  async softDeleteTemplate(companyId: number, uuid: string) {
    return this.db("message_templates")
      .where({ company_id: companyId, uuid })
      .whereNull("deleted_at")
      .update({ deleted_at: this.db.fn.now() });
  }

  private mapTemplate(row: Record<string, unknown>): MessageTemplate {
    return {
      uuid: String(row.uuid),
      name: String(row.name),
      channel: row.channel as MessageTemplate["channel"],
      subject: row.subject != null ? String(row.subject) : null,
      body: String(row.body),
      status: row.status as MessageTemplate["status"],
      createdAt: toIso(row.created_at as Date),
      updatedAt: toIso(row.updated_at as Date),
    };
  }

  // Campaigns
  async listCampaigns(companyId: number, page: number, limit: number, status?: string) {
    const q = this.db("marketing_campaigns as c")
      .leftJoin("message_templates as t", "t.id", "c.template_id")
      .where("c.company_id", companyId)
      .whereNull("c.deleted_at");
    if (status) q.andWhere("c.status", status);
    const total = Number((await q.clone().count("c.id as c").first())?.c ?? 0);
    const rows = await q
      .select("c.*", "t.uuid as template_uuid")
      .orderBy("c.created_at", "desc")
      .limit(limit)
      .offset((page - 1) * limit);
    return { items: rows.map(this.mapCampaign), total };
  }

  async createCampaign(companyId: number, userId: number, input: CreateCampaignInput) {
    const templateId = input.templateUuid
      ? await this.resolveTemplateId(companyId, input.templateUuid)
      : null;
    const [row] = await this.db("marketing_campaigns")
      .insert({
        company_id: companyId,
        name: input.name,
        channel: input.channel,
        template_id: templateId,
        audience_filter: JSON.stringify(input.audienceFilter ?? {}),
        scheduled_at: input.scheduledAt ?? null,
        status: input.scheduledAt ? "SCHEDULED" : "DRAFT",
        created_by: userId,
      })
      .returning("*");
    const templateUuid = input.templateUuid ?? null;
    return this.mapCampaign({ ...row, template_uuid: templateUuid });
  }

  async updateCampaign(companyId: number, uuid: string, patch: Record<string, unknown>) {
    if (patch.templateUuid !== undefined) {
      patch.template_id = patch.templateUuid
        ? await this.resolveTemplateId(companyId, String(patch.templateUuid))
        : null;
      delete patch.templateUuid;
    }
    if (patch.audienceFilter !== undefined) {
      patch.audience_filter = JSON.stringify(patch.audienceFilter);
      delete patch.audienceFilter;
    }
    if (patch.scheduledAt !== undefined) {
      patch.scheduled_at = patch.scheduledAt;
      delete patch.scheduledAt;
    }
    const [row] = await this.db("marketing_campaigns")
      .where({ company_id: companyId, uuid })
      .whereNull("deleted_at")
      .update(patch)
      .returning("*");
    return row ? this.mapCampaign(row) : null;
  }

  async findCampaign(companyId: number, uuid: string) {
    const row = await this.db("marketing_campaigns")
      .where({ company_id: companyId, uuid })
      .whereNull("deleted_at")
      .first();
    return row ? this.mapCampaign(row) : null;
  }

  async findCampaignForRun(companyId: number, uuid: string) {
    const row = await this.db("marketing_campaigns as c")
      .leftJoin("message_templates as t", "t.id", "c.template_id")
      .where("c.company_id", companyId)
      .where("c.uuid", uuid)
      .whereNull("c.deleted_at")
      .select("c.*", "t.uuid as template_uuid", "t.body as template_body", "t.subject as template_subject")
      .first();

    if (!row) return null;

    return {
      id: Number(row.id),
      campaign: this.mapCampaign(row),
      templateBody: row.template_body != null ? String(row.template_body) : null,
      templateSubject: row.template_subject != null ? String(row.template_subject) : null,
    };
  }

  async findTemplateByUuid(companyId: number, uuid: string) {
    const row = await this.db("message_templates")
      .where({ company_id: companyId, uuid })
      .whereNull("deleted_at")
      .first();
    if (!row) return null;
    return {
      uuid: String(row.uuid),
      body: String(row.body),
      subject: row.subject != null ? String(row.subject) : null,
      channel: String(row.channel),
    };
  }

  private mapCampaign(row: Record<string, unknown>): MarketingCampaign {
    return {
      uuid: String(row.uuid),
      name: String(row.name),
      channel: row.channel as MarketingCampaign["channel"],
      templateUuid: row.template_uuid != null ? String(row.template_uuid) : null,
      audienceFilter:
        typeof row.audience_filter === "string"
          ? JSON.parse(row.audience_filter)
          : (row.audience_filter as Record<string, unknown>) ?? {},
      status: row.status as MarketingCampaign["status"],
      scheduledAt: row.scheduled_at ? toIso(row.scheduled_at as Date) : null,
      sentCount: Number(row.sent_count ?? 0),
      createdAt: toIso(row.created_at as Date),
    };
  }

  async incrementCampaignSent(companyId: number, campaignId: number, count: number) {
    await this.db("marketing_campaigns")
      .where({ company_id: companyId, id: campaignId })
      .increment("sent_count", count);
  }

  // Workflows
  async listWorkflows(companyId: number, page: number, limit: number, status?: string) {
    const q = this.db("automation_workflows").where({ company_id: companyId }).whereNull("deleted_at");
    if (status) q.andWhere("status", status);
    const total = Number((await q.clone().count("id as c").first())?.c ?? 0);
    const rows = await q.orderBy("created_at", "desc").limit(limit).offset((page - 1) * limit);
    return { items: rows.map(this.mapWorkflow), total };
  }

  async createWorkflow(companyId: number, userId: number, input: CreateWorkflowInput) {
    const [row] = await this.db("automation_workflows")
      .insert({
        company_id: companyId,
        name: input.name,
        description: input.description ?? null,
        trigger_type: input.triggerType,
        trigger_config: JSON.stringify(input.triggerConfig ?? {}),
        actions: JSON.stringify(input.actions ?? []),
        status: input.status ?? "DRAFT",
        created_by: userId,
      })
      .returning("*");
    return this.mapWorkflow(row);
  }

  async updateWorkflow(companyId: number, uuid: string, patch: Record<string, unknown>) {
    if (patch.triggerType !== undefined) {
      patch.trigger_type = patch.triggerType;
      delete patch.triggerType;
    }
    if (patch.triggerConfig !== undefined) {
      patch.trigger_config = JSON.stringify(patch.triggerConfig);
      delete patch.triggerConfig;
    }
    if (patch.actions !== undefined) {
      patch.actions = JSON.stringify(patch.actions);
    }
    const [row] = await this.db("automation_workflows")
      .where({ company_id: companyId, uuid })
      .whereNull("deleted_at")
      .update({ ...patch, updated_at: this.db.fn.now() })
      .returning("*");
    return row ? this.mapWorkflow(row) : null;
  }

  private mapWorkflow(row: Record<string, unknown>): AutomationWorkflow {
    return {
      uuid: String(row.uuid),
      name: String(row.name),
      description: row.description != null ? String(row.description) : null,
      triggerType: String(row.trigger_type),
      triggerConfig:
        typeof row.trigger_config === "string"
          ? JSON.parse(row.trigger_config)
          : (row.trigger_config as Record<string, unknown>) ?? {},
      actions:
        typeof row.actions === "string" ? JSON.parse(row.actions) : (row.actions as unknown[]) ?? [],
      status: row.status as AutomationWorkflow["status"],
      runCount: Number(row.run_count ?? 0),
      createdAt: toIso(row.created_at as Date),
    };
  }

  // Forms
  async listForms(companyId: number, page: number, limit: number) {
    const q = this.db("web_forms").where({ company_id: companyId }).whereNull("deleted_at");
    const total = Number((await q.clone().count("id as c").first())?.c ?? 0);
    const rows = await q.orderBy("created_at", "desc").limit(limit).offset((page - 1) * limit);
    return { items: rows.map(this.mapForm), total };
  }

  async createForm(companyId: number, userId: number, input: CreateFormInput) {
    const [row] = await this.db("web_forms")
      .insert({
        company_id: companyId,
        name: input.name,
        slug: input.slug,
        fields: JSON.stringify(input.fields ?? []),
        settings: JSON.stringify(input.settings ?? {}),
        created_by: userId,
      })
      .returning("*");
    return this.mapForm(row);
  }

  async updateForm(companyId: number, uuid: string, patch: Record<string, unknown>) {
    if (patch.fields !== undefined) patch.fields = JSON.stringify(patch.fields);
    if (patch.settings !== undefined) patch.settings = JSON.stringify(patch.settings);
    const [row] = await this.db("web_forms")
      .where({ company_id: companyId, uuid })
      .whereNull("deleted_at")
      .update({ ...patch, updated_at: this.db.fn.now() })
      .returning("*");
    return row ? this.mapForm(row) : null;
  }

  async findFormByUuid(uuid: string, companyId?: number) {
    const q = this.db("web_forms").where({ uuid, status: "ACTIVE" }).whereNull("deleted_at");
    if (companyId) q.andWhere("company_id", companyId);
    const row = await q.first();
    return row
      ? {
          ...this.mapForm(row),
          companyId: Number(row.company_id),
          id: Number(row.id),
          createdBy: row.created_by != null ? Number(row.created_by) : null,
        }
      : null;
  }

  async recordFormSubmission(companyId: number, formId: number, payload: Record<string, unknown>, leadId?: number) {
    await this.db("web_form_submissions").insert({
      company_id: companyId,
      form_id: formId,
      lead_id: leadId ?? null,
      payload: JSON.stringify(payload),
    });
    await this.db("web_forms").where({ id: formId }).increment("submission_count", 1);
  }

  private mapForm(row: Record<string, unknown>): WebForm {
    return {
      uuid: String(row.uuid),
      name: String(row.name),
      slug: String(row.slug),
      fields: typeof row.fields === "string" ? JSON.parse(row.fields) : (row.fields as unknown[]) ?? [],
      settings:
        typeof row.settings === "string"
          ? JSON.parse(row.settings)
          : (row.settings as Record<string, unknown>) ?? {},
      submissionCount: Number(row.submission_count ?? 0),
      status: row.status as WebForm["status"],
      createdAt: toIso(row.created_at as Date),
    };
  }

  // Funnels
  async listFunnels(companyId: number, page: number, limit: number) {
    const q = this.db("sales_funnels").where({ company_id: companyId }).whereNull("deleted_at");
    const total = Number((await q.clone().count("id as c").first())?.c ?? 0);
    const rows = await q.orderBy("created_at", "desc").limit(limit).offset((page - 1) * limit);
    return { items: rows.map(this.mapFunnel), total };
  }

  async createFunnel(companyId: number, input: CreateFunnelInput) {
    const [row] = await this.db("sales_funnels")
      .insert({
        company_id: companyId,
        name: input.name,
        description: input.description ?? null,
        stages: JSON.stringify(input.stages ?? []),
      })
      .returning("*");
    return this.mapFunnel(row);
  }

  async updateFunnel(companyId: number, uuid: string, patch: Record<string, unknown>) {
    if (patch.stages !== undefined) patch.stages = JSON.stringify(patch.stages);
    const [row] = await this.db("sales_funnels")
      .where({ company_id: companyId, uuid })
      .whereNull("deleted_at")
      .update({ ...patch, updated_at: this.db.fn.now() })
      .returning("*");
    return row ? this.mapFunnel(row) : null;
  }

  private mapFunnel(row: Record<string, unknown>): SalesFunnel {
    return {
      uuid: String(row.uuid),
      name: String(row.name),
      description: row.description != null ? String(row.description) : null,
      stages: typeof row.stages === "string" ? JSON.parse(row.stages) : (row.stages as unknown[]) ?? [],
      status: row.status as SalesFunnel["status"],
      createdAt: toIso(row.created_at as Date),
    };
  }

  // Appointments
  async listAppointments(companyId: number, page: number, limit: number, from?: string, to?: string) {
    const q = this.db("scheduled_appointments as a")
      .leftJoin("leads as l", "l.id", "a.lead_id")
      .leftJoin("users as u", "u.id", "a.assigned_user_id")
      .where("a.company_id", companyId)
      .whereNull("a.deleted_at");
    if (from) q.andWhere("a.start_at", ">=", from);
    if (to) q.andWhere("a.start_at", "<=", to);
    const total = Number((await q.clone().count("a.id as c").first())?.c ?? 0);
    const rows = await q
      .select("a.*", "l.uuid as lead_uuid", "u.uuid as assigned_user_uuid")
      .orderBy("a.start_at", "asc")
      .limit(limit)
      .offset((page - 1) * limit);
    return { items: rows.map(this.mapAppointment), total };
  }

  async createAppointment(companyId: number, userId: number, input: CreateAppointmentInput) {
    const leadId = input.leadUuid ? await this.resolveLeadId(companyId, input.leadUuid) : null;
    const assignedUserId = input.assignedUserUuid
      ? await this.resolveUserId(companyId, input.assignedUserUuid)
      : null;
    const [row] = await this.db("scheduled_appointments")
      .insert({
        company_id: companyId,
        title: input.title,
        description: input.description ?? null,
        start_at: input.startAt,
        end_at: input.endAt,
        lead_id: leadId,
        assigned_user_id: assignedUserId,
        location: input.location ?? null,
        created_by: userId,
      })
      .returning("*");
    return this.mapAppointment(row);
  }

  async updateAppointment(companyId: number, uuid: string, patch: Record<string, unknown>) {
    if (patch.leadUuid !== undefined) {
      patch.lead_id = patch.leadUuid ? await this.resolveLeadId(companyId, String(patch.leadUuid)) : null;
      delete patch.leadUuid;
    }
    if (patch.assignedUserUuid !== undefined) {
      patch.assigned_user_id = patch.assignedUserUuid
        ? await this.resolveUserId(companyId, String(patch.assignedUserUuid))
        : null;
      delete patch.assignedUserUuid;
    }
    if (patch.startAt !== undefined) {
      patch.start_at = patch.startAt;
      delete patch.startAt;
    }
    if (patch.endAt !== undefined) {
      patch.end_at = patch.endAt;
      delete patch.endAt;
    }
    const [row] = await this.db("scheduled_appointments")
      .where({ company_id: companyId, uuid })
      .whereNull("deleted_at")
      .update({ ...patch, updated_at: this.db.fn.now() })
      .returning("*");
    return row ? this.mapAppointment(row) : null;
  }

  private mapAppointment(row: Record<string, unknown>): ScheduledAppointment {
    return {
      uuid: String(row.uuid),
      title: String(row.title),
      description: row.description != null ? String(row.description) : null,
      startAt: toIso(row.start_at as Date),
      endAt: toIso(row.end_at as Date),
      leadUuid: row.lead_uuid != null ? String(row.lead_uuid) : null,
      assignedUserUuid: row.assigned_user_uuid != null ? String(row.assigned_user_uuid) : null,
      location: row.location != null ? String(row.location) : null,
      status: row.status as ScheduledAppointment["status"],
      createdAt: toIso(row.created_at as Date),
    };
  }

  // Reviews
  async listReviews(companyId: number, page: number, limit: number) {
    const q = this.db("reputation_reviews as r")
      .leftJoin("leads as l", "l.id", "r.lead_id")
      .where("r.company_id", companyId)
      .whereNull("r.deleted_at");
    const total = Number((await q.clone().count("r.id as c").first())?.c ?? 0);
    const rows = await q
      .select("r.*", "l.uuid as lead_uuid")
      .orderBy("r.created_at", "desc")
      .limit(limit)
      .offset((page - 1) * limit);
    return { items: rows.map(this.mapReview), total };
  }

  async createReview(companyId: number, input: CreateReviewInput) {
    const leadId = input.leadUuid ? await this.resolveLeadId(companyId, input.leadUuid) : null;
    const [row] = await this.db("reputation_reviews")
      .insert({
        company_id: companyId,
        lead_id: leadId,
        reviewer_name: input.reviewerName,
        reviewer_email: input.reviewerEmail ?? null,
        rating: input.rating,
        review_text: input.reviewText ?? null,
        source: input.source ?? "MANUAL",
      })
      .returning("*");
    return this.mapReview(row);
  }

  async updateReview(companyId: number, uuid: string, patch: Record<string, unknown>) {
    if (patch.reviewerName !== undefined) {
      patch.reviewer_name = patch.reviewerName;
      delete patch.reviewerName;
    }
    if (patch.reviewerEmail !== undefined) {
      patch.reviewer_email = patch.reviewerEmail;
      delete patch.reviewerEmail;
    }
    if (patch.reviewText !== undefined) {
      patch.review_text = patch.reviewText;
      delete patch.reviewText;
    }
    if (patch.leadUuid !== undefined) {
      patch.lead_id = patch.leadUuid ? await this.resolveLeadId(companyId, String(patch.leadUuid)) : null;
      delete patch.leadUuid;
    }
    const [row] = await this.db("reputation_reviews")
      .where({ company_id: companyId, uuid })
      .whereNull("deleted_at")
      .update({ ...patch, updated_at: this.db.fn.now() })
      .returning("*");
    return row ? this.mapReview(row) : null;
  }

  private mapReview(row: Record<string, unknown>): ReputationReview {
    return {
      uuid: String(row.uuid),
      reviewerName: String(row.reviewer_name),
      reviewerEmail: row.reviewer_email != null ? String(row.reviewer_email) : null,
      rating: Number(row.rating),
      reviewText: row.review_text != null ? String(row.review_text) : null,
      source: String(row.source),
      status: row.status as ReputationReview["status"],
      leadUuid: row.lead_uuid != null ? String(row.lead_uuid) : null,
      createdAt: toIso(row.created_at as Date),
    };
  }

  // Outreach + inbox
  async insertOutreachMessage(data: {
    companyId: number;
    campaignId?: number;
    leadId?: number;
    channel: string;
    recipient: string;
    subject?: string;
    body: string;
    status: string;
  }) {
    await this.db("outreach_messages").insert({
      company_id: data.companyId,
      campaign_id: data.campaignId ?? null,
      lead_id: data.leadId ?? null,
      channel: data.channel,
      recipient: data.recipient,
      subject: data.subject ?? null,
      body: data.body,
      status: data.status,
      sent_at: data.status === "SENT" ? this.db.fn.now() : null,
    });
  }

  async listInboxThreads(companyId: number, limit: number, channel?: string): Promise<InboxThread[]> {
    const whatsappQ = this.db("whatsapp_messages")
      .where({ company_id: companyId })
      .whereNull("deleted_at")
      .select(
        this.db.raw("'WHATSAPP' as channel"),
        "customer_mobile as recipient",
        "customer_name",
        "lead_id",
        "body as last_message",
        "created_at as last_at",
      )
      .orderBy("created_at", "desc")
      .limit(limit);

    const outreachQ = this.db("outreach_messages")
      .where({ company_id: companyId })
      .select(
        "channel",
        "recipient",
        this.db.raw("null as customer_name"),
        "lead_id",
        "body as last_message",
        "created_at as last_at",
      )
      .orderBy("created_at", "desc")
      .limit(limit);

    const [waRows, outRows] = await Promise.all([whatsappQ, outreachQ]);
    const leadIds = [
      ...new Set(
        [...waRows, ...outRows]
          .map((r: { lead_id: number | null }) => r.lead_id)
          .filter((id): id is number => id != null),
      ),
    ];
    const leads =
      leadIds.length > 0
        ? await this.db("leads").whereIn("id", leadIds).select("id", "uuid", "customer_name")
        : [];
    const leadMap = new Map(
      leads.map((l: { id: number; uuid: string; customer_name: string }) => [l.id, l]),
    );

    const threadMap = new Map<string, InboxThread>();
    for (const row of [...waRows, ...outRows]) {
      const ch = String(row.channel);
      if (channel && ch !== channel) continue;
      const lead = row.lead_id ? leadMap.get(row.lead_id) : undefined;
      const recipient = String(row.recipient);
      const key = `${ch}:${recipient}`;
      const lastAt = toIso(row.last_at as Date);
      const existing = threadMap.get(key);
      if (!existing || existing.lastAt < lastAt) {
        threadMap.set(key, {
          key,
          channel: ch as InboxThread["channel"],
          recipient,
          customerName: row.customer_name ?? lead?.customer_name ?? null,
          leadUuid: lead?.uuid ?? null,
          lastMessage: String(row.last_message),
          lastAt,
          unreadCount: 0,
        });
      }
    }

    const threads = [...threadMap.values()];
    threads.sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1));
    return threads.slice(0, limit);
  }

  async listActiveWorkflowsByTrigger(companyId: number, triggerType: string) {
    const rows = await this.db("automation_workflows")
      .where({ company_id: companyId, trigger_type: triggerType, status: "ACTIVE" })
      .whereNull("deleted_at")
      .orderBy("created_at", "asc");
    return rows.map((row) => this.mapWorkflow(row));
  }

  workflowMatchesLeadContext(
    workflow: AutomationWorkflow,
    ctx: { leadSource?: string | null; status?: string; previousStatus?: string },
  ): boolean {
    const config = workflow.triggerConfig ?? {};
    if (config.leadSource && ctx.leadSource !== config.leadSource) {
      return false;
    }
    const toStatus = config.toStatus ?? config.status;
    if (toStatus && ctx.status !== toStatus) {
      return false;
    }
    if (config.fromStatus && ctx.previousStatus !== config.fromStatus) {
      return false;
    }
    return true;
  }

  async incrementWorkflowRunCount(companyId: number, workflowUuid: string) {
    await this.db("automation_workflows")
      .where({ company_id: companyId, uuid: workflowUuid })
      .increment("run_count", 1);
  }

  async listInboxMessages(
    companyId: number,
    channel: string,
    recipient: string,
    limit = 100,
  ): Promise<
    Array<{
      uuid: string;
      channel: string;
      direction: string;
      body: string;
      status: string;
      createdAt: string;
    }>
  > {
    const normalized = recipient.replace(/\D/g, "");

    if (channel === "WHATSAPP") {
      const waRows = await this.db("whatsapp_messages")
        .where({ company_id: companyId })
        .whereNull("deleted_at")
        .whereRaw("regexp_replace(customer_mobile, '\\D', '', 'g') = ?", [normalized])
        .select("uuid", "body", "direction", "status", "created_at");

      const outreachRows = await this.db("outreach_messages")
        .where({ company_id: companyId, channel: "WHATSAPP" })
        .whereRaw("regexp_replace(recipient, '\\D', '', 'g') = ?", [normalized])
        .select("uuid", "body", "status", "created_at");

      const merged = [
        ...waRows.map((row) => ({
          uuid: String(row.uuid),
          channel: "WHATSAPP",
          direction: String(row.direction),
          body: String(row.body),
          status: String(row.status),
          createdAt: toIso(row.created_at as Date),
        })),
        ...outreachRows.map((row) => ({
          uuid: String(row.uuid),
          channel: "WHATSAPP",
          direction: "outbound",
          body: String(row.body),
          status: String(row.status),
          createdAt: toIso(row.created_at as Date),
        })),
      ];

      merged.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
      return merged.slice(0, limit);
    }

    const rows = await this.db("outreach_messages")
      .where({ company_id: companyId, channel, recipient })
      .orderBy("created_at", "asc")
      .limit(limit)
      .select("uuid", "channel", "body", "status", "created_at");

    return rows.map((row) => ({
      uuid: String(row.uuid),
      channel: String(row.channel),
      direction: "outbound",
      body: String(row.body),
      status: String(row.status),
      createdAt: toIso(row.created_at as Date),
    }));
  }

  async listLeadsForCampaign(companyId: number, filter: Record<string, unknown>, limit = 500) {
    const q = this.db("leads").where({ company_id: companyId }).whereNull("deleted_at");
    if (filter.status) q.andWhere("status", filter.status);
    if (filter.source) q.andWhere("lead_source", filter.source);
    return q.select("id", "uuid", "customer_name", "mobile", "email", "lead_number").limit(limit);
  }

  private async resolveTemplateId(companyId: number, uuid: string): Promise<number | null> {
    const row = await this.db("message_templates")
      .where({ company_id: companyId, uuid })
      .whereNull("deleted_at")
      .first<{ id: number }>("id");
    return row?.id ?? null;
  }

  async resolveLeadIdForUuid(companyId: number, uuid: string): Promise<number | null> {
    return this.resolveLeadId(companyId, uuid);
  }

  private async resolveLeadId(companyId: number, uuid: string): Promise<number | null> {
    const row = await this.db("leads")
      .where({ company_id: companyId, uuid })
      .whereNull("deleted_at")
      .first<{ id: number }>("id");
    return row?.id ?? null;
  }

  private async resolveUserId(companyId: number, uuid: string): Promise<number | null> {
    const row = await this.db("users")
      .where({ company_id: companyId, uuid })
      .whereNull("deleted_at")
      .first<{ id: number }>("id");
    return row?.id ?? null;
  }
}
