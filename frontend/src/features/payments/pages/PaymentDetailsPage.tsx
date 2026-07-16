import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Banknote, FileText, History, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { DeletePaymentDialog } from "@/features/payments/components/DeletePaymentDialog";
import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";
import { useDeletePayment, usePayment, usePaymentAuditTrail } from "@/features/payments/hooks/usePayments";
import {
  formatCurrency,
  PAYMENT_MODE_LABELS,
  PAYMENT_TYPE_LABELS,
} from "@/features/payments/types/payment.types";
import { usePermissions } from "@/hooks/usePermissions";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function PaymentDetailsPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("payments.update");
  const canDelete = hasPermission("payments.delete");

  const { data: payment, isLoading } = usePayment(uuid ?? "");
  const { data: auditTrail = [] } = usePaymentAuditTrail(uuid ?? "");
  const deletePayment = useDeletePayment();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!uuid) return;
    setActionError(null);
    try {
      await deletePayment.mutateAsync(uuid);
      navigate(paths.payments.list);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  if (isLoading) return <Loading label="Loading payment details..." />;
  if (!payment) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Payment not found.</p>
        <Button variant="outline" onClick={() => navigate(paths.payments.list)}>Back to Payments</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={Banknote}
        tone="emerald"
        title={payment.customerName}
        description={`${payment.paymentNumber} — ${PAYMENT_TYPE_LABELS[payment.paymentType]}`}
        action={
          <div className="flex flex-wrap gap-2">
            {canUpdate ? <Button variant="outline" onClick={() => navigate(paths.payments.edit(payment.uuid))}><Pencil className="mr-2 h-4 w-4" />Edit</Button> : null}
            {payment.hasReceipt || payment.receiptFileUrl ? (
              <Button variant="outline" onClick={() => navigate(paths.payments.receipt(payment.uuid))}><FileText className="mr-2 h-4 w-4" />Receipt</Button>
            ) : null}
            {canDelete ? <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}><Trash2 className="mr-2 h-4 w-4" />Delete</Button> : null}
          </div>
        }
      />

      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Payment Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Status</span><PaymentStatusBadge status={payment.status} /></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Booking</span><span>{payment.booking.bookingNumber}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Project</span><span>{payment.project.projectName}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Unit</span><span>{payment.unit.unitNumber}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Due Date</span><span>{payment.dueDate}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Payment Date</span><span>{payment.paymentDate ?? "—"}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Amount & Transaction</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Amount</span><span className="font-semibold">{formatCurrency(payment.amount)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Due Amount</span><span>{formatCurrency(payment.dueAmount)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Payment Mode</span><span>{payment.paymentMode ? PAYMENT_MODE_LABELS[payment.paymentMode] : "—"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Transaction Ref</span><span>{payment.transactionReference ?? "—"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Bank</span><span>{payment.bankName ?? "—"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Receipt No.</span><span>{payment.receiptNumber ?? "—"}</span></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
        <CardContent className="text-sm">{payment.notes ?? "No notes."}</CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2"><History className="h-5 w-5" /><CardTitle>Activity Timeline</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {auditTrail.length === 0 ? <p className="text-sm text-muted-foreground">No activity recorded yet.</p> : null}
          {auditTrail.map((entry) => (
            <div key={entry.uuid} className="rounded-lg border p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium capitalize">{entry.action.replaceAll("_", " ").toLowerCase()}</span>
                <span className="text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-1 text-muted-foreground">{entry.performerName ?? "System"}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button variant="outline" asChild><Link to={paths.payments.list}>Back to Payments</Link></Button>

      <DeletePaymentDialog
        payment={payment}
        open={showDeleteDialog}
        isDeleting={deletePayment.isPending}
        onConfirm={handleDelete}
        onOpenChange={setShowDeleteDialog}
      />
    </div>
  );
}
