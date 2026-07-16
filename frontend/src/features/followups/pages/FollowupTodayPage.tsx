import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { DeleteFollowupDialog } from "@/features/followups/components/DeleteFollowupDialog";
import { FollowupCard } from "@/features/followups/components/FollowupCard";
import { RescheduleFollowupDialog } from "@/features/followups/components/RescheduleFollowupDialog";
import {
  useCompleteFollowup,
  useDeleteFollowup,
  useOverdueFollowups,
  useRescheduleFollowup,
  useTodayFollowups,
} from "@/features/followups/hooks/useFollowups";
import type { FollowupListItem } from "@/features/followups/types/followup.types";
import { usePermissions } from "@/hooks/usePermissions";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function FollowupTodayPage() {
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("leads.update");
  const canDelete = hasPermission("leads.delete");

  const { data: todayFollowups = [], isLoading: isLoadingToday } = useTodayFollowups();
  const { data: overdueFollowups = [], isLoading: isLoadingOverdue } = useOverdueFollowups();
  const completeFollowup = useCompleteFollowup();
  const deleteFollowup = useDeleteFollowup();
  const rescheduleFollowup = useRescheduleFollowup();

  const [followupToDelete, setFollowupToDelete] = useState<FollowupListItem | null>(null);
  const [followupToReschedule, setFollowupToReschedule] = useState<FollowupListItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleComplete = async (followup: FollowupListItem) => {
    setActionError(null);
    try {
      await completeFollowup.mutateAsync(followup.uuid);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!followupToDelete) {
      return;
    }

    setActionError(null);
    try {
      await deleteFollowup.mutateAsync(followupToDelete.uuid);
      setFollowupToDelete(null);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const handleReschedule = async (values: { followupDate: string; followupTime: string; notes?: string | null }) => {
    if (!followupToReschedule) {
      return;
    }

    setActionError(null);
    try {
      await rescheduleFollowup.mutateAsync({ uuid: followupToReschedule.uuid, payload: values });
      setFollowupToReschedule(null);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={CalendarClock}
        tone="amber"
        title="Today's Follow-ups"
        description="Review today's schedule and overdue items that need attention."
        action={
          <Button variant="outline" asChild>
            <Link to={paths.followups.list}>All Follow-ups</Link>
          </Button>
        }
      />

      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Today ({todayFollowups.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingToday ? <Loading label="Loading today's follow-ups..." /> : null}
          {!isLoadingToday && todayFollowups.length === 0 ? (
            <p className="text-muted-foreground">No follow-ups scheduled for today.</p>
          ) : null}
          {todayFollowups.map((followup) => (
            <FollowupCard
              key={followup.uuid}
              followup={followup}
              canUpdate={canUpdate}
              canDelete={canDelete}
              isCompleting={completeFollowup.isPending}
              onComplete={handleComplete}
              onReschedule={setFollowupToReschedule}
              onDelete={setFollowupToDelete}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Overdue ({overdueFollowups.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingOverdue ? <Loading label="Loading overdue follow-ups..." /> : null}
          {!isLoadingOverdue && overdueFollowups.length === 0 ? (
            <p className="text-muted-foreground">No overdue follow-ups.</p>
          ) : null}
          {overdueFollowups.map((followup) => (
            <FollowupCard
              key={followup.uuid}
              followup={followup}
              canUpdate={canUpdate}
              canDelete={canDelete}
              isCompleting={completeFollowup.isPending}
              onComplete={handleComplete}
              onReschedule={setFollowupToReschedule}
              onDelete={setFollowupToDelete}
            />
          ))}
        </CardContent>
      </Card>

      <DeleteFollowupDialog
        followup={followupToDelete}
        open={Boolean(followupToDelete)}
        isDeleting={deleteFollowup.isPending}
        onOpenChange={(open) => !open && setFollowupToDelete(null)}
        onConfirm={handleDelete}
      />

      <RescheduleFollowupDialog
        followup={followupToReschedule}
        open={Boolean(followupToReschedule)}
        isSubmitting={rescheduleFollowup.isPending}
        onOpenChange={(open) => !open && setFollowupToReschedule(null)}
        onConfirm={handleReschedule}
      />
    </div>
  );
}
