import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportsService } from "@/features/reports/services/reports.service";
import type { ExportFormat, ReportFiltersParams, ReportType } from "@/features/reports/types/report.types";
import { usePermissions } from "@/hooks/usePermissions";
import { getApiErrorMessage } from "@/lib/api/client";

interface ReportExportButtonsProps {
  reportType: ReportType;
  filters: ReportFiltersParams;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

export function ReportExportButtons({ reportType, filters }: ReportExportButtonsProps) {
  const { hasPermission } = usePermissions();
  const canExport = hasPermission("reports.export");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<ExportFormat | "print" | null>(null);

  if (!canExport) return null;

  const handleExport = async (format: ExportFormat) => {
    setLoading(format);
    setError(null);
    try {
      const blob = await reportsService.exportReport(reportType, format, filters);
      const ext = format === "xlsx" ? "xlsx" : format === "csv" ? "csv" : "html";
      downloadBlob(blob, `${reportType}-report.${ext}`);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(null);
    }
  };

  const handlePrint = () => {
    setLoading("print");
    window.print();
    setLoading(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 print:hidden">
        <Button variant="outline" size="sm" disabled={loading !== null} onClick={() => handleExport("xlsx")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />{loading === "xlsx" ? "Exporting..." : "Excel"}
        </Button>
        <Button variant="outline" size="sm" disabled={loading !== null} onClick={() => handleExport("csv")}>
          <Download className="mr-2 h-4 w-4" />{loading === "csv" ? "Exporting..." : "CSV"}
        </Button>
        <Button variant="outline" size="sm" disabled={loading !== null} onClick={() => handleExport("pdf")}>
          <FileText className="mr-2 h-4 w-4" />{loading === "pdf" ? "Exporting..." : "PDF"}
        </Button>
        <Button variant="outline" size="sm" disabled={loading !== null} onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />Print
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
