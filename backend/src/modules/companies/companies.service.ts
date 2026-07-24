import type { Logger } from "winston";
import { db } from "../../database/knex.js";
import { logger } from "../../config/logger.js";
import { AppError } from "../../common/errors/AppError.js";
import { CompaniesRepository } from "./companies.repository.js";
import type { CompanyDetail, PaginatedCompaniesResult } from "./companies.types.js";
import {
  companyHasAdminUser,
  provisionCompanyAdmin,
  type ProvisionAdminResult,
} from "./tenant-provisioning.service.js";
import type {
  CreateCompanyInput,
  ListCompaniesQuery,
  ProvisionInitialAdminInput,
  UpdateCompanyActiveInput,
  UpdateCompanyInput,
  UpdateCompanyStatusInput,
} from "./companies.validation.js";

const PROTECTED_COMPANY_CODES = ["PLATFORM"];

export class CompaniesService {
  constructor(
    private readonly companiesRepository: CompaniesRepository,
    private readonly logger: Logger,
  ) {}

  async listCompanies(query: ListCompaniesQuery): Promise<PaginatedCompaniesResult> {
    return this.companiesRepository.listCompanies(query);
  }

  async getCompanyByUuid(uuid: string): Promise<CompanyDetail> {
    const company = await this.companiesRepository.findByUuid(uuid);

    if (!company) {
      throw new AppError(404, "Company not found");
    }

    return company;
  }

  async createCompany(
    input: CreateCompanyInput,
    createdBy: number,
  ): Promise<{ company: CompanyDetail; initialAdmin: ProvisionAdminResult }> {
    const { initialAdmin, ...companyInput } = input;

    await this.assertUniqueCompanyFields({
      companyCode: companyInput.companyCode,
      email: companyInput.email,
    });

    const company = await this.companiesRepository.createCompany(companyInput, createdBy);

    const adminLogin = await provisionCompanyAdmin(
      db,
      {
        companyId: company.id,
        companyCode: company.companyCode,
        email: company.email,
        phone: company.phone,
        city: company.city,
        state: company.state,
        ownerName: company.ownerName,
      },
      initialAdmin,
      createdBy,
    );

    this.logger.info("Company created", {
      companyId: company.id,
      companyCode: company.companyCode,
      createdBy,
      adminUsername: adminLogin.username,
    });

    return { company, initialAdmin: adminLogin };
  }

  async getCompanyLoginSetup(uuid: string): Promise<{
    companyCode: string;
    hasAdminUser: boolean;
  }> {
    const company = await this.getCompanyByUuid(uuid);
    const hasAdminUser = await companyHasAdminUser(db, company.id);

    return {
      companyCode: company.companyCode,
      hasAdminUser,
    };
  }

  async provisionInitialAdmin(
    uuid: string,
    input: ProvisionInitialAdminInput,
    createdBy: number,
  ): Promise<ProvisionAdminResult> {
    const company = await this.getCompanyByUuid(uuid);

    return provisionCompanyAdmin(
      db,
      {
        companyId: company.id,
        companyCode: company.companyCode,
        email: company.email,
        phone: company.phone,
        city: company.city,
        state: company.state,
        ownerName: company.ownerName,
      },
      input,
      createdBy,
    );
  }

  async updateCompany(
    uuid: string,
    input: UpdateCompanyInput,
    updatedBy: number,
  ): Promise<CompanyDetail> {
    const existing = await this.companiesRepository.findRecordByUuid(uuid);

    if (!existing) {
      throw new AppError(404, "Company not found");
    }

    this.assertProtectedCompany(existing.company_code, "update");

    if (input.companyCode && input.companyCode !== existing.company_code) {
      this.assertProtectedCompany(input.companyCode, "update");
    }

    await this.assertUniqueCompanyFields(
      {
        companyCode: input.companyCode,
        email: input.email,
      },
      existing.id,
    );

    const company = await this.companiesRepository.updateCompany(
      existing.id,
      input,
      updatedBy,
    );

    if (!company) {
      throw new AppError(404, "Company not found");
    }

    this.logger.info("Company updated", {
      companyId: company.id,
      updatedBy,
    });

    return company;
  }

  async updateCompanyStatus(
    uuid: string,
    input: UpdateCompanyStatusInput,
    updatedBy: number,
  ): Promise<CompanyDetail> {
    const existing = await this.companiesRepository.findRecordByUuid(uuid);

    if (!existing) {
      throw new AppError(404, "Company not found");
    }

    this.assertProtectedCompany(existing.company_code, "change status of");

    const company = await this.companiesRepository.updateCompanyStatus(
      existing.id,
      input.status,
      updatedBy,
    );

    if (!company) {
      throw new AppError(404, "Company not found");
    }

    this.logger.info("Company status updated", {
      companyId: company.id,
      status: input.status,
      updatedBy,
    });

    return company;
  }

  async updateCompanyActive(
    uuid: string,
    input: UpdateCompanyActiveInput,
    updatedBy: number,
  ): Promise<CompanyDetail> {
    const existing = await this.companiesRepository.findRecordByUuid(uuid);

    if (!existing) {
      throw new AppError(404, "Company not found");
    }

    this.assertProtectedCompany(existing.company_code, "activate or deactivate");

    const company = await this.companiesRepository.updateCompanyActive(
      existing.id,
      input.isActive,
      updatedBy,
    );

    if (!company) {
      throw new AppError(404, "Company not found");
    }

    this.logger.info("Company active state updated", {
      companyId: company.id,
      isActive: input.isActive,
      updatedBy,
    });

    return company;
  }

  async deleteCompany(uuid: string, deletedBy: number): Promise<void> {
    const existing = await this.companiesRepository.findRecordByUuid(uuid);

    if (!existing) {
      throw new AppError(404, "Company not found");
    }

    this.assertProtectedCompany(existing.company_code, "delete");

    const deleted = await this.companiesRepository.softDeleteCompany(
      existing.id,
      deletedBy,
    );

    if (!deleted) {
      throw new AppError(404, "Company not found");
    }

    this.logger.info("Company soft deleted", {
      companyId: existing.id,
      deletedBy,
    });
  }

  private assertProtectedCompany(companyCode: string, action: string): void {
    if (PROTECTED_COMPANY_CODES.includes(companyCode.toUpperCase())) {
      throw new AppError(400, `You cannot ${action} the platform company`);
    }
  }

  private async assertUniqueCompanyFields(
    fields: {
      companyCode?: string;
      email?: string;
    },
    excludeCompanyId?: number,
  ): Promise<void> {
    if (fields.companyCode) {
      const taken = await this.companiesRepository.isCompanyCodeTaken(
        fields.companyCode,
        excludeCompanyId,
      );
      if (taken) {
        throw new AppError(
          409,
          "Company code already exists. Open it from Companies or use a different code (even deleted tenants keep their code).",
        );
      }
    }

    if (fields.email) {
      const taken = await this.companiesRepository.isEmailTaken(
        fields.email,
        excludeCompanyId,
      );
      if (taken) {
        throw new AppError(409, "Company email already exists");
      }
    }
  }
}

export const companiesService = new CompaniesService(
  new CompaniesRepository(db),
  logger,
);
