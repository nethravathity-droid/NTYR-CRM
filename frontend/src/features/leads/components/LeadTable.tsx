import { Eye, Pencil, Trash2, UserSquare2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LeadPriorityBadge } from "@/features/leads/components/LeadPriorityBadge";
import { LeadStatusBadge } from "@/features/leads/components/LeadStatusBadge";
import { IconBox } from "@/features/companies/components/IconBox";
import type { LeadListItem } from "@/features/leads/types/lead.types";
import { paths } from "@/routes/paths";
import { usePermissions } from "@/hooks/usePermissions";

interface LeadTableProps {
  leads: LeadListItem[];
  selectedUuids: string[];
  onToggleSelect: (uuid: string) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onDelete: (lead: LeadListItem) => void;
}

function formatBudget(budget: number | null): string {
  if (budget == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(budget);
}

export function LeadTable({
  leads,
  selectedUuids,
  onToggleSelect,
  onToggleSelectAll,
  onDelete,
}: LeadTableProps) {
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("leads.update");
  const canDelete = hasPermission("leads.delete");
  const allSelected = leads.length > 0 && selectedUuids.length === leads.length;

  if (!leads.length) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 p-12 text-center">
        <IconBox icon={UserSquare2} tone="indigo" size="lg" className="mx-auto mb-4" />
        <p className="text-lg font-semibold">No leads found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting filters or add a new lead.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(event) => onToggleSelectAll(event.target.checked)}
                aria-label="Select all leads"
              />
            </TableHead>
            <TableHead>Lead</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Project / Budget</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.uuid} className="group">
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedUuids.includes(lead.uuid)}
                  onChange={() => onToggleSelect(lead.uuid)}
                  aria-label={`Select ${lead.customerName}`}
                />
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-semibold">{lead.customerName}</p>
                  <p className="text-xs text-muted-foreground">{lead.leadNumber}</p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p>{lead.mobile}</p>
                  {lead.email ? (
                    <p className="text-xs text-muted-foreground">{lead.email}</p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p>{lead.projectInterested ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBudget(lead.budget)}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p>{lead.leadSource ?? "—"}</p>
                  {lead.city ? (
                    <p className="text-xs text-muted-foreground">{lead.city}</p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                {lead.assignedEmployee?.displayName ??
                  lead.assignedEmployee?.employeeCode ??
                  "Unassigned"}
              </TableCell>
              <TableCell>
                <LeadPriorityBadge priority={lead.priority} />
              </TableCell>
              <TableCell>
                <LeadStatusBadge status={lead.status} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1 opacity-80 transition-opacity group-hover:opacity-100">
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={paths.leads.details(lead.uuid)}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  {canUpdate ? (
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={paths.leads.edit(lead.uuid)}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : null}
                  {canDelete ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(lead)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
