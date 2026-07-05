import {
  Building2,
  CircleCheck,
  CirclePause,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { IconBox } from "@/features/companies/components/IconBox";
import type { CompanyListItem } from "@/features/companies/types/company.types";

interface CompanyStatsRowProps {
  companies: CompanyListItem[];
  total: number;
}

export function CompanyStatsRow({ companies, total }: CompanyStatsRowProps) {
  const activeCount = companies.filter((company) => company.isActive).length;
  const trialCount = companies.filter((company) => company.status === "TRIAL").length;
  const suspendedCount = companies.filter(
    (company) => company.status === "SUSPENDED" || !company.isActive,
  ).length;

  const stats = [
    {
      label: "Total Companies",
      value: total,
      icon: Building2,
      tone: "indigo" as const,
    },
    {
      label: "Active",
      value: activeCount,
      icon: CircleCheck,
      tone: "emerald" as const,
    },
    {
      label: "On Trial",
      value: trialCount,
      icon: Sparkles,
      tone: "amber" as const,
    },
    {
      label: "Inactive",
      value: suspendedCount,
      icon: CirclePause,
      tone: "rose" as const,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="overflow-hidden border-0 bg-card shadow-sm ring-1 ring-border/60"
        >
          <CardContent className="flex items-center gap-4 p-5">
            <IconBox icon={stat.icon} tone={stat.tone} />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
