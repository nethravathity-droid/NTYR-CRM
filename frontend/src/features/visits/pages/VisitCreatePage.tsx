import { useNavigate } from "react-router-dom";
import { MapPinned } from "lucide-react";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { VisitForm } from "@/features/visits/components/VisitForm";
import { useCreateVisit } from "@/features/visits/hooks/useVisits";
import { visitDefaultValues, type VisitFormValues } from "@/features/visits/types/visit.types";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";
import { useState } from "react";

export function VisitCreatePage() {
  const navigate = useNavigate();
  const createVisit = useCreateVisit();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: VisitFormValues) => {
    setError(null);
    try {
      const visit = await createVisit.mutateAsync(values);
      navigate(paths.visits.details(visit.uuid));
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={MapPinned}
        tone="emerald"
        title="Schedule Visit"
        description="Create a new site visit for a lead or customer."
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <VisitForm
        defaultValues={visitDefaultValues}
        submitLabel="Schedule Visit"
        isSubmitting={createVisit.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(paths.visits.list)}
      />
    </div>
  );
}
