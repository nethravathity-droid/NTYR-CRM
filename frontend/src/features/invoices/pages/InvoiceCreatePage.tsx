import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { InvoiceForm } from "@/features/invoices/components/InvoiceForm";
import { useCreateInvoice } from "@/features/invoices/hooks/useInvoices";
import { invoiceDefaultValues, type InvoiceFormValues } from "@/features/invoices/types/invoice.types";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function InvoiceCreatePage() {
  const navigate = useNavigate();
  const createInvoice = useCreateInvoice();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: InvoiceFormValues) => {
    setError(null);
    try {
      const invoice = await createInvoice.mutateAsync(values);
      navigate(paths.invoices.details(invoice.uuid));
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <CompanyPageHeader icon={FileText} tone="emerald" title="Create Invoice" description="Create a new invoice for a customer." />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <InvoiceForm
        defaultValues={invoiceDefaultValues}
        submitLabel="Create Invoice"
        isSubmitting={createInvoice.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(paths.invoices.list)}
      />
    </div>
  );
}
