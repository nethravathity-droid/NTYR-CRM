import { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Plus } from "lucide-react";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { InvoiceCard } from "@/features/invoices/components/InvoiceCard";
import { useInvoices } from "@/features/invoices/hooks/useInvoices";
import { paths } from "@/routes/paths";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { INVOICE_STATUS_LABELS, type InvoiceStatus } from "@/features/invoices/types/invoice.types";
import { Loading } from "@/components/shared/Loading";

export function InvoicesListPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "">("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useInvoices({
    page,
    limit: 20,
    search: search || undefined,
    status: status || undefined,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  if (isLoading) return <Loading label="Loading invoices..." />;

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={FileText}
        tone="emerald"
        title="Invoices"
        description="Manage customer invoices and billing."
        action={
          <Button asChild>
            <Link to={paths.invoices.create}>
              <Plus className="mr-2 h-4 w-4" /> New Invoice
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Search</Label>
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Customer, invoice no..." />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onChange={(e) => { setStatus(e.target.value as InvoiceStatus | ""); setPage(1); }}>
              <option value="">All statuses</option>
              {(Object.keys(INVOICE_STATUS_LABELS) as InvoiceStatus[]).map((status) => (
                <option key={status} value={status}>{INVOICE_STATUS_LABELS[status]}</option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {data?.invoices.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.invoices.map((invoice) => (
            <InvoiceCard key={invoice.uuid} invoice={invoice} onView={(uuid) => window.location.assign(paths.invoices.details(uuid))} />
          ))}
        </div>
      ) : (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No invoices found.</CardContent></Card>
      )}

      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.totalPages} — {data.pagination.total} total
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page === data.pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
