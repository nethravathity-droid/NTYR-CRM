import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { DeleteFollowupDialog } from "@/features/followups/components/DeleteFollowupDialog";
import { RescheduleFollowupDialog } from "@/features/followups/components/RescheduleFollowupDialog";
import {
  useCompleteFollowup,
  useDeleteFollowup,
  useRescheduleFollowup,
} from "@/features/followups/hooks/useFollowups";
import { followupsService } from "@/features/followups/services/followups.service";
import {
  FOLLOWUP_PRIORITY_LABELS,
  FOLLOWUP_STATUS_LABELS,
  FOLLOWUP_TYPE_LABELS,
} from "@/features/followups/types/followup.types";
import { usePermissions } from "@/hooks/usePermissions";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function FollowupTimelinePage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("leads.update");
  const canDelete = hasPermission("leads.delete");

  const { data: followup, isLoading } = useQuery({
    queryKey: ["followup", uuid],
    queryFn: () => followupsService.getByUuid(uuid!),
    enabled: Boolean(uuid),
  });

  const completeFollowup = useCompleteFollowup();
  const deleteFollowup = useDeleteFollowup();
  const rescheduleFollowup = useRescheduleFollowup();
  const [showReschedule, setShowReschedule] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleComplete = async () => {
    if (!followup) {
      return;
    }

    setActionError(null);
    try {
      await completeFollowup.mutateAsync(followup.uuid);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!followup) {
      return;
    }

    setActionError(null);
    try {
      await deleteFollowup.mutateAsync(followup.uuid);
      navigate(paths.followups.list);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const handleReschedule = async (values: { followupDate: string; followupTime: string; notes?: string | null }) => {
    if (!followup) {
      return;
    }

    setActionError(null);
    try {
      await rescheduleFollowup.mutateAsync({ uuid: followup.uuid, payload: values });
      setShowReschedule(false);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={Clock3}
        tone="emerald"
        title="Follow-up Timeline"
        description="Review schedule, ownership, and audit details for this follow-up."
        action={
          followup && canUpdate ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate(paths.followups.edit(followup.uuid))}>
                Edit
              </Button>
              {followup.status !== "COMPLETED" ? (
                <Button disabled={completeFollowup.isPending} onClick={handleComplete}>
                  Mark Complete
                </Button>
              ) : null}
              <Button variant="outline" onClick={() => setShowReschedule(true)}>
                Reschedule
              </Button>
              {canDelete ? (
                <Button variant="destructive" onClick={() => setShowDelete(true)}>
                  Delete
                </Button>
              ) : null}
            </div>
          ) : followup && canDelete ? (
            <Button variant="destructive" onClick={() => setShowDelete(true)}>
              Delete
            </Button>
          ) : undefined
        }
      />

      {isLoading ? <Loading label="Loading timeline..." /> : null}
      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}

      {followup ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>{followup.customerName}</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p><span className="font-medium text-foreground">Lead:</span> {followup.lead?.leadNumber ?? "Unlinked"}</p>
              <p><span className="font-medium text-foreground">Assigned:</span> {followup.assignedEmployee?.displayName ?? "Unassigned"}</p>
              <p><span className="font-medium text-foreground">Date:</span> {followup.followupDate} at {followup.followupTime}</p>
              <p><span className="font-medium text-foreground">Type:</span> {FOLLOWUP_TYPE_LABELS[followup.type]}</p>
              <p><span className="font-medium text-foreground">Status:</span> {FOLLOWUP_STATUS_LABELS[followup.status]}</p>
              <p><span className="font-medium text-foreground">Priority:</span> {FOLLOWUP_PRIORITY_LABELS[followup.priority]}</p>
              <p><span className="font-medium text-foreground">Reminder:</span> {followup.reminderBefore} minutes before</p>
              <p><span className="font-medium text-foreground">Next Follow-up:</span> {followup.nextFollowupDate ?? "Not set"}</p>
              <p><span className="font-medium text-foreground">Notes:</span> {followup.notes ?? "No notes"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Audit</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p><span className="font-medium text-foreground">Created:</span> {new Date(followup.createdAt).toLocaleString()}</p>
              <p><span className="font-medium text-foreground">Updated:</span> {new Date(followup.updatedAt).toLocaleString()}</p>
              <p><span className="font-medium text-foreground">Created By:</span> {followup.createdBy ?? "System"}</p>
              <p><span className="font-medium text-foreground">Updated By:</span> {followup.updatedBy ?? "System"}</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <RescheduleFollowupDialog
        followup={followup ?? null}
        open={showReschedule}
        isSubmitting={rescheduleFollowup.isPending}
        onOpenChange={setShowReschedule}
        onConfirm={handleReschedule}
      />

      <DeleteFollowupDialog
        followup={followup ?? null}
        open={showDelete}
        isDeleting={deleteFollowup.isPending}
        onOpenChange={setShowDelete}
        onConfirm={handleDelete}
      />
    </div>
  );
}
