import { Flame, Snowflake, Sun, Target, UserSquare2, Users } from "lucide-react";
import { IconBox } from "@/features/companies/components/IconBox";
import type { LeadListItem } from "@/features/leads/types/lead.types";

interface LeadStatsRowProps {
  leads: LeadListItem[];
  total: number;
}

export function LeadStatsRow({ leads, total }: LeadStatsRowProps) {
  const hotCount = leads.filter((lead) => lead.priority === "HOT").length;
  const assignedCount = leads.filter((lead) => lead.assignedEmployee).length;
  const newCount = leads.filter((lead) => lead.status === "NEW").length;
  const warmCount = leads.filter((lead) => lead.priority === "WARM").length;

  const stats = [
    {
      label: "Total Leads",
      value: total,
      icon: UserSquare2,
      tone: "indigo" as const,
    },
    {
      label: "New",
      value: newCount,
      icon: Target,
      tone: "sky" as const,
    },
    {
      label: "Assigned",
      value: assignedCount,
      icon: Users,
      tone: "violet" as const,
    },
    {
      label: "Hot",
      value: hotCount,
      icon: Flame,
      tone: "rose" as const,
    },
    {
      label: "Warm",
      value: warmCount,
      icon: Sun,
      tone: "amber" as const,
    },
    {
      label: "Cold",
      value: leads.filter((lead) => lead.priority === "COLD").length,
      icon: Snowflake,
      tone: "blue" as const,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm"
        >
          <IconBox icon={stat.icon} tone={stat.tone} />
          <div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
