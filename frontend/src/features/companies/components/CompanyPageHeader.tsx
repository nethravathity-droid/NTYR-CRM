import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { IconBox, type IconBoxTone } from "@/features/companies/components/IconBox";

interface CompanyPageHeaderProps {
  icon: LucideIcon;
  tone?: IconBoxTone;
  title: string;
  description: string;
  action?: ReactNode;
}

export function CompanyPageHeader({
  icon,
  tone = "indigo",
  title,
  description,
  action,
}: CompanyPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-gradient-to-r from-indigo-500/10 via-violet-500/5 to-cyan-500/10 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <IconBox icon={icon} tone={tone} size="lg" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-muted-foreground">{description}</p>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
