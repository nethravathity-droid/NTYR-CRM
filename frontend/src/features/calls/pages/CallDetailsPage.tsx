import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { History, Pencil, PhoneCall, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { CallDirectionBadge } from "@/features/calls/components/CallDirectionBadge";
import { CallStatusBadge } from "@/features/calls/components/CallStatusBadge";
import { DeleteCallDialog } from "@/features/calls/components/DeleteCallDialog";
import { useCall, useCallTimeline, useDeleteCall } from "@/features/calls/hooks/useCalls";
import { buildTelLink, formatCallDuration } from "@/features/calls/types/call.types";
import { usePermissions } from "@/hooks/usePermissions";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function CallDetailsPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("calls.update");
  const canDelete = hasPermission("calls.delete");

  const { data: call, isLoading, error } = useCall(uuid ?? "");
  const { data: timelineData } = useCallTimeline(uuid ?? "");
  const deleteCall = useDeleteCall();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!uuid) return;
    setActionError(null);
    try {
      await deleteCall.mutateAsync(uuid);
      navigate(paths.calls.list);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  if (isLoading) return <Loading label="Loading call details..." />;
  if (error || !call) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Call not found.</p>
        <Button variant="outline" onClick={() => navigate(paths.calls.list)}>Back to Calls</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={PhoneCall}
        tone="violet"
        title={call.customerName}
        description={`${call.callNumber} — ${call.callDate} ${call.callTime.slice(0, 5)}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <a href={buildTelLink(call.mobile)}><PhoneCall className="mr-2 h-4 w-4" />Click to Call</a>
            </Button>
            {canUpdate ? (
              <Button variant="outline" onClick={() => navigate(paths.calls.edit(call.uuid))}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            ) : null}
            {canDelete ? (
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            ) : null}
          </div>
        }
      />

      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Call Information</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Direction</span><CallDirectionBadge direction={call.direction} /></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Status</span><CallStatusBadge status={call.callStatus} /></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Mobile</span><span>{call.mobile}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Duration</span><span>{formatCallDuration(call.durationSeconds)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Lead</span><span>{call.lead ? <Link className="text-primary hover:underline" to={paths.leads.details(call.lead.uuid)}>{call.lead.leadNumber} — {call.lead.customerName}</Link> : "—"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Executive</span><span>{call.assignedExecutive?.displayName ?? call.assignedExecutive?.employeeCode ?? "Unassigned"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Follow-up</span><span>{call.followup ? <Link className="text-primary hover:underline" to={paths.followups.edit(call.followup.uuid)}>{call.followup.followupDate} {call.followup.followupTime.slice(0, 5)}</Link> : "—"}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Call Notes</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{call.notes ?? "No notes recorded."}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <History className="h-5 w-5" />
          <CardTitle>Call History Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(timelineData?.timeline ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No timeline entries yet.</p>
          ) : null}
          {(timelineData?.timeline ?? []).map((entry) => (
            <div key={`${entry.type}-${entry.uuid}`} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{entry.title}</p>
                  <p className="text-sm text-muted-foreground">{entry.description ?? entry.type}</p>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</p>
              </div>
              {entry.performedBy ? <p className="mt-2 text-xs text-muted-foreground">By {entry.performedBy}</p> : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <DeleteCallDialog
        call={call}
        open={showDeleteDialog}
        isDeleting={deleteCall.isPending}
        onConfirm={() => void handleDelete()}
        onOpenChange={setShowDeleteDialog}
      />
    </div>
  );
}
