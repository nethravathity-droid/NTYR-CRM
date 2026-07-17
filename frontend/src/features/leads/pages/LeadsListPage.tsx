import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Upload,
  UserCheck,
  UserSquare2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { BulkActionsBar } from "@/features/leads/components/BulkActionsBar";
import { DeleteLeadDialog } from "@/features/leads/components/DeleteLeadDialog";
import { LeadSearchBar } from "@/features/leads/components/LeadSearchBar";
import { LeadStatsRow } from "@/features/leads/components/LeadStatsRow";
import { LeadTable } from "@/features/leads/components/LeadTable";
import {
  useBulkUpdateLeads,
  useDeleteLead,
  useLeadFormOptions,
  useLeads,
} from "@/features/leads/hooks/useLeads";
import type {
  LeadListItem,
  LeadPriority,
  LeadStatus,
} from "@/features/leads/types/lead.types";
import { usePermissions } from "@/hooks/usePermissions";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function LeadsListPage() {
  const { hasPermission } = usePermissions();
  const [searchParams] = useSearchParams();
  const canCreate = hasPermission("leads.create");
  const canUpdate = hasPermission("leads.update");

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LeadStatus | "">("");
  const [priority, setPriority] = useState<LeadPriority | "">("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [leadSource, setLeadSource] = useState("");
  const [city, setCity] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedUuids, setSelectedUuids] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<LeadStatus | "">("");
  const [bulkPriority, setBulkPriority] = useState<LeadPriority | "">("");
  const [bulkAssigneeId, setBulkAssigneeId] = useState("");
  const [leadToDelete, setLeadToDelete] = useState<LeadListItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const nextStatus = searchParams.get("status");
    const nextLeadSource = searchParams.get("leadSource");
    const nextSearch = searchParams.get("search");
    const nextFromDate = searchParams.get("fromDate");
    const nextToDate = searchParams.get("toDate");
    const isCustomers = searchParams.get("tab") === "customers";

    if (nextStatus) {
      setStatus(nextStatus as LeadStatus);
    } else if (isCustomers) {
      setStatus("BOOKED");
    } else {
      setStatus("");
    }
    if (nextLeadSource) setLeadSource(nextLeadSource);
    else setLeadSource("");
    if (nextSearch) {
      setSearchInput(nextSearch);
      setSearch(nextSearch);
    } else {
      setSearchInput("");
      setSearch("");
    }
    if (nextFromDate) setFromDate(nextFromDate);
    else setFromDate("");
    if (nextToDate) setToDate(nextToDate);
    else setToDate("");
    setPage(1);
  }, [searchParams]);

  const isCustomersView = searchParams.get("tab") === "customers";

  const effectiveStatus = useMemo((): LeadStatus | undefined => {
    if (status) return status;
    if (isCustomersView) return "BOOKED";
    return undefined;
  }, [isCustomersView, status]);

  const listParams = useMemo(
    () => ({
      page,
      limit: 10,
      search: search || undefined,
      status: effectiveStatus,
      priority: priority || undefined,
      assignedUserId: assignedUserId ? Number(assignedUserId) : undefined,
      leadSource: leadSource || undefined,
      city: city || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      sortBy: "created_at" as const,
      sortOrder: "desc" as const,
    }),
    [
      assignedUserId,
      city,
      effectiveStatus,
      fromDate,
      leadSource,
      page,
      priority,
      search,
      toDate,
    ],
  );

  const { data, isLoading, isFetching, error } = useLeads(listParams);
  const { data: statsData } = useLeads({
    page: 1,
    limit: 100,
    sortBy: "created_at",
    sortOrder: "desc",
  });
  const { data: filterOptions } = useLeadFormOptions();

  const deleteLead = useDeleteLead();
  const bulkUpdate = useBulkUpdateLeads();

  const handleToggleSelect = (uuid: string) => {
    setSelectedUuids((current) =>
      current.includes(uuid)
        ? current.filter((item) => item !== uuid)
        : [...current, uuid],
    );
  };

  const handleToggleSelectAll = (checked: boolean) => {
    setSelectedUuids(checked ? (data?.leads.map((lead) => lead.uuid) ?? []) : []);
  };

  const handleBulkApply = async () => {
    if (selectedUuids.length === 0) return;

    if (!bulkStatus && !bulkPriority && !bulkAssigneeId) {
      setActionError("Select at least one bulk update field.");
      return;
    }

    setActionError(null);

    try {
      await bulkUpdate.mutateAsync({
        leadUuids: selectedUuids,
        status: bulkStatus || undefined,
        priority: bulkPriority || undefined,
        assignedUserId: bulkAssigneeId ? Number(bulkAssigneeId) : undefined,
      });
      setSelectedUuids([]);
      setBulkStatus("");
      setBulkPriority("");
      setBulkAssigneeId("");
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!leadToDelete) return;
    setActionError(null);

    try {
      await deleteLead.mutateAsync(leadToDelete.uuid);
      setLeadToDelete(null);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  if (isLoading) {
    return <Loading label="Loading leads..." />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {getApiErrorMessage(error)}
      </div>
    );
  }

  const leads = data?.leads ?? [];
  const pagination = data?.pagination;

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={UserSquare2}
        tone="indigo"
        title={isCustomersView ? "Customers" : "Lead Management"}
        description={
          isCustomersView
            ? "View and manage converted customer records from your pipeline."
            : "Capture, assign, and track sales leads across your organization."
        }
        action={
          <div className="flex flex-wrap gap-2">
            {canCreate ? (
              <>
                <Button variant="outline" asChild>
                  <Link to={paths.leads.import}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                  </Link>
                </Button>
                <Button asChild>
                  <Link to={paths.leads.create}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Lead
                  </Link>
                </Button>
              </>
            ) : null}
            {canUpdate ? (
              <Button variant="outline" asChild>
                <Link to={paths.leads.assign}>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Assign Leads
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <LeadStatsRow
        leads={statsData?.leads ?? []}
        total={pagination?.total ?? 0}
      />

      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>
            Filter leads by status, priority, assignee, source, and city.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LeadSearchBar
            searchInput={searchInput}
            onSearchChange={setSearchInput}
            status={status}
            onStatusChange={(value) => {
              setStatus(value);
              resetPage();
            }}
            priority={priority}
            onPriorityChange={(value) => {
              setPriority(value);
              resetPage();
            }}
            assignedUserId={assignedUserId}
            onAssignedUserIdChange={(value) => {
              setAssignedUserId(value);
              resetPage();
            }}
            leadSource={leadSource}
            onLeadSourceChange={(value) => {
              setLeadSource(value);
              resetPage();
            }}
            city={city}
            onCityChange={(value) => {
              setCity(value);
              resetPage();
            }}
            options={filterOptions}
          />
        </CardContent>
      </Card>

      {actionError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {actionError}
        </div>
      ) : null}

      {canUpdate ? (
        <BulkActionsBar
          selectedCount={selectedUuids.length}
          options={filterOptions}
          status={bulkStatus}
          priority={bulkPriority}
          assignedUserId={bulkAssigneeId}
          onStatusChange={setBulkStatus}
          onPriorityChange={setBulkPriority}
          onAssignedUserIdChange={setBulkAssigneeId}
          onApply={handleBulkApply}
          onClear={() => setSelectedUuids([])}
          isApplying={bulkUpdate.isPending}
        />
      ) : null}

      <div className={isFetching ? "opacity-70 transition-opacity" : ""}>
        <LeadTable
          leads={leads}
          selectedUuids={selectedUuids}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onDelete={setLeadToDelete}
        />
      </div>

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total}{" "}
            leads
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}

      <DeleteLeadDialog
        lead={leadToDelete}
        open={Boolean(leadToDelete)}
        isDeleting={deleteLead.isPending}
        onOpenChange={(open) => {
          if (!open) setLeadToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
