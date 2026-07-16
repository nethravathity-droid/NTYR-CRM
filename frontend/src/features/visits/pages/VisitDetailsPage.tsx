import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { History, MapPinned, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { DeleteVisitDialog } from "@/features/visits/components/DeleteVisitDialog";
import {
  useCancelVisit,
  useCompleteVisit,
  useDeleteVisit,
  useVisit,
  useVisitAuditTrail,
} from "@/features/visits/hooks/useVisits";
import { VISIT_STATUS_LABELS } from "@/features/visits/types/visit.types";
import { usePermissions } from "@/hooks/usePermissions";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

function formatDateTime(date: string, time: string): string {
  return `${date} at ${time.slice(0, 5)}`;
}

export function VisitDetailsPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("visits.update");
  const canDelete = hasPermission("visits.delete");

  const { data: visit, isLoading, error } = useVisit(uuid ?? "");
  const { data: auditTrail = [] } = useVisitAuditTrail(uuid ?? "");
  const completeVisit = useCompleteVisit();
  const cancelVisit = useCancelVisit();
  const deleteVisit = useDeleteVisit();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!uuid) return;
    setActionError(null);
    try {
      await deleteVisit.mutateAsync(uuid);
      navigate(paths.visits.list);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  const handleComplete = async () => {
    if (!uuid) return;
    setActionError(null);
    try {
      await completeVisit.mutateAsync({ uuid, payload: {} });
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  const handleCancel = async () => {
    if (!uuid) return;
    setActionError(null);
    try {
      await cancelVisit.mutateAsync({ uuid });
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  if (isLoading) return <Loading label="Loading visit details..." />;
  if (error || !visit) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Visit not found.</p>
        <Button variant="outline" onClick={() => navigate(paths.visits.list)}>Back to Visits</Button>
      </div>
    );
  }

  const canAct = canUpdate && visit.status !== "COMPLETED" && visit.status !== "CANCELLED";

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={MapPinned}
        tone="cyan"
        title={visit.customerName}
        description={`${visit.visitNumber} — ${formatDateTime(visit.visitDate, visit.visitTime)}`}
        action={
          <div className="flex flex-wrap gap-2">
            {canUpdate ? (
              <Button variant="outline" onClick={() => navigate(paths.visits.edit(visit.uuid))}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            ) : null}
            {canAct ? (
              <>
                <Button variant="outline" onClick={handleComplete} disabled={completeVisit.isPending}>Complete</Button>
                <Button variant="outline" onClick={handleCancel} disabled={cancelVisit.isPending}>Cancel Visit</Button>
              </>
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
          <CardHeader><CardTitle>Visit Information</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Status</span><Badge>{VISIT_STATUS_LABELS[visit.status]}</Badge></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Mobile</span><span>{visit.mobile}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Lead</span><span>{visit.lead ? `${visit.lead.leadNumber} — ${visit.lead.customerName}` : "—"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Project</span><span>{visit.project?.projectName ?? "—"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Unit</span><span>{visit.unit?.unitNumber ?? "—"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Executive</span><span>{visit.assignedExecutive?.displayName ?? visit.assignedExecutive?.employeeCode ?? "Unassigned"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Transportation</span><span>{visit.transportationRequired ? "Yes" : "No"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Pickup</span><span>{visit.pickupLocation ?? "—"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Rating</span><span>{visit.rating ?? "—"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Next Action</span><span>{visit.nextAction ?? "—"}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Feedback & Notes</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div><p className="mb-1 text-muted-foreground">Feedback</p><p>{visit.feedback ?? "No feedback yet."}</p></div>
            <div><p className="mb-1 text-muted-foreground">Notes</p><p>{visit.notes ?? "No notes."}</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <History className="h-5 w-5" />
          <CardTitle>Audit Trail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {auditTrail.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
          ) : (
            auditTrail.map((entry) => (
              <div key={entry.uuid} className="rounded-lg border p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium capitalize">{entry.action.replaceAll("_", " ").toLowerCase()}</span>
                  <span className="text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-muted-foreground">{entry.performerName ?? "System"}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Button variant="outline" asChild>
        <Link to={paths.visits.list}>Back to Visits</Link>
      </Button>

      <DeleteVisitDialog
        visit={visit}
        open={showDeleteDialog}
        isDeleting={deleteVisit.isPending}
        onConfirm={handleDelete}
        onOpenChange={setShowDeleteDialog}
      />
    </div>
  );
}
