import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IconBoxTone } from "@/features/companies/components/IconBox";
import { IconBox } from "@/features/companies/components/IconBox";

const toneRing: Record<IconBoxTone, string> = {
  blue: "ring-blue-500/20 group-hover:shadow-blue-500/10",
  emerald: "ring-emerald-500/20 group-hover:shadow-emerald-500/10",
  violet: "ring-violet-500/20 group-hover:shadow-violet-500/10",
  amber: "ring-amber-500/20 group-hover:shadow-amber-500/10",
  rose: "ring-rose-500/20 group-hover:shadow-rose-500/10",
  cyan: "ring-cyan-500/20 group-hover:shadow-cyan-500/10",
  indigo: "ring-indigo-500/20 group-hover:shadow-indigo-500/10",
};

interface LandingIconCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  tone?: IconBoxTone;
  className?: string;
  centered?: boolean;
}

export function LandingIconCard({
  icon,
  title,
  description,
  tone = "indigo",
  className,
  centered = false,
}: LandingIconCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm ring-1 ring-border/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg",
        toneRing[tone],
        centered && "text-center",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100",
        )}
      />
      <div className={cn("relative", centered && "mx-auto w-fit")}>
        <IconBox icon={icon} tone={tone} size="lg" className="rounded-2xl shadow-sm" />
      </div>
      <h3 className={cn("relative mt-5 text-lg font-semibold tracking-tight", centered && "mt-4")}>
        {title}
      </h3>
      {description ? (
        <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

interface LandingPillProps {
  icon: LucideIcon;
  label: string;
  tone?: IconBoxTone;
}

export function LandingPill({ icon: Icon, label }: LandingPillProps) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-border/30 backdrop-blur-sm transition-colors hover:border-primary/30 hover:bg-muted/40"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/60">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </span>
      {label}
    </span>
  );
}
