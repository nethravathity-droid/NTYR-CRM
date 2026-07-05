import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { CompanyForm } from "@/features/companies/components/CompanyForm";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { useCreateCompany } from "@/features/companies/hooks/useCompanies";
import type { CompanyFormSchema } from "@/features/companies/schemas/company.schema";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function CompanyCreatePage() {
  const navigate = useNavigate();
  const createCompany = useCreateCompany();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: CompanyFormSchema) => {
    setError(null);

    try {
      const company = await createCompany.mutateAsync(values);
      navigate(paths.companies.details(company.uuid));
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    }
  };

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={Building2}
        tone="emerald"
        title="Add Company"
        description="Register a new tenant company on the platform."
      />

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <CompanyForm
        submitLabel="Create Company"
        isSubmitting={createCompany.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(paths.companies.list)}
      />
    </div>
  );
}
