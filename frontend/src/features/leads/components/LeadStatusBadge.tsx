import { Badge } from "@/components/ui/badge";
import {
  LEAD_STATUS_LABELS,
  type LeadStatus,
} from "@/features/leads/types/lead.types";
import { cn } from "@/lib/utils";

const statusStyles: Record<LeadStatus, string> = {
  NEW: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  ASSIGNED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  CONTACTED: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  FOLLOW_UP: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  VISIT_SCHEDULED: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  VISITED: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
  NEGOTIATION: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
  BOOKED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  LOST: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant="outline" className={cn("border-0 font-medium", statusStyles[status])}>
      {LEAD_STATUS_LABELS[status]}
    </Badge>
  );
}
