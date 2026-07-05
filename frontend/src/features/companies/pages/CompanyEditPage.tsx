import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import { Loading } from "@/components/shared/Loading";
import { CompanyForm } from "@/features/companies/components/CompanyForm";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import {
  useCompany,
  useUpdateCompany,
} from "@/features/companies/hooks/useCompanies";
import { mapCompanyToFormValues } from "@/features/companies/schemas/company.schema";
import type { CompanyFormSchema } from "@/features/companies/schemas/company.schema";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function CompanyEditPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { data: company, isLoading, error } = useCompany(uuid);
  const updateCompany = useUpdateCompany(uuid ?? "");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (values: CompanyFormSchema) => {
    if (!uuid) {
      return;
    }

    setSubmitError(null);

    try {
      await updateCompany.mutateAsync(values);
      navigate(paths.companies.details(uuid));
    } catch (err) {
      setSubmitError(getApiErrorMessage(err));
    }
  };

  if (isLoading) {
    return <Loading label="Loading company..." />;
  }

  if (error || !company) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {error ? getApiErrorMessage(error) : "Company not found"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={Pencil}
        tone="violet"
        title="Edit Company"
        description={`Update details for ${company.companyName}.`}
      />

      {submitError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {submitError}
        </div>
      ) : null}

      <CompanyForm
        defaultValues={mapCompanyToFormValues(company)}
        submitLabel="Save Changes"
        isSubmitting={updateCompany.isPending}
        disableCode={company.companyCode === "PLATFORM"}
        onSubmit={handleSubmit}
        onCancel={() => navigate(paths.companies.details(company.uuid))}
      />
    </div>
  );
}
