import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { LeadTable } from "@/features/leads/components/LeadTable";
import {
  useAssignLeads,
  useLeadFormOptions,
  useLeads,
} from "@/features/leads/hooks/useLeads";
import type { LeadListItem } from "@/features/leads/types/lead.types";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function LeadAssignPage() {
  const [selectedUuids, setSelectedUuids] = useState<string[]>([]);
  const [assignedUserId, setAssignedUserId] = useState("");
  const [leadToDelete] = useState<LeadListItem | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useLeads({
    page: 1,
    limit: 50,
    sortBy: "created_at",
    sortOrder: "desc",
  });
  const { data: options } = useLeadFormOptions();
  const assignLeads = useAssignLeads();

  useEffect(() => {
    setSelectedUuids([]);
  }, [data?.leads.length]);

  const handleAssign = async () => {
    if (!assignedUserId || selectedUuids.length === 0) {
      setError("Select leads and an employee to assign.");
      return;
    }

    setError(null);
    setMessage(null);

    try {
      const result = await assignLeads.mutateAsync({
        leadUuids: selectedUuids,
        assignedUserId: Number(assignedUserId),
      });
      setMessage(
        `Assigned ${result.assigned} lead(s)${result.failed ? `, ${result.failed} failed` : ""}.`,
      );
      setSelectedUuids([]);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  if (isLoading) {
    return <Loading label="Loading leads..." />;
  }

  const leads = data?.leads ?? [];

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" asChild>
        <Link to={paths.leads.list}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Leads
        </Link>
      </Button>

      <CompanyPageHeader
        icon={UserCheck}
        tone="amber"
        title="Assign Leads"
        description="Select leads and assign them to an employee in bulk."
      />

      <Card>
        <CardHeader>
          <CardTitle>Assignment</CardTitle>
          <CardDescription>
            {selectedUuids.length} lead(s) selected for assignment.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] space-y-2">
            <label className="text-sm font-medium">Assigned Employee</label>
            <Select
              value={assignedUserId}
              onChange={(event) => setAssignedUserId(event.target.value)}
            >
              <option value="">Select employee</option>
              {options?.assignees.map((assignee) => (
                <option key={assignee.id} value={String(assignee.id)}>
                  {assignee.displayName ?? assignee.employeeCode}
                </option>
              ))}
            </Select>
          </div>

          <Button disabled={assignLeads.isPending} onClick={handleAssign}>
            {assignLeads.isPending ? "Assigning..." : "Assign Selected Leads"}
          </Button>
        </CardContent>
      </Card>

      {message ? (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <LeadTable
        leads={leads}
        selectedUuids={selectedUuids}
        onToggleSelect={(uuid) =>
          setSelectedUuids((current) =>
            current.includes(uuid)
              ? current.filter((item) => item !== uuid)
              : [...current, uuid],
          )
        }
        onToggleSelectAll={(checked) =>
          setSelectedUuids(checked ? leads.map((lead) => lead.uuid) : [])
        }
        onDelete={() => undefined}
      />

      {leadToDelete ? null : null}
    </div>
  );
}
