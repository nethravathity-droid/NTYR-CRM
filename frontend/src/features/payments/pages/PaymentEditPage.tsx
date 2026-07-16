import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Banknote } from "lucide-react";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { PaymentForm } from "@/features/payments/components/PaymentForm";
import { usePayment, useUpdatePayment } from "@/features/payments/hooks/usePayments";
import type { PaymentFormValues } from "@/features/payments/types/payment.types";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function PaymentEditPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { data: payment, isLoading } = usePayment(uuid ?? "");
  const updatePayment = useUpdatePayment(uuid ?? "");
  const [error, setError] = useState<string | null>(null);

  const defaultValues = useMemo<PaymentFormValues | null>(() => {
    if (!payment) return null;
    return {
      bookingId: payment.booking.id,
      customerName: payment.customerName,
      projectId: payment.project.id,
      unitId: payment.unit.id,
      paymentType: payment.paymentType,
      amount: payment.amount,
      dueAmount: payment.dueAmount,
      dueDate: payment.dueDate,
      paymentDate: payment.paymentDate ?? "",
      paymentMode: payment.paymentMode ?? "",
      transactionReference: payment.transactionReference ?? "",
      bankName: payment.bankName ?? "",
      receiptNumber: payment.receiptNumber ?? "",
      status: payment.status,
      notes: payment.notes ?? "",
    };
  }, [payment]);

  const handleSubmit = async (values: PaymentFormValues, receipt?: File | null) => {
    if (!uuid) return;
    setError(null);
    try {
      await updatePayment.mutateAsync({ values, receipt });
      navigate(paths.payments.details(uuid));
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  if (isLoading) return <Loading label="Loading payment..." />;

  return (
    <div className="space-y-6">
      <CompanyPageHeader icon={Banknote} tone="emerald" title="Edit Payment" description={payment ? `${payment.paymentNumber} — ${payment.customerName}` : "Update payment details"} />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {defaultValues ? (
        <PaymentForm
          defaultValues={defaultValues}
          submitLabel="Save Changes"
          isSubmitting={updatePayment.isPending}
          onSubmit={handleSubmit}
          onCancel={() => navigate(paths.payments.details(uuid!))}
        />
      ) : null}
    </div>
  );
}
