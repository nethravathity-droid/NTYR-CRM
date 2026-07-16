import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";
import { usePayment, useUploadPaymentReceipt } from "@/features/payments/hooks/usePayments";
import { formatCurrency, resolveFileUrl } from "@/features/payments/types/payment.types";
import { env } from "@/config/env";
import { getApiErrorMessage } from "@/lib/api/client";
import { usePermissions } from "@/hooks/usePermissions";
import { paths } from "@/routes/paths";

export function PaymentReceiptPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("payments.update");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const { data: payment, isLoading } = usePayment(uuid ?? "");
  const uploadReceipt = useUploadPaymentReceipt(uuid ?? "");

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !uuid) return;

    setActionError(null);
    setUploadMessage(null);
    try {
      await uploadReceipt.mutateAsync(file);
      setUploadMessage("Receipt uploaded successfully.");
      event.target.value = "";
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  if (isLoading) return <Loading label="Loading receipt..." />;
  if (!payment) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Payment not found.</p>
        <Button variant="outline" asChild><Link to={paths.payments.list}>Back to Payments</Link></Button>
      </div>
    );
  }

  const receiptUrl = payment.receiptFileUrl ? resolveFileUrl(payment.receiptFileUrl, env.VITE_API_BASE_URL) : null;
  const isPdf = payment.receiptMimeType?.includes("pdf") ?? receiptUrl?.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={FileText}
        tone="emerald"
        title="Receipt Viewer"
        description={`${payment.paymentNumber} — ${payment.customerName}`}
        action={
          <Button variant="outline" asChild><Link to={paths.payments.details(payment.uuid)}>Payment Details</Link></Button>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Receipt Details</CardTitle>
          <PaymentStatusBadge status={payment.status} />
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">Receipt Number</span><span>{payment.receiptNumber ?? "—"}</span></div>
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">Amount</span><span className="font-semibold">{formatCurrency(payment.amount)}</span></div>
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">File</span><span>{payment.receiptOriginalFileName ?? "No receipt attached"}</span></div>
        </CardContent>
      </Card>

      {canUpdate ? (
        <Card>
          <CardHeader><CardTitle>Upload Receipt</CardTitle></CardHeader>
          <CardContent>
            <input ref={fileInputRef} type="file" className="hidden" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={handleUpload} />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploadReceipt.isPending}>
              <Upload className="mr-2 h-4 w-4" />
              {uploadReceipt.isPending ? "Uploading..." : "Upload Receipt"}
            </Button>
            {actionError ? <p className="mt-3 text-sm text-destructive">{actionError}</p> : null}
            {uploadMessage ? <p className="mt-3 text-sm text-emerald-600">{uploadMessage}</p> : null}
          </CardContent>
        </Card>
      ) : null}

      {receiptUrl ? (
        <Card>
          <CardHeader><CardTitle>Receipt Preview</CardTitle></CardHeader>
          <CardContent>
            {isPdf ? (
              <iframe title="Payment receipt" src={receiptUrl} className="h-[70vh] w-full rounded-lg border" />
            ) : (
              <img src={receiptUrl} alt={payment.receiptOriginalFileName ?? "Payment receipt"} className="max-h-[70vh] w-full rounded-lg border object-contain" />
            )}
            <div className="mt-4">
              <Button variant="outline" asChild><a href={receiptUrl} target="_blank" rel="noreferrer">Open in New Tab</a></Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No receipt uploaded for this payment yet.</CardContent></Card>
      )}
    </div>
  );
}
