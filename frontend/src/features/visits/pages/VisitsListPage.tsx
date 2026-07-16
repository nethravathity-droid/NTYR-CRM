import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, MapPinned, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { DeleteVisitDialog } from "@/features/visits/components/DeleteVisitDialog";
import { VisitCard, VisitEmptyState } from "@/features/visits/components/VisitCard";
import {
  useCancelVisit,
  useCompleteVisit,
  useDeleteVisit,
  useVisitFormOptions,
  useVisits,
} from "@/features/visits/hooks/useVisits";
import { VISIT_STATUS_LABELS, type VisitListItem, type VisitStatus } from "@/features/visits/types/visit.types";
import { usePermissions } from "@/hooks/usePermissions";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function VisitsListPage() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("visits.create");
  const canUpdate = hasPermission("visits.update");
  const canDelete = hasPermission("visits.delete");

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<VisitStatus | "">("");
  const [projectId, setProjectId] = useState<number | "">("");
  const [visitToDelete, setVisitToDelete] = useState<VisitListItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: formOptions } = useVisitFormOptions();

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
      projectId: projectId || undefined,
      sortBy: "visit_date" as const,
      sortOrder: "asc" as const,
    }),
    [page, search, status, projectId],
  );

  const { data, isLoading } = useVisits(params);
  const completeVisit = useCompleteVisit();
  const cancelVisit = useCancelVisit();
  const deleteVisit = useDeleteVisit();

  const handleComplete = async (visit: VisitListItem) => {
    setActionError(null);
    try {
      await completeVisit.mutateAsync({ uuid: visit.uuid, payload: {} });
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const handleCancel = async (visit: VisitListItem) => {
    setActionError(null);
    try {
      await cancelVisit.mutateAsync({ uuid: visit.uuid });
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!visitToDelete) return;
    setActionError(null);
    try {
      await deleteVisit.mutateAsync(visitToDelete.uuid);
      setVisitToDelete(null);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={MapPinned}
        tone="emerald"
        title="Site Visits"
        description="Schedule, track, and manage customer site visits."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to={paths.visits.calendar}>Calendar</Link>
            </Button>
            {canCreate ? (
              <Button onClick={() => navigate(paths.visits.create)}>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Visit
              </Button>
            ) : null}
          </div>
        }
      />

      <Card>
        <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <Input placeholder="Search visits..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          <Select value={status} onChange={(e) => { setStatus(e.target.value as VisitStatus | ""); setPage(1); }}>
            <option value="">All statuses</option>
            {Object.entries(VISIT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
          <Select value={projectId} onChange={(e) => { setProjectId(e.target.value ? Number(e.target.value) : ""); setPage(1); }}>
            <option value="">All projects</option>
            {formOptions?.projects.map((project) => (
              <option key={project.id} value={project.id}>{project.projectName}</option>
            ))}
          </Select>
        </CardContent>
      </Card>

      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
      {isLoading ? <Loading label="Loading visits..." /> : null}

      <div className="space-y-4">
        {data?.visits.map((visit) => (
          <VisitCard
            key={visit.uuid}
            visit={visit}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onComplete={handleComplete}
            onCancel={handleCancel}
            onDelete={setVisitToDelete}
          />
        ))}
        {!isLoading && data?.visits.length === 0 ? <VisitEmptyState canCreate={canCreate} /> : null}
      </div>

      {data && data.pagination.totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {data.pagination.page} of {data.pagination.totalPages}</span>
          <Button variant="outline" size="icon" disabled={page >= data.pagination.totalPages} onClick={() => setPage((current) => current + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      <DeleteVisitDialog
        visit={visitToDelete}
        open={Boolean(visitToDelete)}
        isDeleting={deleteVisit.isPending}
        onConfirm={handleDelete}
        onOpenChange={(open) => { if (!open) setVisitToDelete(null); }}
      />
    </div>
  );
}
