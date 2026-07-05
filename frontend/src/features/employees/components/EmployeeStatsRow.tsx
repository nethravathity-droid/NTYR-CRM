import {
  CircleCheck,
  CirclePause,
  Shield,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { IconBox } from "@/features/companies/components/IconBox";
import type { EmployeeListItem } from "@/features/employees/types/employee.types";

interface EmployeeStatsRowProps {
  employees: EmployeeListItem[];
  total: number;
}

export function EmployeeStatsRow({ employees, total }: EmployeeStatsRowProps) {
  const activeCount = employees.filter((e) => e.status === "ACTIVE").length;
  const inactiveCount = employees.filter((e) => e.status === "INACTIVE").length;
  const lockedCount = employees.filter((e) => e.status === "LOCKED").length;

  const stats = [
    { label: "Total Employees", value: total, icon: Users, tone: "indigo" as const },
    { label: "Active", value: activeCount, icon: CircleCheck, tone: "emerald" as const },
    { label: "Inactive", value: inactiveCount, icon: CirclePause, tone: "amber" as const },
    { label: "Locked", value: lockedCount, icon: Shield, tone: "rose" as const },
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
