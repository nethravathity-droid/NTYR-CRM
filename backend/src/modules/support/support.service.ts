import { db } from "../../database/knex.js";
import { logger } from "../../config/logger.js";
import type { Logger } from "winston";
import { AppError } from "../../common/errors/AppError.js";
import { SupportRepository } from "./support.repository.js";
import type { CompanyThread, ThreadMessage } from "./support.types.js";
import type { ListCompanyThreadsQuery } from "./support.validation.js";

export class SupportService {
  constructor(
    private readonly supportRepository: SupportRepository,
    private readonly logger: Logger,
  ) {}

  async listCompanyThreads(query: ListCompanyThreadsQuery): Promise<{
    threads: CompanyThread[];
    unreadThreads: number;
  }> {
    const threads = await this.supportRepository.listCompanyThreads(query);
    const unreadThreads = await this.supportRepository.countUnreadThreads();
    return { threads, unreadThreads };
  }

  async listThreadMessages(companyUuid: string): Promise<{
    companyUuid: string;
    messages: ThreadMessage[];
  }> {
    const company = await this.supportRepository.getCompanyByUuid(companyUuid);
    if (!company) {
      throw new AppError(404, "Company not found");
    }

    const messages = await this.supportRepository.listThreadMessages(company.id);
    return { companyUuid, messages };
  }

  async sendThreadMessage(
    companyUuid: string,
    body: string,
    sender: { id: number; role: string },
  ): Promise<ThreadMessage> {
    const company = await this.supportRepository.getCompanyByUuid(companyUuid);
    if (!company) {
      throw new AppError(404, "Company not found");
    }

    const message = await this.supportRepository.insertMessage({
      companyId: company.id,
      senderUserId: sender.id,
      senderRole: "PLATFORM_SUPER_ADMIN",
      body,
    });

    this.logger.info("Support message sent by super admin", {
      companyUuid,
      senderUserId: sender.id,
    });

    return message;
  }

  async markThreadRead(companyUuid: string, role: string): Promise<void> {
    const company = await this.supportRepository.getCompanyByUuid(companyUuid);
    if (!company) {
      throw new AppError(404, "Company not found");
    }

    await this.supportRepository.markThreadRead(company.id, role);
  }

  async broadcastMessage(body: string, sender: { id: number }, statuses: string[] = ["ACTIVE", "TRIAL"]): Promise<number> {
    const companies = await this.supportRepository.listAllCompanies(statuses);
    const companyIds = companies.map((company) => company.id);
    const count = await this.supportRepository.broadcastMessage({
      companyIds,
      senderUserId: sender.id,
      body,
    });

    this.logger.info("Broadcast support message sent", {
      senderUserId: sender.id,
      companyCount: count,
      statuses,
    });

    return count;
  }
}

export const supportService = new SupportService(new SupportRepository(db), logger);
