import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Banknote } from "lucide-react";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { PaymentForm } from "@/features/payments/components/PaymentForm";
import { useCreatePayment } from "@/features/payments/hooks/usePayments";
import { paymentDefaultValues, type PaymentFormValues } from "@/features/payments/types/payment.types";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function PaymentCreatePage() {
  const navigate = useNavigate();
  const createPayment = useCreatePayment();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: PaymentFormValues, receipt?: File | null) => {
    setError(null);
    try {
      const payment = await createPayment.mutateAsync({ values, receipt });
      navigate(paths.payments.details(payment.uuid));
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <CompanyPageHeader icon={Banknote} tone="emerald" title="Add Payment" description="Record a new payment against an approved booking." />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <PaymentForm
        defaultValues={paymentDefaultValues}
        submitLabel="Create Payment"
        isSubmitting={createPayment.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(paths.payments.list)}
      />
    </div>
  );
}
