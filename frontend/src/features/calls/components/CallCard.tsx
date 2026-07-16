import { Link } from "react-router-dom";
import { Phone, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CallDirectionBadge } from "@/features/calls/components/CallDirectionBadge";
import { CallStatusBadge } from "@/features/calls/components/CallStatusBadge";
import {
  buildTelLink,
  formatCallDuration,
  type CallListItem,
} from "@/features/calls/types/call.types";
import { paths } from "@/routes/paths";

interface CallCardProps {
  call: CallListItem;
  canUpdate?: boolean;
  canDelete?: boolean;
  onEdit?: (call: CallListItem) => void;
  onDelete?: (call: CallListItem) => void;
}

export function CallCard({ call, canUpdate, canDelete, onEdit, onDelete }: CallCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
        <div>
          <CardTitle className="text-lg">
            <Link to={paths.calls.details(call.uuid)} className="hover:underline">
              {call.customerName}
            </Link>
          </CardTitle>
          <p className="text-sm text-muted-foreground">{call.callNumber} · {call.callDate} {call.callTime.slice(0, 5)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CallDirectionBadge direction={call.direction} />
          <CallStatusBadge status={call.callStatus} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-muted-foreground">{call.mobile}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <a href={buildTelLink(call.mobile)}>
                <PhoneCall className="mr-2 h-4 w-4" />
                Click to Call
              </a>
            </Button>
            {canUpdate && onEdit ? (
              <Button size="sm" variant="outline" onClick={() => onEdit(call)}>Edit</Button>
            ) : null}
            {canDelete && onDelete ? (
              <Button size="sm" variant="destructive" onClick={() => onDelete(call)}>Delete</Button>
            ) : null}
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          <div><span className="text-muted-foreground">Duration:</span> {formatCallDuration(call.durationSeconds)}</div>
          <div><span className="text-muted-foreground">Lead:</span> {call.lead ? call.lead.leadNumber : "—"}</div>
          <div><span className="text-muted-foreground">Executive:</span> {call.assignedExecutive?.displayName ?? call.assignedExecutive?.employeeCode ?? "—"}</div>
        </div>
        {call.notes ? <p className="text-muted-foreground">{call.notes}</p> : null}
      </CardContent>
    </Card>
  );
}

export function CallEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
      <Phone className="mb-3 h-10 w-10 text-muted-foreground" />
      <h3 className="text-lg font-medium">No calls found</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Log incoming, outgoing, or missed calls to track customer conversations.
      </p>
    </div>
  );
}
