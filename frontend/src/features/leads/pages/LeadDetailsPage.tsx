import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  History,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
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
import { IconBox } from "@/features/companies/components/IconBox";
import { DeleteLeadDialog } from "@/features/leads/components/DeleteLeadDialog";
import { LeadPriorityBadge } from "@/features/leads/components/LeadPriorityBadge";
import { LeadStatusBadge } from "@/features/leads/components/LeadStatusBadge";
import {
  useDeleteLead,
  useLead,
  useLeadAuditTrail,
} from "@/features/leads/hooks/useLeads";
import { usePermissions } from "@/hooks/usePermissions";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

function formatBudget(budget: number | null): string {
  if (budget == null) return "Not specified";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(budget);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function LeadDetailsPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("leads.update");
  const canDelete = hasPermission("leads.delete");

  const { data: lead, isLoading, error } = useLead(uuid);
  const { data: auditTrail } = useLeadAuditTrail(uuid);
  const deleteLead = useDeleteLead();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!uuid) return;
    setActionError(null);

    try {
      await deleteLead.mutateAsync(uuid);
      navigate(paths.leads.list);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  if (isLoading) {
    return <Loading label="Loading lead details..." />;
  }

  if (error || !lead) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {getApiErrorMessage(error ?? new Error("Lead not found"))}
      </div>
    );
  }

  const detailItems = [
    { label: "Lead Number", value: lead.leadNumber },
    { label: "Project Interested", value: lead.projectInterested ?? "—" },
    { label: "Budget", value: formatBudget(lead.budget) },
    { label: "Property Type", value: lead.propertyType ?? "—" },
    { label: "Lead Source", value: lead.leadSource ?? "—" },
    { label: "Campaign", value: lead.campaign ?? "—" },
    { label: "City", value: lead.city ?? "—" },
    {
      label: "Assigned Employee",
      value:
        lead.assignedEmployee?.displayName ??
        lead.assignedEmployee?.employeeCode ??
        "Unassigned",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link to={paths.leads.list}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Leads
          </Link>
        </Button>
      </div>

      <CompanyPageHeader
        icon={UserSquare2}
        tone="indigo"
        title={lead.customerName}
        description={`Lead ${lead.leadNumber} · Created ${formatDate(lead.createdAt)}`}
        action={
          <div className="flex flex-wrap gap-2">
            {canUpdate ? (
              <Button asChild>
                <Link to={paths.leads.edit(lead.uuid)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
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

      {actionError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {actionError}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lead Overview</CardTitle>
            <CardDescription>Contact details and interest information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <LeadPriorityBadge priority={lead.priority} />
              <LeadStatusBadge status={lead.status} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border p-4">
                <IconBox icon={Phone} tone="emerald" size="sm" />
                <div>
                  <p className="text-sm text-muted-foreground">Mobile</p>
                  <p className="font-medium">{lead.mobile}</p>
                  {lead.alternateMobile ? (
                    <p className="text-sm text-muted-foreground">
                      Alt: {lead.alternateMobile}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border p-4">
                <IconBox icon={Mail} tone="cyan" size="sm" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{lead.email ?? "—"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border p-4 sm:col-span-2">
                <IconBox icon={MapPin} tone="violet" size="sm" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{lead.city ?? "—"}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {detailItems.map((item) => (
                <div key={item.label}>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
              ))}
            </div>

            {lead.notes ? (
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="mt-1 whitespace-pre-wrap rounded-xl border bg-muted/20 p-4">
                  {lead.notes}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <IconBox icon={History} tone="amber" size="sm" />
              <div>
                <CardTitle>Audit Trail</CardTitle>
                <CardDescription>History of changes for this lead.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!auditTrail?.length ? (
              <p className="text-sm text-muted-foreground">No audit entries yet.</p>
            ) : (
              <div className="space-y-4">
                {auditTrail.map((entry) => (
                  <div key={entry.uuid} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{entry.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.createdAt)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {entry.performedBy?.displayName ?? "System"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DeleteLeadDialog
        lead={lead}
        open={showDeleteDialog}
        isDeleting={deleteLead.isPending}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
      />
    </div>
  );
}
