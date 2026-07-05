import { Loader2 } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { companyStatusOptions } from "@/features/companies/components/CompanyStatusBadge";
import type { CompanyStatus } from "@/features/companies/types/company.types";

interface CompanyStatusSelectProps {
  value: CompanyStatus;
  disabled?: boolean;
  isUpdating?: boolean;
  onChange: (status: CompanyStatus) => void;
}

export function CompanyStatusSelect({
  value,
  disabled = false,
  isUpdating = false,
  onChange,
}: CompanyStatusSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="company-status">Company Status</Label>
      <div className="relative">
        <Select
          id="company-status"
          value={value}
          disabled={disabled || isUpdating}
          onChange={(event) => onChange(event.target.value as CompanyStatus)}
          className="pr-10"
        >
          {companyStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        {isUpdating ? (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>
    </div>
  );
}
