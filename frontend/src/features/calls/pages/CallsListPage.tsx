import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, PhoneCall, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { CallCard, CallEmptyState } from "@/features/calls/components/CallCard";
import { DeleteCallDialog } from "@/features/calls/components/DeleteCallDialog";
import { useCallFormOptions, useCalls, useDeleteCall } from "@/features/calls/hooks/useCalls";
import {
  CALL_DIRECTION_LABELS,
  CALL_STATUS_LABELS,
  type CallDirection,
  type CallListItem,
  type CallStatus,
} from "@/features/calls/types/call.types";
import { usePermissions } from "@/hooks/usePermissions";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function CallsListPage() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("calls.create");
  const canUpdate = hasPermission("calls.update");
  const canDelete = hasPermission("calls.delete");

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [direction, setDirection] = useState<CallDirection | "">("");
  const [callStatus, setCallStatus] = useState<CallStatus | "">("");
  const [assignedUserId, setAssignedUserId] = useState<number | "">("");
  const [callToDelete, setCallToDelete] = useState<CallListItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: formOptions } = useCallFormOptions();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const params = useMemo(
    () => ({
      page,
      limit: 10,
      search: search || undefined,
      direction: direction || undefined,
      callStatus: callStatus || undefined,
      assignedUserId: assignedUserId || undefined,
      sortBy: "call_date" as const,
      sortOrder: "desc" as const,
    }),
    [page, search, direction, callStatus, assignedUserId],
  );

  const { data, isLoading } = useCalls(params);
  const deleteCall = useDeleteCall();

  const handleDelete = async () => {
    if (!callToDelete) return;
    setActionError(null);
    try {
      await deleteCall.mutateAsync(callToDelete.uuid);
      setCallToDelete(null);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={PhoneCall}
        tone="violet"
        title="Call Logs"
        description="Search and manage incoming, outgoing, and missed calls."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild><Link to={paths.calls.dashboard}>Dashboard</Link></Button>
            {canCreate ? (
              <Button onClick={() => navigate(paths.calls.create)}>
                <Plus className="mr-2 h-4 w-4" />
                Log Call
              </Button>
            ) : null}
          </div>
        }
      />

      <Card>
        <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <Input placeholder="Search customer, mobile, call #..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          <Select value={direction} onChange={(e) => { setDirection(e.target.value as CallDirection | ""); setPage(1); }}>
            <option value="">All directions</option>
            {Object.entries(CALL_DIRECTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
          <Select value={callStatus} onChange={(e) => { setCallStatus(e.target.value as CallStatus | ""); setPage(1); }}>
            <option value="">All statuses</option>
            {Object.entries(CALL_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
          <Select value={assignedUserId} onChange={(e) => { setAssignedUserId(e.target.value ? Number(e.target.value) : ""); setPage(1); }}>
            <option value="">All executives</option>
            {formOptions?.assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>{assignee.displayName ?? assignee.employeeCode}</option>
            ))}
          </Select>
        </CardContent>
      </Card>

      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
      {isLoading ? <Loading label="Loading calls..." /> : null}

      {!isLoading && data?.calls.length === 0 ? <CallEmptyState /> : null}

      <div className="space-y-4">
        {data?.calls.map((call) => (
          <CallCard
            key={call.uuid}
            call={call}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onEdit={(item) => navigate(paths.calls.edit(item.uuid))}
            onDelete={setCallToDelete}
          />
        ))}
      </div>

      {data && data.pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {data.pagination.page} of {data.pagination.totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}

      <DeleteCallDialog
        call={callToDelete}
        open={Boolean(callToDelete)}
        isDeleting={deleteCall.isPending}
        onConfirm={() => void handleDelete()}
        onOpenChange={(open) => !open && setCallToDelete(null)}
      />
    </div>
  );
}
