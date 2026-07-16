import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PencilLine } from "lucide-react";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { FollowupForm } from "@/features/followups/components/FollowupForm";
import { useUpdateFollowup } from "@/features/followups/hooks/useFollowups";
import { followupsService } from "@/features/followups/services/followups.service";
import { useQuery } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";
import type { FollowupFormValues } from "@/features/followups/types/followup.types";

export function FollowupEditPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const updateFollowup = useUpdateFollowup(uuid ?? "");
  const [error, setError] = useState<string | null>(null);

  const { data: followup, isLoading } = useQuery({
    queryKey: ["followup", uuid],
    queryFn: () => followupsService.getByUuid(uuid!),
    enabled: Boolean(uuid),
  });

  const defaultValues = useMemo(() => followup ? {
    leadId: followup.lead?.id ?? null,
    customerName: followup.customerName,
    assignedUserId: followup.assignedEmployee?.id ?? null,
    followupDate: followup.followupDate,
    followupTime: followup.followupTime,
    type: followup.type,
    priority: followup.priority,
    status: followup.status,
    notes: followup.notes ?? "",
    reminderBefore: followup.reminderBefore,
    nextFollowupDate: followup.nextFollowupDate ?? "",
  } : undefined, [followup]);

  const handleSubmit = async (values: FollowupFormValues) => {
    setError(null);
    try {
      await updateFollowup.mutateAsync(values);
      navigate(paths.followups.list);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <CompanyPageHeader icon={PencilLine} tone="amber" title="Edit Follow-up" description="Adjust the follow-up details and scheduling." />
      {error ? <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div> : null}
      {isLoading ? <p className="text-muted-foreground">Loading follow-up...</p> : null}
      {followup ? <FollowupForm mode="edit" defaultValues={defaultValues} submitLabel="Save Changes" isSubmitting={updateFollowup.isPending} onSubmit={handleSubmit} onCancel={() => navigate(paths.followups.list)} /> : null}
    </div>
  );
}
