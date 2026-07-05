import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type {
  LeadFormOptions,
  LeadPriority,
  LeadStatus,
} from "@/features/leads/types/lead.types";
import {
  LEAD_PRIORITY_LABELS,
  LEAD_STATUS_LABELS,
} from "@/features/leads/types/lead.types";

interface BulkActionsBarProps {
  selectedCount: number;
  options?: LeadFormOptions;
  status: LeadStatus | "";
  priority: LeadPriority | "";
  assignedUserId: string;
  onStatusChange: (value: LeadStatus | "") => void;
  onPriorityChange: (value: LeadPriority | "") => void;
  onAssignedUserIdChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
  isApplying?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  options,
  status,
  priority,
  assignedUserId,
  onStatusChange,
  onPriorityChange,
  onAssignedUserIdChange,
  onApply,
  onClear,
  isApplying = false,
}: BulkActionsBarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50/80 p-4 dark:border-indigo-900 dark:bg-indigo-950/40">
      <p className="text-sm font-medium">
        {selectedCount} lead{selectedCount === 1 ? "" : "s"} selected
      </p>

      <Select
        value={status}
        onChange={(event) => onStatusChange(event.target.value as LeadStatus | "")}
      >
        <option value="">Change status</option>
        {options?.statuses.map((item) => (
          <option key={item} value={item}>
            {LEAD_STATUS_LABELS[item]}
          </option>
        ))}
      </Select>

      <Select
        value={priority}
        onChange={(event) =>
          onPriorityChange(event.target.value as LeadPriority | "")
        }
      >
        <option value="">Change priority</option>
        {options?.priorities.map((item) => (
          <option key={item} value={item}>
            {LEAD_PRIORITY_LABELS[item]}
          </option>
        ))}
      </Select>

      <Select
        value={assignedUserId}
        onChange={(event) => onAssignedUserIdChange(event.target.value)}
      >
        <option value="">Assign employee</option>
        {options?.assignees.map((assignee) => (
          <option key={assignee.id} value={String(assignee.id)}>
            {assignee.displayName ?? assignee.employeeCode}
          </option>
        ))}
      </Select>

      <Button disabled={isApplying} onClick={onApply}>
        {isApplying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Applying...
          </>
        ) : (
          "Apply Bulk Update"
        )}
      </Button>

      <Button variant="outline" onClick={onClear}>
        Clear Selection
      </Button>
    </div>
  );
}
