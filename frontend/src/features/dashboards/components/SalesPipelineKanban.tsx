import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GripVertical } from "lucide-react";
import { useBulkUpdateLeads } from "@/features/leads/hooks/useLeads";
import type { LeadListItem } from "@/features/leads/types/lead.types";
import { formatCurrency } from "@/features/payments/types/payment.types";
import { GlassCard, SectionHeader } from "@/components/premium/PremiumCards";
import { Skeleton } from "@/components/ui/skeleton";
import { paths } from "@/routes/paths";
import { cn } from "@/lib/utils";
import { PIPELINE_COLUMNS, type PipelineColumn } from "@/features/dashboards/hooks/useAdminDashboard";

interface SalesPipelineKanbanProps {
  leads: LeadListItem[];
  loading?: boolean;
  canUpdate?: boolean;
}

function columnValue(leads: LeadListItem[]) {
  return leads.reduce((sum, lead) => sum + (lead.budget ?? 0), 0);
}

export function SalesPipelineKanban({ leads, loading, canUpdate }: SalesPipelineKanbanProps) {
  const bulkUpdate = useBulkUpdateLeads();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, LeadListItem[]>();
    PIPELINE_COLUMNS.forEach((col) => map.set(col.id, []));
    leads.forEach((lead) => {
      const column = PIPELINE_COLUMNS.find((col) => col.statuses.includes(lead.status));
      if (column) map.get(column.id)?.push(lead);
    });
    return map;
  }, [leads]);

  const handleDrop = async (column: PipelineColumn) => {
    if (!draggingId || !canUpdate) return;
    const lead = leads.find((l) => l.uuid === draggingId);
    if (!lead || lead.status === column.targetStatus) {
      setDraggingId(null);
      setOverColumn(null);
      return;
    }
    try {
      await bulkUpdate.mutateAsync({ leadUuids: [draggingId], status: column.targetStatus });
    } finally {
      setDraggingId(null);
      setOverColumn(null);
    }
  };

  if (loading) {
    return (
      <GlassCard className="p-5">
        <SectionHeader title="Sales Pipeline" description="Loading pipeline..." />
        <div className="flex gap-4 overflow-x-auto pb-2">
          {PIPELINE_COLUMNS.map((col) => (
            <Skeleton key={col.id} className="h-64 w-64 shrink-0" />
          ))}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5">
      <SectionHeader
        title="Sales Pipeline"
        description="Drag leads between stages to update status"
        action={<Link to={paths.leads.list} className="text-sm font-medium text-[#2563EB] hover:underline">View all leads</Link>}
      />
      <div className="flex gap-4 overflow-x-auto pb-2">
        {PIPELINE_COLUMNS.map((column) => {
          const columnLeads = grouped.get(column.id) ?? [];
          const totalValue = columnValue(columnLeads);
          return (
            <div
              key={column.id}
              className={cn(
                "flex w-64 shrink-0 flex-col rounded-[18px] border bg-[#F8FAFC]/80 dark:bg-muted/20",
                overColumn === column.id && "ring-2 ring-[#2563EB]/40",
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setOverColumn(column.id);
              }}
              onDragLeave={() => setOverColumn(null)}
              onDrop={() => void handleDrop(column)}
            >
              <div className="border-b p-4" style={{ borderTopColor: column.color, borderTopWidth: 3 }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{column.label}</h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium shadow-sm dark:bg-card">
                    {columnLeads.length}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{formatCurrency(totalValue)} pipeline value</p>
              </div>
              <div className="flex max-h-80 flex-col gap-2 overflow-y-auto p-3">
                {columnLeads.slice(0, 12).map((lead) => (
                  <div
                    key={lead.uuid}
                    draggable={canUpdate}
                    onDragStart={() => setDraggingId(lead.uuid)}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setOverColumn(null);
                    }}
                    className={cn(
                      "rounded-[14px] border bg-white p-3 shadow-sm transition dark:bg-card",
                      canUpdate && "cursor-grab active:cursor-grabbing",
                      draggingId === lead.uuid && "opacity-50",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {canUpdate ? <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /> : null}
                      <div className="min-w-0 flex-1">
                        <Link to={paths.leads.details(lead.uuid)} className="block truncate font-medium hover:text-[#2563EB]">
                          {lead.customerName}
                        </Link>
                        <p className="text-xs text-muted-foreground">{lead.leadNumber}</p>
                        {lead.budget ? (
                          <p className="mt-1 text-xs font-medium text-[#10B981]">{formatCurrency(lead.budget)}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
                {columnLeads.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">No leads</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
