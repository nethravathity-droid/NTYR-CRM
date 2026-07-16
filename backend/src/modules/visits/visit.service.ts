import winston, { type Logger } from "winston";
import { AppError } from "../../common/errors/AppError.js";
import { db } from "../../database/knex.js";
import { VisitsRepository } from "./visit.repository.js";
import type {
  CancelVisitInput,
  CompleteVisitInput,
  CreateVisitInput,
  ListVisitsQuery,
  UpdateVisitInput,
} from "./visit.validation.js";
import type { VisitDetail } from "./visit.types.js";

export class VisitsService {
  constructor(
    private readonly visitsRepository: VisitsRepository,
    private readonly logger: Logger,
  ) {}

  async listVisits(companyId: number, query: ListVisitsQuery) {
    return this.visitsRepository.listVisits(companyId, query);
  }

  async getVisitByUuid(companyId: number, uuid: string): Promise<VisitDetail> {
    const visit = await this.visitsRepository.findVisitByUuid(companyId, uuid);
    if (!visit) {
      throw new AppError(404, "Visit not found");
    }
    return visit;
  }

  async getAuditTrail(companyId: number, uuid: string) {
    const visit = await this.visitsRepository.findVisitRecordByUuid(companyId, uuid);
    if (!visit) {
      throw new AppError(404, "Visit not found");
    }
    return this.visitsRepository.getAuditTrail(companyId, visit.id);
  }

  async createVisit(companyId: number, input: CreateVisitInput, createdBy: number): Promise<VisitDetail> {
    await this.validateRelations(companyId, input);
    const visit = await this.visitsRepository.createVisit(companyId, input, createdBy);
    this.logger.info("Visit scheduled", { companyId, visitUuid: visit.uuid });
    return visit;
  }

  async updateVisit(companyId: number, uuid: string, input: UpdateVisitInput, updatedBy: number): Promise<VisitDetail> {
    const existing = await this.visitsRepository.findVisitRecordByUuid(companyId, uuid);
    if (!existing) {
      throw new AppError(404, "Visit not found");
    }

    await this.validateRelations(companyId, {
      ...input,
      customerName: input.customerName ?? existing.customer_name,
      mobile: input.mobile ?? existing.mobile,
      visitDate: input.visitDate ?? existing.visit_date,
      visitTime: input.visitTime ?? existing.visit_time,
    });

    const visit = await this.visitsRepository.updateVisit(companyId, existing.id, input, updatedBy);
    if (!visit) {
      throw new AppError(404, "Visit not found");
    }
    return visit;
  }

  async deleteVisit(companyId: number, uuid: string, deletedBy: number): Promise<void> {
    const existing = await this.visitsRepository.findVisitRecordByUuid(companyId, uuid);
    if (!existing) {
      throw new AppError(404, "Visit not found");
    }

    const deleted = await this.visitsRepository.softDeleteVisit(companyId, existing.id, deletedBy);
    if (!deleted) {
      throw new AppError(404, "Visit not found");
    }
  }

  async completeVisit(companyId: number, uuid: string, input: CompleteVisitInput, updatedBy: number): Promise<VisitDetail> {
    const existing = await this.visitsRepository.findVisitRecordByUuid(companyId, uuid);
    if (!existing) {
      throw new AppError(404, "Visit not found");
    }

    const visit = await this.visitsRepository.markCompleted(companyId, existing.id, input ?? {}, updatedBy);
    if (!visit) {
      throw new AppError(404, "Visit not found");
    }
    return visit;
  }

  async cancelVisit(companyId: number, uuid: string, input: CancelVisitInput, updatedBy: number): Promise<VisitDetail> {
    const existing = await this.visitsRepository.findVisitRecordByUuid(companyId, uuid);
    if (!existing) {
      throw new AppError(404, "Visit not found");
    }

    const visit = await this.visitsRepository.markCancelled(companyId, existing.id, input ?? {}, updatedBy);
    if (!visit) {
      throw new AppError(404, "Visit not found");
    }
    return visit;
  }

  async getFormOptions(companyId: number) {
    return this.visitsRepository.getFormOptions(companyId);
  }

  private async validateRelations(
    companyId: number,
    input: Partial<CreateVisitInput> & Pick<CreateVisitInput, "customerName" | "mobile" | "visitDate" | "visitTime">,
  ) {
    if (input.leadId) {
      const lead = await db("leads").where({ id: input.leadId, company_id: companyId }).whereNull("deleted_at").first();
      if (!lead) {
        throw new AppError(400, "Invalid lead reference");
      }
    }

    if (input.projectId) {
      const project = await db("projects").where({ id: input.projectId, company_id: companyId }).whereNull("deleted_at").first();
      if (!project) {
        throw new AppError(400, "Invalid project reference");
      }
    }

    if (input.unitId) {
      const unit = await db("units").where({ id: input.unitId, company_id: companyId }).whereNull("deleted_at").first();
      if (!unit) {
        throw new AppError(400, "Invalid unit reference");
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

export const visitsService = new VisitsService(new VisitsRepository(db), logger);
