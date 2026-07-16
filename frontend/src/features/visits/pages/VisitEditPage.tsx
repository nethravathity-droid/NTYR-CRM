import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapPinned } from "lucide-react";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { VisitForm } from "@/features/visits/components/VisitForm";
import { useUpdateVisit, useVisit } from "@/features/visits/hooks/useVisits";
import type { VisitFormValues } from "@/features/visits/types/visit.types";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function VisitEditPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { data: visit, isLoading } = useVisit(uuid ?? "");
  const updateVisit = useUpdateVisit(uuid ?? "");
  const [error, setError] = useState<string | null>(null);

  const defaultValues = useMemo<VisitFormValues | null>(() => {
    if (!visit) return null;
    return {
      leadId: visit.lead?.id ?? null,
      customerName: visit.customerName,
      mobile: visit.mobile,
      projectId: visit.project?.id ?? null,
      unitId: visit.unit?.id ?? null,
      visitDate: visit.visitDate,
      visitTime: visit.visitTime.slice(0, 5),
      assignedUserId: visit.assignedExecutive?.id ?? null,
      status: visit.status,
      transportationRequired: visit.transportationRequired,
      pickupLocation: visit.pickupLocation ?? "",
      feedback: visit.feedback ?? "",
      rating: visit.rating,
      nextAction: visit.nextAction ?? "",
      notes: visit.notes ?? "",
    };
  }, [visit]);

  const handleSubmit = async (values: VisitFormValues) => {
    if (!uuid) return;
    setError(null);
    try {
      await updateVisit.mutateAsync(values);
      navigate(paths.visits.details(uuid));
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  if (isLoading) return <Loading label="Loading visit..." />;

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={MapPinned}
        tone="emerald"
        title="Edit Visit"
        description={visit ? `${visit.visitNumber} — ${visit.customerName}` : "Update visit details"}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {defaultValues ? (
        <VisitForm
          defaultValues={defaultValues}
          submitLabel="Save Changes"
          isSubmitting={updateVisit.isPending}
          onSubmit={handleSubmit}
          onCancel={() => navigate(paths.visits.details(uuid!))}
        />
      ) : null}
    </div>
  );
}
