import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyForm } from "@/features/companies/components/CompanyForm";
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
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to={paths.companies.list} aria-label="Back to companies">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Company</h1>
          <p className="text-muted-foreground">
            Register a new tenant company on the platform.
          </p>
        </div>
      </div>

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
