import { useNavigate } from "react-router-dom";
import { MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { VisitListItem } from "@/features/visits/types/visit.types";
import { VISIT_STATUS_LABELS } from "@/features/visits/types/visit.types";
import { paths } from "@/routes/paths";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  SCHEDULED: "secondary",
  CONFIRMED: "default",
  COMPLETED: "outline",
  CANCELLED: "destructive",
  NO_SHOW: "destructive",
};

interface VisitCardProps {
  visit: VisitListItem;
  canUpdate?: boolean;
  canDelete?: boolean;
  onComplete?: (visit: VisitListItem) => void;
  onCancel?: (visit: VisitListItem) => void;
  onDelete?: (visit: VisitListItem) => void;
}

export function VisitCard({ visit, canUpdate, canDelete, onComplete, onCancel, onDelete }: VisitCardProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={STATUS_VARIANT[visit.status] ?? "secondary"}>{VISIT_STATUS_LABELS[visit.status]}</Badge>
            <span className="text-sm font-medium text-muted-foreground">{visit.visitNumber}</span>
          </div>
          <div>
            <p className="font-semibold">{visit.customerName}</p>
            <p className="text-sm text-muted-foreground">{visit.mobile}</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>{visit.visitDate} at {visit.visitTime.slice(0, 5)}</span>
            {visit.project ? <span>{visit.project.projectName}</span> : null}
            {visit.assignedExecutive ? <span>{visit.assignedExecutive.displayName ?? visit.assignedExecutive.employeeCode}</span> : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate(paths.visits.details(visit.uuid))}>Details</Button>
          {canUpdate ? <Button variant="outline" onClick={() => navigate(paths.visits.edit(visit.uuid))}>Edit</Button> : null}
          {canUpdate && visit.status !== "COMPLETED" && visit.status !== "CANCELLED" && onComplete ? (
            <Button variant="outline" onClick={() => onComplete(visit)}>Complete</Button>
          ) : null}
          {canUpdate && visit.status !== "COMPLETED" && visit.status !== "CANCELLED" && onCancel ? (
            <Button variant="outline" onClick={() => onCancel(visit)}>Cancel</Button>
          ) : null}
          {canDelete && onDelete ? <Button variant="destructive" onClick={() => onDelete(visit)}>Delete</Button> : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function VisitEmptyState({ canCreate }: { canCreate?: boolean }) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <MapPinned className="h-10 w-10 text-muted-foreground" />
        <div>
          <p className="font-medium">No site visits found</p>
          <p className="text-sm text-muted-foreground">Schedule a visit to track customer site tours.</p>
        </div>
        {canCreate ? <Button onClick={() => navigate(paths.visits.create)}>Schedule Visit</Button> : null}
      </CardContent>
    </Card>
  );
}
