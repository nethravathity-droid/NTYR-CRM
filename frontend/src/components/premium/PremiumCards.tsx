import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  className?: string;
  children: ReactNode;
  hover?: boolean;
}

export function GlassCard({ className, children, hover = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        "app-panel transition-all duration-300",
        hover && "hover:-translate-y-0.5 hover:shadow-lg",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "blue" | "emerald" | "violet" | "amber" | "rose" | "cyan" | "indigo";
  loading?: boolean;
}

const toneMap = {
  blue: "from-blue-500/15 to-blue-500/5 text-blue-600 dark:text-blue-400",
  emerald: "from-emerald-500/15 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
  violet: "from-violet-500/15 to-violet-500/5 text-violet-600 dark:text-violet-400",
  amber: "from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-400",
  rose: "from-rose-500/15 to-rose-500/5 text-rose-600 dark:text-rose-400",
  cyan: "from-cyan-500/15 to-cyan-500/5 text-cyan-600 dark:text-cyan-400",
  indigo: "from-indigo-500/15 to-indigo-500/5 text-indigo-600 dark:text-indigo-400",
};

export function KpiCard({ label, value, hint, icon: Icon, tone = "indigo", loading }: KpiCardProps) {
  return (
    <GlassCard hover className="overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold tracking-tight">
              {loading ? "—" : value}
            </p>
            {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
          </div>
          <div className={cn("rounded-xl bg-gradient-to-br p-3", toneMap[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
