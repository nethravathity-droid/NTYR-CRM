import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { LeadForm } from "@/features/leads/components/LeadForm";
import { useCreateLead } from "@/features/leads/hooks/useLeads";
import type { LeadFormSchema } from "@/features/leads/schemas/lead.schema";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function LeadCreatePage() {
  const navigate = useNavigate();
  const createLead = useCreateLead();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: LeadFormSchema) => {
    setError(null);
    try {
      const lead = await createLead.mutateAsync(values);
      navigate(paths.leads.details(lead.uuid));
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={UserPlus}
        tone="emerald"
        title="Add Lead"
        description="Create a new sales lead with contact and interest details."
      />

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <LeadForm
        mode="create"
        submitLabel="Create Lead"
        isSubmitting={createLead.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(paths.leads.list)}
      />
    </div>
  );
}
