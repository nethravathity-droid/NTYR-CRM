import type { Logger } from "winston";
import { read, utils } from "xlsx";
import { db } from "../../database/knex.js";
import { logger } from "../../config/logger.js";
import { AppError } from "../../common/errors/AppError.js";
import { LeadsRepository } from "./leads.repository.js";
import type {
  AssignLeadsResult,
  BulkUpdateLeadsResult,
  DuplicateLeadMatch,
  ImportLeadRow,
  ImportLeadsResult,
  LeadDetail,
  LeadFormOptions,
  PaginatedLeadsResult,
} from "./leads.types.js";
import type {
  AssignLeadsInput,
  BulkUpdateLeadsInput,
  CheckDuplicateQuery,
  CreateLeadInput,
  ListLeadsQuery,
  UpdateLeadInput,
} from "./leads.validation.js";

const IMPORT_COLUMN_MAP: Record<string, keyof ImportLeadRow> = {
  customername: "customerName",
  name: "customerName",
  customer: "customerName",
  mobile: "mobile",
  mobilenumber: "mobile",
  phone: "mobile",
  alternatenumber: "alternateMobile",
  alternatemobile: "alternateMobile",
  altmobile: "alternateMobile",
  email: "email",
  projectinterested: "projectInterested",
  project: "projectInterested",
  budget: "budget",
  propertytype: "propertyType",
  leadsource: "leadSource",
  source: "leadSource",
  campaign: "campaign",
  city: "city",
  priority: "priority",
  status: "status",
  notes: "notes",
  note: "notes",
  assigneduserid: "assignedUserId",
  assignedemployeeid: "assignedUserId",
  employeeid: "assignedUserId",
};

const DEFAULT_LEAD_SOURCES = [
  "Manual",
  "Walk-in",
  "Phone Call",
  "Referral",
  "Website",
  "Facebook",
  "Instagram",
  "Google Ads",
  "WhatsApp",
  "CSV Import",
  "Excel Upload",
];

export class LeadsService {
  constructor(
    private readonly leadsRepository: LeadsRepository,
    private readonly logger: Logger,
  ) {}

  async listLeads(
    companyId: number,
    query: ListLeadsQuery,
  ): Promise<PaginatedLeadsResult> {
    return this.leadsRepository.listLeads(companyId, query);
  }

  async getLeadByUuid(companyId: number, uuid: string): Promise<LeadDetail> {
    const lead = await this.leadsRepository.findLeadByUuid(companyId, uuid);

    if (!lead) {
      throw new AppError(404, "Lead not found");
    }

    return lead;
  }

  async createLead(
    companyId: number,
    input: CreateLeadInput,
    createdBy: number,
    options: { allowDuplicate?: boolean } = {},
  ): Promise<LeadDetail> {
    await this.validateAssignee(companyId, input.assignedUserId);

    if (!options.allowDuplicate) {
      await this.assertNoDuplicates(companyId, {
        mobile: input.mobile,
        email: input.email ?? undefined,
      });
    }

    const lead = await this.leadsRepository.createLead(
      companyId,
      {
        customerName: input.customerName,
        mobile: input.mobile,
        alternateMobile: input.alternateMobile,
        email: input.email,
        projectInterested: input.projectInterested,
        budget: input.budget,
        propertyType: input.propertyType,
        leadSource: input.leadSource,
        campaign: input.campaign,
        city: input.city,
        assignedUserId: input.assignedUserId,
        priority: input.priority,
        status: input.status,
        notes: input.notes,
      },
      createdBy,
    );

    this.logger.info("Lead created", {
      companyId,
      leadUuid: lead.uuid,
      leadNumber: lead.leadNumber,
    });

    return lead;
  }

  async updateLead(
    companyId: number,
    uuid: string,
    input: UpdateLeadInput,
    updatedBy: number,
  ): Promise<LeadDetail> {
    const existing = await this.leadsRepository.findLeadRecordByUuid(
      companyId,
      uuid,
    );

    if (!existing) {
      throw new AppError(404, "Lead not found");
    }

    await this.validateAssignee(companyId, input.assignedUserId);

    if (input.mobile || input.email) {
      await this.assertNoDuplicates(
        companyId,
        {
          mobile: input.mobile,
          email: input.email ?? undefined,
        },
        existing.id,
      );
    }

    const lead = await this.leadsRepository.updateLead(
      companyId,
      existing.id,
      {
        customerName: input.customerName,
        mobile: input.mobile,
        alternateMobile: input.alternateMobile,
        email: input.email,
        projectInterested: input.projectInterested,
        budget: input.budget,
        propertyType: input.propertyType,
        leadSource: input.leadSource,
        campaign: input.campaign,
        city: input.city,
        assignedUserId: input.assignedUserId,
        priority: input.priority,
        status: input.status,
        notes: input.notes,
      },
      updatedBy,
    );

    if (!lead) {
      throw new AppError(404, "Lead not found");
    }

    return lead;
  }

  async deleteLead(
    companyId: number,
    uuid: string,
    deletedBy: number,
  ): Promise<void> {
    const existing = await this.leadsRepository.findLeadRecordByUuid(
      companyId,
      uuid,
    );

    if (!existing) {
      throw new AppError(404, "Lead not found");
    }

    const deleted = await this.leadsRepository.softDeleteLead(
      companyId,
      existing.id,
      deletedBy,
    );

    if (!deleted) {
      throw new AppError(404, "Lead not found");
    }
  }

  async assignLeads(
    companyId: number,
    input: AssignLeadsInput,
    performedBy: number,
  ): Promise<AssignLeadsResult> {
    const assigneeExists = await this.leadsRepository.assigneeExists(
      companyId,
      input.assignedUserId,
    );

    if (!assigneeExists) {
      throw new AppError(400, "Invalid assigned employee");
    }

    return this.leadsRepository.assignLeads(
      companyId,
      input.leadUuids,
      input.assignedUserId,
      performedBy,
    );
  }

  async bulkUpdateLeads(
    companyId: number,
    input: BulkUpdateLeadsInput,
    performedBy: number,
  ): Promise<BulkUpdateLeadsResult> {
    if (
      input.status === undefined &&
      input.priority === undefined &&
      input.assignedUserId === undefined
    ) {
      throw new AppError(400, "At least one field must be provided for bulk update");
    }

    if (input.assignedUserId) {
      const assigneeExists = await this.leadsRepository.assigneeExists(
        companyId,
        input.assignedUserId,
      );

      if (!assigneeExists) {
        throw new AppError(400, "Invalid assigned employee");
      }
    }

    return this.leadsRepository.bulkUpdateLeads(
      companyId,
      input.leadUuids,
      {
        status: input.status,
        priority: input.priority,
        assignedUserId: input.assignedUserId,
      },
      performedBy,
    );
  }

  async checkDuplicates(
    companyId: number,
    query: CheckDuplicateQuery,
  ): Promise<{
    mobileDuplicate: DuplicateLeadMatch | null;
    emailDuplicate: DuplicateLeadMatch | null;
  }> {
    let excludeLeadId: number | undefined;

    if (query.excludeUuid) {
      const lead = await this.leadsRepository.findLeadRecordByUuid(
        companyId,
        query.excludeUuid,
      );
      excludeLeadId = lead?.id;
    }

    const [mobileDuplicate, emailDuplicate] = await Promise.all([
      query.mobile
        ? this.leadsRepository.findDuplicateByMobile(
            companyId,
            query.mobile,
            excludeLeadId,
          )
        : Promise.resolve(null),
      query.email
        ? this.leadsRepository.findDuplicateByEmail(
            companyId,
            query.email,
            excludeLeadId,
          )
        : Promise.resolve(null),
    ]);

    return { mobileDuplicate, emailDuplicate };
  }

  async getFormOptions(companyId: number): Promise<LeadFormOptions> {
    const options = await this.leadsRepository.getFormOptions(companyId);

    return {
      ...options,
      leadSources: [
        ...new Set([...DEFAULT_LEAD_SOURCES, ...options.leadSources]),
      ],
    };
  }

  async getAuditTrail(companyId: number, uuid: string) {
    const lead = await this.leadsRepository.findLeadRecordByUuid(
      companyId,
      uuid,
    );

    if (!lead) {
      throw new AppError(404, "Lead not found");
    }

    return this.leadsRepository.getAuditTrail(companyId, lead.id);
  }

  async importLeads(
    companyId: number,
    fileBuffer: Buffer,
    filename: string,
    performedBy: number,
    skipDuplicates = true,
  ): Promise<ImportLeadsResult> {
    const rows = this.parseImportFile(fileBuffer, filename);
    const result: ImportLeadsResult = {
      imported: 0,
      skipped: 0,
      duplicates: [],
      errors: [],
    };

    for (let index = 0; index < rows.length; index += 1) {
      const rowNumber = index + 2;
      const row = rows[index];
      if (!row) continue;

      try {
        if (!row.customerName?.trim()) {
          result.errors.push({
            row: rowNumber,
            message: "Customer name is required",
          });
          continue;
        }

        if (!row.mobile?.trim()) {
          result.errors.push({
            row: rowNumber,
            message: "Mobile number is required",
          });
          continue;
        }

        const mobileDuplicate = await this.leadsRepository.findDuplicateByMobile(
          companyId,
          row.mobile,
        );

        if (mobileDuplicate) {
          result.duplicates.push({
            row: rowNumber,
            reason: "Duplicate mobile number",
            existingLead: mobileDuplicate,
          });

          if (skipDuplicates) {
            result.skipped += 1;
            continue;
          }
        }

        if (row.email) {
          const emailDuplicate = await this.leadsRepository.findDuplicateByEmail(
            companyId,
            row.email,
          );

          if (emailDuplicate) {
            result.duplicates.push({
              row: rowNumber,
              reason: "Duplicate email address",
              existingLead: emailDuplicate,
            });

            if (skipDuplicates) {
              result.skipped += 1;
              continue;
            }
          }
        }

        if (row.assignedUserId) {
          const assigneeExists = await this.leadsRepository.assigneeExists(
            companyId,
            row.assignedUserId,
          );

          if (!assigneeExists) {
            result.errors.push({
              row: rowNumber,
              message: "Invalid assigned employee ID",
            });
            continue;
          }
        }

        await this.leadsRepository.createLead(
          companyId,
          {
            ...row,
            leadSource:
              row.leadSource ??
              (filename.toLowerCase().endsWith(".csv")
                ? "CSV Import"
                : "Excel Upload"),
          },
          performedBy,
        );

        result.imported += 1;
      } catch (error) {
        result.errors.push({
          row: rowNumber,
          message:
            error instanceof Error ? error.message : "Failed to import row",
        });
      }
    }

    this.logger.info("Lead import completed", {
      companyId,
      filename,
      imported: result.imported,
      skipped: result.skipped,
      errors: result.errors.length,
    });

    return result;
  }

  private parseImportFile(buffer: Buffer, filename: string): ImportLeadRow[] {
    const lowerName = filename.toLowerCase();

    if (lowerName.endsWith(".csv")) {
      return this.parseCsv(buffer);
    }

    if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
      return this.parseExcel(buffer);
    }

    throw new AppError(400, "Unsupported file format. Use CSV or Excel.");
  }

  private parseCsv(buffer: Buffer): ImportLeadRow[] {
    const content = buffer.toString("utf-8").replace(/^\uFEFF/, "");
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      throw new AppError(400, "CSV file must contain a header row and data");
    }

    const headerLine = lines[0] ?? "";
    const headers = this.parseCsvLine(headerLine).map((header) =>
      this.normalizeHeader(header),
    );

    return lines.slice(1).map((line) => {
      const values = this.parseCsvLine(line);
      return this.mapImportRow(headers, values);
    });
  }

  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];

      if (char === '"') {
        if (inQuotes && line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
        continue;
      }

      current += char;
    }

    values.push(current.trim());
    return values;
  }

  private parseExcel(buffer: Buffer): ImportLeadRow[] {
    const workbook = read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new AppError(400, "Excel file does not contain any sheets");
    }

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      throw new AppError(400, "Excel file does not contain a valid sheet");
    }
    const rawRows = utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });

    return rawRows.map((row) => {
      const headers = Object.keys(row);
      const values = headers.map((header) => String(row[header] ?? ""));
      const normalizedHeaders = headers.map((header) =>
        this.normalizeHeader(header),
      );

      return this.mapImportRow(normalizedHeaders, values);
    });
  }

  private mapImportRow(headers: string[], values: string[]): ImportLeadRow {
    const row: ImportLeadRow = {
      customerName: "",
      mobile: "",
    };

    headers.forEach((header, index) => {
      const field = IMPORT_COLUMN_MAP[header];
      const value = values[index]?.trim();

      if (!field || !value) {
        return;
      }

      if (field === "budget") {
        const parsed = Number.parseFloat(value.replace(/,/g, ""));
        row.budget = Number.isNaN(parsed) ? null : parsed;
        return;
      }

      if (field === "priority") {
        const normalized = value.toUpperCase();
        if (normalized === "HOT" || normalized === "WARM" || normalized === "COLD") {
          row.priority = normalized as ImportLeadRow["priority"];
        }
        return;
      }

      if (field === "assignedUserId") {
        const parsed = Number.parseInt(value, 10);
        row.assignedUserId = Number.isNaN(parsed) ? null : parsed;
        return;
      }

      if (field === "status") {
        row.status = value.toUpperCase().replace(/\s+/g, "_") as ImportLeadRow["status"];
        return;
      }

      (row as unknown as Record<string, unknown>)[field] = value;
    });

    return row;
  }

  private normalizeHeader(header: string): string {
    return header.toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  private async validateAssignee(
    companyId: number,
    assignedUserId?: number | null,
  ): Promise<void> {
    if (!assignedUserId) {
      return;
    }

    const exists = await this.leadsRepository.assigneeExists(
      companyId,
      assignedUserId,
    );

    if (!exists) {
      throw new AppError(400, "Invalid assigned employee");
    }
  }

  private async assertNoDuplicates(
    companyId: number,
    fields: { mobile?: string; email?: string },
    excludeLeadId?: number,
  ): Promise<void> {
    if (fields.mobile) {
      const duplicate = await this.leadsRepository.findDuplicateByMobile(
        companyId,
        fields.mobile,
        excludeLeadId,
      );

      if (duplicate) {
        throw new AppError(
          409,
          `A lead with this mobile number already exists (${duplicate.leadNumber})`,
        );
      }
    }

    if (fields.email) {
      const duplicate = await this.leadsRepository.findDuplicateByEmail(
        companyId,
        fields.email,
        excludeLeadId,
      );

      if (duplicate) {
        throw new AppError(
          409,
          `A lead with this email already exists (${duplicate.leadNumber})`,
        );
      }
    }
  }
}

export const leadsService = new LeadsService(new LeadsRepository(db), logger);
