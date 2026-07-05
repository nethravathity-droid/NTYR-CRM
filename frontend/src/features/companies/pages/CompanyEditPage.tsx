import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/shared/Loading";
import { CompanyForm } from "@/features/companies/components/CompanyForm";
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
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link
            to={paths.companies.details(company.uuid)}
            aria-label="Back to company details"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Company</h1>
          <p className="text-muted-foreground">
            Update details for {company.companyName}.
          </p>
        </div>
      </div>

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
