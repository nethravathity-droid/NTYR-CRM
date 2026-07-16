import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { DeleteFollowupDialog } from "@/features/followups/components/DeleteFollowupDialog";
import { FollowupCard } from "@/features/followups/components/FollowupCard";
import { RescheduleFollowupDialog } from "@/features/followups/components/RescheduleFollowupDialog";
import {
  useCompleteFollowup,
  useDeleteFollowup,
  useFollowups,
  useOverdueFollowups,
  useRescheduleFollowup,
  useTodayFollowups,
} from "@/features/followups/hooks/useFollowups";
import {
  FOLLOWUP_PRIORITY_LABELS,
  FOLLOWUP_STATUS_LABELS,
  FOLLOWUP_TYPE_LABELS,
  type FollowupListItem,
  type FollowupPriority,
  type FollowupStatus,
  type FollowupType,
} from "@/features/followups/types/followup.types";
import { usePermissions } from "@/hooks/usePermissions";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function FollowupsListPage() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("leads.create");
  const canUpdate = hasPermission("leads.update");
  const canDelete = hasPermission("leads.delete");

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<FollowupStatus | "">("");
  const [priority, setPriority] = useState<FollowupPriority | "">("");
  const [type, setType] = useState<FollowupType | "">("");
  const [followupToDelete, setFollowupToDelete] = useState<FollowupListItem | null>(null);
  const [followupToReschedule, setFollowupToReschedule] = useState<FollowupListItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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
      status: status || undefined,
      priority: priority || undefined,
      type: type || undefined,
      sortBy: "followup_date" as const,
      sortOrder: "asc" as const,
    }),
    [page, search, status, priority, type],
  );

  const { data, isLoading } = useFollowups(params);
  const { data: todayFollowups = [] } = useTodayFollowups();
  const { data: overdueFollowups = [] } = useOverdueFollowups();
  const completeFollowup = useCompleteFollowup();
  const deleteFollowup = useDeleteFollowup();
  const rescheduleFollowup = useRescheduleFollowup();

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
        icon={CalendarDays}
        tone="violet"
        title="Follow-up Management"
        description="Track calls, meetings, site visits, and next-step actions."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to={paths.followups.today}>Today</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={paths.followups.calendar}>Calendar</Link>
            </Button>
            {canCreate ? (
              <Button onClick={() => navigate(paths.followups.create)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Follow-up
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Today</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-semibold">{todayFollowups.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Overdue</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-semibold">{overdueFollowups.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-semibold">{data?.pagination.total ?? 0}</p></CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 md:flex-row md:items-center">
        <Input placeholder="Search customer, lead, or notes" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
        <Select value={status} onChange={(event) => { setStatus(event.target.value as FollowupStatus | ""); setPage(1); }}>
          <option value="">All statuses</option>
          {Object.entries(FOLLOWUP_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
        <Select value={priority} onChange={(event) => { setPriority(event.target.value as FollowupPriority | ""); setPage(1); }}>
          <option value="">All priorities</option>
          {Object.entries(FOLLOWUP_PRIORITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
        <Select value={type} onChange={(event) => { setType(event.target.value as FollowupType | ""); setPage(1); }}>
          <option value="">All types</option>
          {Object.entries(FOLLOWUP_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
      </div>

      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}

      {isLoading ? <Loading label="Loading follow-ups..." /> : null}

      <div className="space-y-4">
        {data?.followups.map((followup) => (
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
        {!isLoading && data?.followups.length === 0 ? (
          <p className="text-muted-foreground">No follow-ups found.</p>
        ) : null}
      </div>

      {data && data.pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= data.pagination.totalPages} onClick={() => setPage((current) => current + 1)}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}

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
