import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
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

interface LeadSearchBarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  status: LeadStatus | "";
  onStatusChange: (value: LeadStatus | "") => void;
  priority: LeadPriority | "";
  onPriorityChange: (value: LeadPriority | "") => void;
  assignedUserId: string;
  onAssignedUserIdChange: (value: string) => void;
  leadSource: string;
  onLeadSourceChange: (value: string) => void;
  city: string;
  onCityChange: (value: string) => void;
  options?: LeadFormOptions;
}

export function LeadSearchBar({
  searchInput,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  assignedUserId,
  onAssignedUserIdChange,
  leadSource,
  onLeadSourceChange,
  city,
  onCityChange,
  options,
}: LeadSearchBarProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name, mobile, email, lead number, project, city..."
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <SlidersHorizontal className="h-4 w-4" />
        <span>Advanced filters</span>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Select
          value={status}
          onChange={(event) => onStatusChange(event.target.value as LeadStatus | "")}
        >
          <option value="">All statuses</option>
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
          <option value="">All priorities</option>
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
          <option value="">All assignees</option>
          {options?.assignees.map((assignee) => (
            <option key={assignee.id} value={String(assignee.id)}>
              {assignee.displayName ?? assignee.employeeCode}
            </option>
          ))}
        </Select>

        <Select
          value={leadSource}
          onChange={(event) => onLeadSourceChange(event.target.value)}
        >
          <option value="">All sources</option>
          {options?.leadSources.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </Select>

        <Input
          value={city}
          onChange={(event) => onCityChange(event.target.value)}
          placeholder="Filter by city"
        />
      </div>
    </div>
  );
}
