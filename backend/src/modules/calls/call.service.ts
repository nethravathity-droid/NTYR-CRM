import winston, { type Logger } from "winston";
import { AppError } from "../../common/errors/AppError.js";
import { db } from "../../database/knex.js";
import { CallsRepository } from "./call.repository.js";
import type { CallDetail } from "./call.types.js";
import type { CallSummaryQuery, CreateCallInput, ListCallsQuery, UpdateCallInput } from "./call.validation.js";

export class CallsService {
  constructor(
    private readonly callsRepository: CallsRepository,
    private readonly logger: Logger,
  ) {}

  async listCalls(companyId: number, query: ListCallsQuery) {
    return this.callsRepository.listCalls(companyId, query);
  }

  async getDashboardSummary(companyId: number, query: CallSummaryQuery) {
    return this.callsRepository.getDashboardSummary(companyId, query);
  }

  async getCallByUuid(companyId: number, uuid: string): Promise<CallDetail> {
    const call = await this.callsRepository.findCallByUuid(companyId, uuid);
    if (!call) {
      throw new AppError(404, "Call not found");
    }
    return call;
  }

  async getCallTimeline(companyId: number, uuid: string) {
    const call = await this.callsRepository.findCallRecordByUuid(companyId, uuid);
    if (!call) {
      throw new AppError(404, "Call not found");
    }

    const [auditTrail, timeline] = await Promise.all([
      this.callsRepository.getAuditTrail(companyId, call.id),
      this.callsRepository.getCallTimeline(companyId, call),
    ]);

    return { auditTrail, timeline };
  }

  async createCall(companyId: number, input: CreateCallInput, createdBy: number): Promise<CallDetail> {
    await this.validateRelations(companyId, input);
    const call = await this.callsRepository.createCall(companyId, input, createdBy);
    this.logger.info("Call logged", { companyId, callUuid: call.uuid, followupCreated: Boolean(call.followup) });
    return call;
  }

  async updateCall(companyId: number, uuid: string, input: UpdateCallInput, updatedBy: number): Promise<CallDetail> {
    const existing = await this.callsRepository.findCallRecordByUuid(companyId, uuid);
    if (!existing) {
      throw new AppError(404, "Call not found");
    }

    await this.validateRelations(companyId, {
      ...input,
      customerName: input.customerName ?? existing.customer_name,
      mobile: input.mobile ?? existing.mobile,
      direction: input.direction ?? existing.direction,
      callStatus: input.callStatus ?? existing.call_status,
      callDate: input.callDate ?? existing.call_date,
      callTime: input.callTime ?? existing.call_time,
    });

    const call = await this.callsRepository.updateCall(companyId, existing.id, input, updatedBy);
    if (!call) {
      throw new AppError(404, "Call not found");
    }
    return call;
  }

  async deleteCall(companyId: number, uuid: string, deletedBy: number): Promise<void> {
    const existing = await this.callsRepository.findCallRecordByUuid(companyId, uuid);
    if (!existing) {
      throw new AppError(404, "Call not found");
    }

    const deleted = await this.callsRepository.softDeleteCall(companyId, existing.id, deletedBy);
    if (!deleted) {
      throw new AppError(404, "Call not found");
    }
  }

  async getFormOptions(companyId: number) {
    return this.callsRepository.getFormOptions(companyId);
  }

  private async validateRelations(
    companyId: number,
    input: Partial<CreateCallInput> & Pick<CreateCallInput, "customerName" | "mobile" | "direction" | "callStatus" | "callDate" | "callTime">,
  ) {
    if (input.leadId) {
      const lead = await db("leads").where({ id: input.leadId, company_id: companyId }).whereNull("deleted_at").first();
      if (!lead) {
        throw new AppError(400, "Invalid lead reference");
      }
    }

    if (input.assignedUserId) {
      const user = await db("users").where({ id: input.assignedUserId, company_id: companyId, status: "ACTIVE" }).whereNull("deleted_at").first();
      if (!user) {
        throw new AppError(400, "Invalid assigned executive");
      }
    }
  }
}

const logger = winston.createLogger({
  level: "info",
  transports: [new winston.transports.Console()],
});

export const callsService = new CallsService(new CallsRepository(db), logger);
