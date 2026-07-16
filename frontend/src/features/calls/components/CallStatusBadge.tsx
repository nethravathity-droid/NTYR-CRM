import { Badge } from "@/components/ui/badge";
import { CALL_STATUS_LABELS, type CallStatus } from "@/features/calls/types/call.types";
import { cn } from "@/lib/utils";

const toneMap: Record<CallStatus, string> = {
  ANSWERED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  BUSY: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  NO_ANSWER: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
  SWITCHED_OFF: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
  WRONG_NUMBER: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
};

export function CallStatusBadge({ status }: { status: CallStatus }) {
  return <Badge className={cn("font-normal", toneMap[status])}>{CALL_STATUS_LABELS[status]}</Badge>;
}
