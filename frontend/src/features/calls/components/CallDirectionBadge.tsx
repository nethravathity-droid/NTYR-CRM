import { Badge } from "@/components/ui/badge";
import { CALL_DIRECTION_LABELS, type CallDirection } from "@/features/calls/types/call.types";
import { cn } from "@/lib/utils";

const toneMap: Record<CallDirection, string> = {
  INCOMING: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  OUTGOING: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  MISSED: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
};

export function CallDirectionBadge({ direction }: { direction: CallDirection }) {
  return <Badge className={cn("font-normal", toneMap[direction])}>{CALL_DIRECTION_LABELS[direction]}</Badge>;
}
