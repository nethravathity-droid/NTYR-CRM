import winston, { type Logger } from "winston";
import { AppError } from "../../common/errors/AppError.js";
import { db } from "../../database/knex.js";
import { FollowupsRepository } from "./followup.repository.js";
import type {
  CreateFollowupInput,
  ListFollowupsQuery,
  RescheduleFollowupInput,
  UpdateFollowupInput,
} from "./followup.validation.js";
import type { FollowupDetail, PaginatedFollowups, ReminderBefore } from "./followup.types.js";

export class FollowupsService {
  constructor(
    private readonly followupsRepository: FollowupsRepository,
    private readonly logger: Logger,
  ) {}

  async listFollowups(companyId: number, query: ListFollowupsQuery): Promise<PaginatedFollowups> {
    return this.followupsRepository.listFollowups(companyId, query);
  }

  async getFollowupByUuid(companyId: number, uuid: string): Promise<FollowupDetail> {
    const followup = await this.followupsRepository.findFollowupByUuid(companyId, uuid);

    if (!followup) {
      throw new AppError(404, "Follow-up not found");
    }

    return followup;
  }

  async createFollowup(companyId: number, input: CreateFollowupInput, createdBy: number): Promise<FollowupDetail> {
    await this.validateAssignee(companyId, input.assignedUserId);
    await this.validateLead(companyId, input.leadId);

    const followup = await this.followupsRepository.createFollowup(companyId, {
      leadId: input.leadId ?? null,
      customerName: input.customerName,
      assignedUserId: input.assignedUserId ?? null,
      followupDate: input.followupDate,
      followupTime: input.followupTime,
      type: input.type,
      priority: input.priority,
      status: input.status,
      notes: input.notes,
      reminderBefore: input.reminderBefore as ReminderBefore,
      nextFollowupDate: input.nextFollowupDate,
    }, createdBy);

    this.logger.info("Follow-up created", { companyId, followupUuid: followup.uuid });
    return followup;
  }

  async updateFollowup(companyId: number, uuid: string, input: UpdateFollowupInput, updatedBy: number): Promise<FollowupDetail> {
    const existing = await this.followupsRepository.findFollowupRecordByUuid(companyId, uuid);

    if (!existing) {
      throw new AppError(404, "Follow-up not found");
    }

    await this.validateAssignee(companyId, input.assignedUserId);
    await this.validateLead(companyId, input.leadId);

    const followup = await this.followupsRepository.updateFollowup(companyId, existing.id, {
      ...input,
      reminderBefore: input.reminderBefore as ReminderBefore | undefined,
    }, updatedBy);

    if (!followup) {
      throw new AppError(404, "Follow-up not found");
    }

    return followup;
  }

  async deleteFollowup(companyId: number, uuid: string, deletedBy: number): Promise<void> {
    const existing = await this.followupsRepository.findFollowupRecordByUuid(companyId, uuid);

    if (!existing) {
      throw new AppError(404, "Follow-up not found");
    }

    const deleted = await this.followupsRepository.softDeleteFollowup(companyId, existing.id, deletedBy);

    if (!deleted) {
      throw new AppError(404, "Follow-up not found");
    }
  }

  async completeFollowup(companyId: number, uuid: string, updatedBy: number): Promise<FollowupDetail> {
    const existing = await this.followupsRepository.findFollowupRecordByUuid(companyId, uuid);

    if (!existing) {
      throw new AppError(404, "Follow-up not found");
    }

    const followup = await this.followupsRepository.markCompleted(companyId, existing.id, updatedBy);

    if (!followup) {
      throw new AppError(404, "Follow-up not found");
    }

    return followup;
  }

  async rescheduleFollowup(companyId: number, uuid: string, input: RescheduleFollowupInput, updatedBy: number): Promise<FollowupDetail> {
    const existing = await this.followupsRepository.findFollowupRecordByUuid(companyId, uuid);

    if (!existing) {
      throw new AppError(404, "Follow-up not found");
    }

    const followup = await this.followupsRepository.rescheduleFollowup(companyId, existing.id, input, updatedBy);

    if (!followup) {
      throw new AppError(404, "Follow-up not found");
    }

    return followup;
  }

  async getTodayFollowups(companyId: number) {
    return this.followupsRepository.findTodayFollowups(companyId);
  }

  async getOverdueFollowups(companyId: number) {
    return this.followupsRepository.findOverdueFollowups(companyId);
  }

  async getFormOptions(companyId: number) {
    return this.followupsRepository.getFormOptions(companyId);
  }

  private async validateAssignee(companyId: number, userId?: number | null) {
    if (!userId) {
      return;
    }

    const exists = await this.followupsRepository.assigneeExists(companyId, userId);
    if (!exists) {
      throw new AppError(400, "Invalid assigned employee");
    }
  }

  private async validateLead(companyId: number, leadId?: number | null) {
    if (!leadId) {
      return;
    }

    const lead = await db("leads")
      .where({ id: leadId, company_id: companyId })
      .whereNull("deleted_at")
      .first();

    if (!lead) {
      throw new AppError(400, "Invalid lead reference");
    }
  }
}
const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console(),
  ],
});
export const followupsService = new FollowupsService(new FollowupsRepository(db), logger);
