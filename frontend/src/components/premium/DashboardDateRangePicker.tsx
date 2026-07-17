import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useDashboardDate } from "@/context/DashboardDateContext";
import type { DashboardDateRange } from "@/lib/dashboard/date-range";
import { cn } from "@/lib/utils";

export function DashboardDateRangePicker({ variant = "default" }: { variant?: "default" | "hero" }) {
  const { label, preset, setPreset, setCustomRange, range } = useDashboardDate();

  const applyCustom = (field: keyof DashboardDateRange, value: string) => {
    if (!value) return;
    setCustomRange({ ...range, [field]: value });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant === "hero" ? "secondary" : "outline"}
          className={cn(
            "rounded-[14px]",
            variant === "hero" && "border-white/20 bg-white/15 text-white hover:bg-white/25 hover:text-white",
          )}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          <span className="hidden lg:inline">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 rounded-[18px]">
        <DropdownMenuLabel>Dashboard Date Range</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setPreset("today")} className={preset === "today" ? "bg-muted" : ""}>
          Today
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setPreset("week")} className={preset === "week" ? "bg-muted" : ""}>
          This Week
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setPreset("month")} className={preset === "month" ? "bg-muted" : ""}>
          This Month
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div
          className="space-y-2 px-2 py-1"
          onPointerDown={(event) => event.preventDefault()}
          onClick={(event) => event.stopPropagation()}
        >
          <p className="text-xs font-medium text-muted-foreground">Custom range</p>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor="dashboard-from-date">
              From
            </label>
            <Input
              id="dashboard-from-date"
              type="date"
              value={range.fromDate}
              onChange={(event) => applyCustom("fromDate", event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground" htmlFor="dashboard-to-date">
              To
            </label>
            <Input
              id="dashboard-to-date"
              type="date"
              value={range.toDate}
              onChange={(event) => applyCustom("toDate", event.target.value)}
            />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
