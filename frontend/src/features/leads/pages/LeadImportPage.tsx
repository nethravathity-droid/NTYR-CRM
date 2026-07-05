import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileSpreadsheet, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { useImportLeads } from "@/features/leads/hooks/useLeads";
import type { ImportLeadsResult } from "@/features/leads/types/lead.types";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function LeadImportPage() {
  const importLeads = useImportLeads();
  const [file, setFile] = useState<File | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportLeadsResult | null>(null);

  const handleImport = async () => {
    if (!file) {
      setError("Please choose a CSV or Excel file.");
      return;
    }

    setError(null);
    setResult(null);

    try {
      const importResult = await importLeads.mutateAsync({
        file,
        skipDuplicates,
      });
      setResult(importResult);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" asChild>
        <Link to={paths.leads.list}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Leads
        </Link>
      </Button>

      <CompanyPageHeader
        icon={Upload}
        tone="violet"
        title="Import Leads"
        description="Upload CSV or Excel files to bulk create leads with duplicate detection."
      />

      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
          <CardDescription>
            Supported formats: `.csv`, `.xlsx`, `.xls`. Required columns: Customer
            Name, Mobile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setResult(null);
            }}
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={skipDuplicates}
              onChange={(event) => setSkipDuplicates(event.target.checked)}
            />
            Skip duplicate mobile/email records
          </label>

          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <Button disabled={importLeads.isPending} onClick={handleImport}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {importLeads.isPending ? "Importing..." : "Import Leads"}
          </Button>
        </CardContent>
      </Card>

      {result ? (
        <Card>
          <CardHeader>
            <CardTitle>Import Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>Imported: {result.imported}</p>
            <p>Skipped: {result.skipped}</p>
            <p>Duplicates: {result.duplicates.length}</p>
            <p>Errors: {result.errors.length}</p>

            {result.duplicates.length ? (
              <div>
                <p className="font-medium">Duplicate rows</p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  {result.duplicates.slice(0, 10).map((item) => (
                    <li key={`${item.row}-${item.reason}`}>
                      Row {item.row}: {item.reason}
                      {item.existingLead
                        ? ` (${item.existingLead.leadNumber})`
                        : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {result.errors.length ? (
              <div>
                <p className="font-medium">Errors</p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  {result.errors.slice(0, 10).map((item) => (
                    <li key={`${item.row}-${item.message}`}>
                      Row {item.row}: {item.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
