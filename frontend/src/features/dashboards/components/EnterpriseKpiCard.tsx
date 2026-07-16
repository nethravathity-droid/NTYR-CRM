import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface EnterpriseKpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: "primary" | "secondary" | "success" | "warning" | "danger" | "purple";
  loading?: boolean;
}

const accentStyles = {
  primary: "bg-[#2563EB]/10 text-[#2563EB]",
  secondary: "bg-[#14B8A6]/10 text-[#14B8A6]",
  success: "bg-[#10B981]/10 text-[#10B981]",
  warning: "bg-[#F59E0B]/10 text-[#F59E0B]",
  danger: "bg-[#EF4444]/10 text-[#EF4444]",
  purple: "bg-[#8B5CF6]/10 text-[#8B5CF6]",
};

export function EnterpriseKpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "primary",
  loading,
}: EnterpriseKpiCardProps) {
  return (
    <div className="app-panel group p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="h-9 w-24" />
          ) : (
            <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          )}
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <div className={cn("rounded-[14px] p-3 transition-transform group-hover:scale-105", accentStyles[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function KpiGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="app-panel p-5">
          <Skeleton className="mb-3 h-4 w-24" />
          <Skeleton className="h-9 w-20" />
        </div>
      ))}
    </div>
  );
}
