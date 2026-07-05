import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { companyStatusOptions } from "@/features/companies/components/CompanyStatusBadge";
import type { CompanyStatus } from "@/features/companies/types/company.types";

interface CompanySearchBarProps {
  search: string;
  status: CompanyStatus | "";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: CompanyStatus | "") => void;
  onClear: () => void;
}

export function CompanySearchBar({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onClear,
}: CompanySearchBarProps) {
  const hasFilters = Boolean(search || status);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name, code, owner, email, phone, city..."
          className="pl-9"
        />
      </div>

      <Select
        value={status}
        onChange={(event) =>
          onStatusChange(event.target.value as CompanyStatus | "")
        }
        className="md:w-48"
      >
        <option value="">All statuses</option>
        {companyStatusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      {hasFilters ? (
        <Button type="button" variant="outline" onClick={onClear}>
          <X className="h-4 w-4" />
          Clear
        </Button>
      ) : null}
    </div>
  );
}
