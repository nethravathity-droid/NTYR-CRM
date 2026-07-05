import type { Knex } from "knex";
import type {
  CompanyDetail,
  CompanyListItem,
  CompanyRecord,
  CompanyStatus,
  CreateCompanyData,
  ListCompaniesQuery,
  PaginatedCompaniesResult,
  UpdateCompanyData,
} from "./companies.types.js";

const COMPANY_SELECT = [
  "id",
  "uuid",
  "company_code",
  "company_name",
  "legal_name",
  "owner_name",
  "gst_number",
  "pan_number",
  "rera_number",
  "email",
  "phone",
  "alternate_phone",
  "website",
  "address_line1",
  "address_line2",
  "city",
  "state",
  "country",
  "postal_code",
  "logo_url",
  "favicon_url",
  "timezone",
  "currency",
  "status",
  "is_active",
  "trial_start_date",
  "trial_end_date",
  "notes",
  "created_at",
  "updated_at",
  "deleted_at",
] as const;

export class CompaniesRepository {
  constructor(private readonly db: Knex) {}

  async listCompanies(query: ListCompaniesQuery): Promise<PaginatedCompaniesResult> {
    const baseQuery = this.db("companies").whereNull("deleted_at");

    if (query.search) {
      const term = `%${query.search}%`;
      baseQuery.where(function searchFilter() {
        this.whereILike("company_name", term)
          .orWhereILike("company_code", term)
          .orWhereILike("owner_name", term)
          .orWhereILike("email", term)
          .orWhereILike("phone", term)
          .orWhereILike("city", term)
          .orWhereILike("state", term);
      });
    }

    if (query.status) {
      baseQuery.where("status", query.status);
    }

    const countResult = await baseQuery.clone().count("id as total").first<{ total: string }>();
    const total = Number(countResult?.total ?? 0);
    const offset = (query.page - 1) * query.limit;

    const rows = await baseQuery
      .clone()
      .select(COMPANY_SELECT)
      .orderBy(query.sortBy, query.sortOrder)
      .limit(query.limit)
      .offset(offset);

    return {
      companies: rows.map((row) => this.mapToListItem(row as CompanyRecord)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 0,
      },
    };
  }

  async findByUuid(uuid: string): Promise<CompanyDetail | null> {
    const company = await this.db("companies")
      .select(COMPANY_SELECT)
      .where({ uuid })
      .whereNull("deleted_at")
      .first<CompanyRecord>();

    return company ? this.mapToDetail(company) : null;
  }

  async findRecordByUuid(uuid: string): Promise<CompanyRecord | null> {
    const company = await this.db<CompanyRecord>("companies")
      .where({ uuid })
      .whereNull("deleted_at")
      .first();

    return company ?? null;
  }

  async createCompany(
    data: CreateCompanyData,
    createdBy: number,
  ): Promise<CompanyDetail> {
    const isActive = this.resolveIsActive(data.status ?? "TRIAL");

    const [inserted] = await this.db("companies")
      .insert({
        company_code: data.companyCode,
        company_name: data.companyName,
        legal_name: data.legalName ?? null,
        owner_name: data.ownerName,
        gst_number: data.gstNumber ?? null,
        pan_number: data.panNumber ?? null,
        rera_number: data.reraNumber ?? null,
        email: data.email,
        phone: data.phone,
        alternate_phone: data.alternatePhone ?? null,
        website: data.website ?? null,
        address_line1: data.addressLine1,
        address_line2: data.addressLine2 ?? null,
        city: data.city,
        state: data.state,
        country: data.country ?? "India",
        postal_code: data.postalCode,
        logo_url: data.logoUrl ?? null,
        favicon_url: data.faviconUrl ?? null,
        timezone: data.timezone ?? "Asia/Kolkata",
        currency: data.currency ?? "INR",
        status: data.status ?? "TRIAL",
        is_active: isActive,
        trial_start_date: data.trialStartDate ?? null,
        trial_end_date: data.trialEndDate ?? null,
        notes: data.notes ?? null,
        created_by: createdBy,
        updated_by: createdBy,
      })
      .returning("uuid");

    const company = await this.findByUuid(inserted.uuid);
    if (!company) {
      throw new Error("Failed to retrieve created company");
    }

    return company;
  }

  async updateCompany(
    companyId: number,
    data: UpdateCompanyData,
    updatedBy: number,
  ): Promise<CompanyDetail | null> {
    const updatePayload: Record<string, unknown> = {
      updated_by: updatedBy,
      updated_at: this.db.fn.now(),
    };

    if (data.companyCode !== undefined) updatePayload.company_code = data.companyCode;
    if (data.companyName !== undefined) updatePayload.company_name = data.companyName;
    if (data.legalName !== undefined) updatePayload.legal_name = data.legalName;
    if (data.ownerName !== undefined) updatePayload.owner_name = data.ownerName;
    if (data.gstNumber !== undefined) updatePayload.gst_number = data.gstNumber;
    if (data.panNumber !== undefined) updatePayload.pan_number = data.panNumber;
    if (data.reraNumber !== undefined) updatePayload.rera_number = data.reraNumber;
    if (data.email !== undefined) updatePayload.email = data.email;
    if (data.phone !== undefined) updatePayload.phone = data.phone;
    if (data.alternatePhone !== undefined) {
      updatePayload.alternate_phone = data.alternatePhone;
    }
    if (data.website !== undefined) updatePayload.website = data.website;
    if (data.addressLine1 !== undefined) updatePayload.address_line1 = data.addressLine1;
    if (data.addressLine2 !== undefined) updatePayload.address_line2 = data.addressLine2;
    if (data.city !== undefined) updatePayload.city = data.city;
    if (data.state !== undefined) updatePayload.state = data.state;
    if (data.country !== undefined) updatePayload.country = data.country;
    if (data.postalCode !== undefined) updatePayload.postal_code = data.postalCode;
    if (data.logoUrl !== undefined) updatePayload.logo_url = data.logoUrl;
    if (data.faviconUrl !== undefined) updatePayload.favicon_url = data.faviconUrl;
    if (data.timezone !== undefined) updatePayload.timezone = data.timezone;
    if (data.currency !== undefined) updatePayload.currency = data.currency;
    if (data.status !== undefined) {
      updatePayload.status = data.status;
      updatePayload.is_active = this.resolveIsActive(data.status);
    }
    if (data.trialStartDate !== undefined) {
      updatePayload.trial_start_date = data.trialStartDate;
    }
    if (data.trialEndDate !== undefined) {
      updatePayload.trial_end_date = data.trialEndDate;
    }
    if (data.notes !== undefined) updatePayload.notes = data.notes;

    const updated = await this.db("companies")
      .where({ id: companyId })
      .whereNull("deleted_at")
      .update(updatePayload)
      .returning("uuid");

    if (!updated.length) {
      return null;
    }

    return this.findByUuid(updated[0].uuid);
  }

  async updateCompanyStatus(
    companyId: number,
    status: CompanyStatus,
    updatedBy: number,
  ): Promise<CompanyDetail | null> {
    const updated = await this.db("companies")
      .where({ id: companyId })
      .whereNull("deleted_at")
      .update({
        status,
        is_active: this.resolveIsActive(status),
        updated_by: updatedBy,
        updated_at: this.db.fn.now(),
      })
      .returning("uuid");

    if (!updated.length) {
      return null;
    }

    return this.findByUuid(updated[0].uuid);
  }

  async softDeleteCompany(companyId: number, deletedBy: number): Promise<boolean> {
    const deleted = await this.db("companies")
      .where({ id: companyId })
      .whereNull("deleted_at")
      .update({
        deleted_at: this.db.fn.now(),
        deleted_by: deletedBy,
        is_active: false,
        status: "SUSPENDED",
        updated_at: this.db.fn.now(),
      });

    return deleted > 0;
  }

  async isCompanyCodeTaken(
    companyCode: string,
    excludeCompanyId?: number,
  ): Promise<boolean> {
    const query = this.db("companies")
      .whereRaw("LOWER(company_code) = LOWER(?)", [companyCode])
      .whereNull("deleted_at");

    if (excludeCompanyId) {
      query.whereNot("id", excludeCompanyId);
    }

    return Boolean(await query.first());
  }

  async isEmailTaken(email: string, excludeCompanyId?: number): Promise<boolean> {
    const query = this.db("companies")
      .whereRaw("LOWER(email) = LOWER(?)", [email])
      .whereNull("deleted_at");

    if (excludeCompanyId) {
      query.whereNot("id", excludeCompanyId);
    }

    return Boolean(await query.first());
  }

  private resolveIsActive(status: CompanyStatus): boolean {
    return status === "ACTIVE" || status === "TRIAL";
  }

  private mapToListItem(row: CompanyRecord): CompanyListItem {
    return {
      id: row.id,
      uuid: row.uuid,
      companyCode: row.company_code,
      companyName: row.company_name,
      ownerName: row.owner_name,
      email: row.email,
      phone: row.phone,
      city: row.city,
      state: row.state,
      country: row.country,
      status: row.status,
      isActive: row.is_active,
      createdAt: row.created_at,
    };
  }

  private mapToDetail(row: CompanyRecord): CompanyDetail {
    return {
      id: row.id,
      uuid: row.uuid,
      companyCode: row.company_code,
      companyName: row.company_name,
      legalName: row.legal_name,
      ownerName: row.owner_name,
      gstNumber: row.gst_number,
      panNumber: row.pan_number,
      reraNumber: row.rera_number,
      email: row.email,
      phone: row.phone,
      alternatePhone: row.alternate_phone,
      website: row.website,
      addressLine1: row.address_line1,
      addressLine2: row.address_line2,
      city: row.city,
      state: row.state,
      country: row.country,
      postalCode: row.postal_code,
      logoUrl: row.logo_url,
      faviconUrl: row.favicon_url,
      timezone: row.timezone,
      currency: row.currency,
      status: row.status,
      isActive: row.is_active,
      trialStartDate: row.trial_start_date,
      trialEndDate: row.trial_end_date,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
