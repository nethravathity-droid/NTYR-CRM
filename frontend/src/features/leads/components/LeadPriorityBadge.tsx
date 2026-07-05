import { Badge } from "@/components/ui/badge";
import {
  LEAD_PRIORITY_LABELS,
  type LeadPriority,
} from "@/features/leads/types/lead.types";
import { cn } from "@/lib/utils";

const priorityStyles: Record<LeadPriority, string> = {
  HOT: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  WARM: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  COLD: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
};

export function LeadPriorityBadge({ priority }: { priority: LeadPriority }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-0 font-medium", priorityStyles[priority])}
    >
      {LEAD_PRIORITY_LABELS[priority]}
    </Badge>
  );
}
