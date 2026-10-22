import { Link, useParams } from "react-router-dom";
import { FileText } from "lucide-react";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { GenerateInvoicePdfButton } from "@/features/invoices/components/GenerateInvoicePdfButton";
import { useInvoice } from "@/features/invoices/hooks/useInvoices";
import {
  formatCurrency,
  INVOICE_STATUS_LABELS,
  type InvoiceLineItem,
} from "@/features/invoices/types/invoice.types";
import { Loading } from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { paths } from "@/routes/paths";
import { usePermissions } from "@/hooks/usePermissions";

export function InvoiceDetailsPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("invoices.update");

  const { data, isLoading } = useInvoice(uuid ?? "");

  if (isLoading) return <Loading label="Loading invoice..." />;
  const invoice = data;
  if (!invoice) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Invoice not found.</p>
        <Button variant="outline" asChild><Link to={paths.invoices.list}>Back to Invoices</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={FileText}
        tone="emerald"
        title={`Invoice ${invoice.invoiceNumber}`}
        description={invoice.customerName}
        action={
          <div className="flex flex-wrap gap-2">
            <GenerateInvoicePdfButton invoice={invoice} />
            {canUpdate ? <Button variant="outline" asChild><Link to={paths.invoices.edit(invoice.uuid)}>Edit</Link></Button> : null}
          </div>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Invoice Details</CardTitle>
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
            {INVOICE_STATUS_LABELS[invoice.status]}
          </span>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">Invoice No.</span><span>{invoice.invoiceNumber}</span></div>
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">Due Date</span><span>{invoice.dueDate}</span></div>
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">Project</span><span>{invoice.project?.projectName ?? "—"}</span></div>
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">Unit</span><span>{invoice.unit?.unitNumber ?? "—"}</span></div>
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">Booking</span><span>{invoice.booking?.bookingNumber ?? "—"}</span></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Bill To</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">Name</span><span>{invoice.customerName}</span></div>
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">Email</span><span>{invoice.customerEmail ?? "—"}</span></div>
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">Phone</span><span>{invoice.customerPhone ?? "—"}</span></div>
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">Address</span><span>{invoice.customerAddress ?? "—"}</span></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left">Description</th>
                  <th className="pb-2 text-right">Qty</th>
                  <th className="pb-2 text-right">Rate</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item: InvoiceLineItem, index: number) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-2">{item.description}</td>
                    <td className="py-2 text-right">{item.quantity}</td>
                    <td className="py-2 text-right">{formatCurrency(item.rate)}</td>
                    <td className="py-2 text-right">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
            {invoice.taxRate > 0 && <div className="flex justify-between gap-4"><span className="text-muted-foreground">Tax ({invoice.taxRate}%)</span><span>{formatCurrency(invoice.taxAmount)}</span></div>}
            {invoice.discount > 0 && <div className="flex justify-between gap-4"><span className="text-muted-foreground">Discount</span><span>- {formatCurrency(invoice.discount)}</span></div>}
            <div className="flex justify-between gap-4 text-base font-semibold"><span className="text-muted-foreground">Total</span><span>{formatCurrency(invoice.total)}</span></div>
          </div>
        </CardContent>
      </Card>

      {invoice.notes ? (
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</CardContent>
        </Card>
      ) : null}

      {invoice.terms ? (
        <Card>
          <CardHeader><CardTitle>Terms & Conditions</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.terms}</CardContent>
        </Card>
      ) : null}

      <div className="flex gap-3">
        <Button variant="outline" asChild><Link to={paths.invoices.list}>Back to Invoices</Link></Button>
      </div>
    </div>
  );
}
