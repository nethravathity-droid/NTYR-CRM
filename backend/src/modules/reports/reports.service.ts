import winston, { type Logger } from "winston";
import * as XLSX from "xlsx";
import { AppError } from "../../common/errors/AppError.js";
import { db } from "../../database/knex.js";
import { ReportsRepository } from "./reports.repository.js";
import type { ExportFormat, ReportType } from "./reports.types.js";
import type { ReportFiltersQuery } from "./reports.validation.js";

export class ReportsService {
  constructor(
    private readonly reportsRepository: ReportsRepository,
    private readonly logger: Logger,
  ) {}

  private filters(query: ReportFiltersQuery) {
    return this.reportsRepository.toFilters(query);
  }

  async getDashboard(companyId: number, query: ReportFiltersQuery) {
    return this.reportsRepository.getDashboardReport(companyId, this.filters(query));
  }

  async getLeadReport(companyId: number, query: ReportFiltersQuery) {
    return this.reportsRepository.getLeadReport(companyId, this.filters(query));
  }

  async getSalesReport(companyId: number, query: ReportFiltersQuery) {
    return this.reportsRepository.getSalesReport(companyId, this.filters(query));
  }

  async getEmployeeReport(companyId: number, query: ReportFiltersQuery) {
    return this.reportsRepository.getEmployeeReport(companyId, this.filters(query));
  }

  async getFollowupReport(companyId: number, query: ReportFiltersQuery) {
    return this.reportsRepository.getFollowupReport(companyId, this.filters(query));
  }

  async getVisitReport(companyId: number, query: ReportFiltersQuery) {
    return this.reportsRepository.getVisitReport(companyId, this.filters(query));
  }

  async getBookingReport(companyId: number, query: ReportFiltersQuery) {
    return this.reportsRepository.getBookingReport(companyId, this.filters(query));
  }

  async getPaymentReport(companyId: number, query: ReportFiltersQuery) {
    return this.reportsRepository.getPaymentReport(companyId, this.filters(query));
  }

  async exportReport(companyId: number, reportType: ReportType, format: ExportFormat, query: ReportFiltersQuery) {
    const filters = this.filters(query);
    const rows = await this.reportsRepository.getExportRows(companyId, reportType, filters);

    if (rows.length === 0) {
      throw new AppError(404, "No data available for export");
    }

    this.logger.info("Report exported", { companyId, reportType, format, rowCount: rows.length });

    if (format === "csv") {
      return this.buildCsvExport(reportType, rows);
    }

    if (format === "xlsx") {
      return this.buildXlsxExport(reportType, rows);
    }

    return this.buildPdfHtmlExport(reportType, filters, rows);
  }

  private buildCsvExport(reportType: string, rows: Record<string, string | number | null>[]) {
    const headers = Object.keys(rows[0]!);
    const lines = [
      headers.join(","),
      ...rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(",")),
    ];

    return {
      contentType: "text/csv",
      filename: `${reportType}-report.csv`,
      body: Buffer.from(lines.join("\n"), "utf8"),
    };
  }

  private buildXlsxExport(reportType: string, rows: Record<string, string | number | null>[]) {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

    return {
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      filename: `${reportType}-report.xlsx`,
      body: buffer,
    };
  }

  private buildPdfHtmlExport(
    reportType: string,
    filters: ReturnType<ReportsRepository["toFilters"]>,
    rows: Record<string, string | number | null>[],
  ) {
    const headers = Object.keys(rows[0]!);
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${reportType} Report</title>
<style>body{font-family:Arial,sans-serif;padding:24px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style>
</head><body>
<h1>${reportType} Report</h1>
<p>Period: ${filters.fromDate} to ${filters.toDate}</p>
<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
<tbody>${rows.map((row) => `<tr>${headers.map((h) => `<td>${row[h] ?? ""}</td>`).join("")}</tr>`).join("")}</tbody>
</table></body></html>`;

    return {
      contentType: "text/html",
      filename: `${reportType}-report.html`,
      body: Buffer.from(html, "utf8"),
    };
  }
}

const logger = winston.createLogger({
  level: "info",
  transports: [new winston.transports.Console()],
});

export const reportsService = new ReportsService(new ReportsRepository(db), logger);
