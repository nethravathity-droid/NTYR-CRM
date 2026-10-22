import winston from "winston";
import { db } from "../../database/knex.js";
import { followupsService } from "../followups/followup.service.js";
import { GrowthRepository } from "./growth.repository.js";
import { deliverOutboundMessage, renderMessageTemplate, type LeadMergeFields } from "./outreach.delivery.js";

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
});

const growthRepository = new GrowthRepository(db);

export type LeadAutomationContext = {
  leadId: number;
  leadUuid: string;
  customerName: string;
  mobile: string;
  email: string | null;
  leadNumber?: string;
  leadSource?: string | null;
  status?: string;
  previousStatus?: string;
};

type WorkflowAction = Record<string, unknown>;

function mergeFields(ctx: LeadAutomationContext): LeadMergeFields {
  return {
    customerName: ctx.customerName,
    mobile: ctx.mobile,
    email: ctx.email,
    leadNumber: ctx.leadNumber ?? null,
    status: ctx.status ?? null,
  };
}

function addMinutesToNow(minutes: number): { date: string; time: string } {
  const d = new Date(Date.now() + minutes * 60_000);
  const date = d.toISOString().slice(0, 10);
  const time = d.toISOString().slice(11, 16);
  return { date, time };
}

async function resolveActionBody(
  companyId: number,
  action: WorkflowAction,
  fields: LeadMergeFields,
): Promise<{ body: string; subject: string | null; channel: "EMAIL" | "SMS" | "WHATSAPP" }> {
  const channel = String(action.channel ?? "WHATSAPP").toUpperCase() as "EMAIL" | "SMS" | "WHATSAPP";
  let body = typeof action.body === "string" ? action.body : "";
  let subject = typeof action.subject === "string" ? action.subject : null;

  const templateUuid = typeof action.templateUuid === "string" ? action.templateUuid : null;
  if (templateUuid) {
    const template = await growthRepository.findTemplateByUuid(companyId, templateUuid);
    if (template) {
      body = template.body;
      subject = template.subject;
    }
  }

  if (!body && action.type === "CREATE_FOLLOWUP") {
    body = "";
  } else if (!body) {
    body = "Hi {{customerName}}, thanks for your interest. Our team will reach out shortly.";
  }

  return {
    channel,
    subject: subject ? renderMessageTemplate(subject, fields) : null,
    body: renderMessageTemplate(body, fields),
  };
}

async function executeAction(
  companyId: number,
  actorUserId: number,
  ctx: LeadAutomationContext,
  action: WorkflowAction,
): Promise<void> {
  const type = String(action.type ?? "").toUpperCase();
  const fields = mergeFields(ctx);

  if (type === "CREATE_FOLLOWUP") {
    const delayMinutes = Number(action.delayMinutes ?? 60);
    const { date, time } = addMinutesToNow(delayMinutes);
    const followupType = String(action.followupType ?? "CALL").toUpperCase();
    const allowed = ["CALL", "WHATSAPP", "EMAIL", "MEETING", "SITE_VISIT"];
    const typeValue = allowed.includes(followupType) ? followupType : "CALL";

    await followupsService.createFollowup(
      companyId,
      {
        leadId: ctx.leadId,
        customerName: ctx.customerName,
        assignedUserId: null,
        followupDate: date,
        followupTime: time,
        type: typeValue as "CALL" | "WHATSAPP" | "EMAIL" | "MEETING" | "SITE_VISIT",
        priority: "MEDIUM",
        status: "PENDING",
        notes:
          typeof action.notes === "string"
            ? action.notes
            : "Auto-created by workflow",
        reminderBefore: 30,
      },
      actorUserId,
    );
    return;
  }

  const sendTypes = ["SEND_WHATSAPP", "SEND_SMS", "SEND_EMAIL", "SEND_MESSAGE"];
  if (!sendTypes.includes(type)) {
    logger.warn(`Unknown workflow action type: ${type}`);
    return;
  }

  const channelOverride =
    type === "SEND_SMS" ? "SMS" : type === "SEND_EMAIL" ? "EMAIL" : "WHATSAPP";
  const resolved = await resolveActionBody(companyId, { ...action, channel: channelOverride }, fields);
  const recipient =
    resolved.channel === "EMAIL" ? ctx.email : ctx.mobile;

  if (!recipient) {
    logger.warn(`Workflow send skipped: no recipient for ${resolved.channel}`, {
      leadUuid: ctx.leadUuid,
    });
    return;
  }

  await deliverOutboundMessage(growthRepository, {
    companyId,
    userId: actorUserId,
    leadId: ctx.leadId,
    customerName: ctx.customerName,
    channel: resolved.channel,
    recipient,
    body: resolved.body,
    subject: resolved.subject,
  });
}

export async function dispatchAutomationEvent(
  companyId: number,
  triggerType: string,
  ctx: LeadAutomationContext,
  actorUserId: number,
): Promise<void> {
  const workflows = await growthRepository.listActiveWorkflowsByTrigger(companyId, triggerType);
  if (!workflows.length) return;

  for (const workflow of workflows) {
    if (!growthRepository.workflowMatchesLeadContext(workflow, ctx)) {
      continue;
    }

    const actions = workflow.actions;
    for (const action of actions) {
      try {
        await executeAction(companyId, actorUserId, ctx, action as WorkflowAction);
      } catch (error) {
        logger.error("Workflow action failed", {
          workflowUuid: workflow.uuid,
          error: error instanceof Error ? error.message : error,
        });
      }
    }

    await growthRepository.incrementWorkflowRunCount(companyId, workflow.uuid);
  }
}
