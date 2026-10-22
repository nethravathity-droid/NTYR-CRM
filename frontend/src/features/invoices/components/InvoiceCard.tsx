import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermissions } from "@/hooks/usePermissions";
import { formatCurrency, INVOICE_STATUS_LABELS, type InvoiceListItem } from "@/features/invoices/types/invoice.types";

interface InvoiceCardProps {
  invoice: InvoiceListItem;
  onView?: (uuid: string) => void;
}

export function InvoiceCard({ invoice, onView }: InvoiceCardProps) {
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("invoices.update");
  const canDelete = hasPermission("invoices.delete");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">{invoice.invoiceNumber}</CardTitle>
        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
          {INVOICE_STATUS_LABELS[invoice.status]}
        </span>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between gap-4"><span className="text-muted-foreground">Customer</span><span>{invoice.customerName}</span></div>
        <div className="flex justify-between gap-4"><span className="text-muted-foreground">Project</span><span>{invoice.project?.projectName ?? "—"}</span></div>
        <div className="flex justify-between gap-4"><span className="text-muted-foreground">Unit</span><span>{invoice.unit?.unitNumber ?? "—"}</span></div>
        <div className="flex justify-between gap-4"><span className="text-muted-foreground">Due Date</span><span>{invoice.dueDate}</span></div>
        <div className="flex justify-between gap-4 text-base font-semibold"><span className="text-muted-foreground">Total</span><span>{formatCurrency(invoice.total)}</span></div>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onView?.(invoice.uuid)}>
            <FileText className="mr-2 h-4 w-4" /> View
          </Button>
          {canUpdate ? <Button variant="outline" size="sm" onClick={() => onView?.(invoice.uuid)}>Edit</Button> : null}
          {canDelete ? <Button variant="outline" size="sm" onClick={() => onView?.(invoice.uuid)}>Delete</Button> : null}
        </div>
      </CardContent>
    </Card>
  );
}
