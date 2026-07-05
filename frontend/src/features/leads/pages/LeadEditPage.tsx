import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { LeadForm } from "@/features/leads/components/LeadForm";
import { useLead, useUpdateLead } from "@/features/leads/hooks/useLeads";
import {
  leadDetailToFormValues,
  type LeadFormSchema,
} from "@/features/leads/schemas/lead.schema";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function LeadEditPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { data: lead, isLoading, error } = useLead(uuid);
  const updateLead = useUpdateLead(uuid ?? "");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (values: LeadFormSchema) => {
    if (!uuid) return;
    setSubmitError(null);

    try {
      await updateLead.mutateAsync(values);
      navigate(paths.leads.details(uuid));
    } catch (err) {
      setSubmitError(getApiErrorMessage(err));
    }
  };

  if (isLoading) {
    return <Loading label="Loading lead..." />;
  }

  if (error || !lead) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {getApiErrorMessage(error ?? new Error("Lead not found"))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={Pencil}
        tone="amber"
        title="Edit Lead"
        description={`Update ${lead.customerName} (${lead.leadNumber})`}
      />

      {submitError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {submitError}
        </div>
      ) : null}

      <LeadForm
        mode="edit"
        excludeUuid={lead.uuid}
        defaultValues={leadDetailToFormValues(lead)}
        submitLabel="Save Changes"
        isSubmitting={updateLead.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(paths.leads.details(lead.uuid))}
      />
    </div>
  );
}
