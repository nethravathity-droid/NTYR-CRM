import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FOLLOWUP_PRIORITY_LABELS,
  FOLLOWUP_STATUS_LABELS,
  FOLLOWUP_TYPE_LABELS,
  type FollowupListItem,
} from "@/features/followups/types/followup.types";
import { paths } from "@/routes/paths";

interface FollowupCardProps {
  followup: FollowupListItem;
  canUpdate?: boolean;
  canDelete?: boolean;
  onComplete?: (followup: FollowupListItem) => void;
  onReschedule?: (followup: FollowupListItem) => void;
  onDelete?: (followup: FollowupListItem) => void;
  isCompleting?: boolean;
}

export function FollowupCard({
  followup,
  canUpdate = false,
  canDelete = false,
  onComplete,
  onReschedule,
  onDelete,
  isCompleting = false,
}: FollowupCardProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">{followup.customerName}</h2>
            <span className="rounded-full bg-muted px-2 py-1 text-xs">
              {FOLLOWUP_TYPE_LABELS[followup.type]}
            </span>
            <span className="rounded-full bg-muted px-2 py-1 text-xs">
              {FOLLOWUP_STATUS_LABELS[followup.status]}
            </span>
            <span className="rounded-full bg-muted px-2 py-1 text-xs">
              {FOLLOWUP_PRIORITY_LABELS[followup.priority]}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Lead: {followup.lead?.leadNumber ?? "Unlinked"} • {followup.followupDate} {followup.followupTime}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Assigned: {followup.assignedEmployee?.displayName ?? "Unassigned"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Reminder: {followup.reminderBefore} min before
            {followup.nextFollowupDate ? ` • Next: ${followup.nextFollowupDate}` : ""}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Notes: {followup.notes ?? "No notes"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate(paths.followups.timeline(followup.uuid))}>
            Timeline
          </Button>
          {canUpdate ? (
            <>
              <Button variant="outline" onClick={() => navigate(paths.followups.edit(followup.uuid))}>
                Edit
              </Button>
              {followup.status !== "COMPLETED" ? (
                <Button disabled={isCompleting} onClick={() => onComplete?.(followup)}>
                  Complete
                </Button>
              ) : null}
              <Button variant="outline" onClick={() => onReschedule?.(followup)}>
                Reschedule
              </Button>
            </>
          ) : null}
          {canDelete ? (
            <Button variant="destructive" onClick={() => onDelete?.(followup)}>
              Delete
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
