import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface CompanyActiveSwitchProps {
  checked: boolean;
  disabled?: boolean;
  isUpdating?: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function CompanyActiveSwitch({
  checked,
  disabled = false,
  isUpdating = false,
  onCheckedChange,
  className,
}: CompanyActiveSwitchProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div>
        <Label htmlFor="company-active-toggle" className="text-sm font-medium">
          Company Access
        </Label>
        <p className="text-xs text-muted-foreground">
          {checked ? "Active — tenant can operate" : "Deactivated — access suspended"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {isUpdating ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : null}
        <Switch
          id="company-active-toggle"
          checked={checked}
          disabled={disabled || isUpdating}
          onCheckedChange={onCheckedChange}
        />
      </div>
    </div>
  );
}
