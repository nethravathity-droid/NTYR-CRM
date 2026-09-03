import { BarChart3, TrendingUp, Users } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const METRICS = [
  { label: "Revenue", value: "—", icon: TrendingUp },
  { label: "New Leads", value: "—", icon: Users },
  { label: "Qualified Leads", value: "—", icon: BarChart3 },
  { label: "Conversion Rate", value: "—", icon: TrendingUp },
  { label: "Open Deals", value: "—", icon: BarChart3 },
  { label: "Won Deals", value: "—", icon: TrendingUp },
];

export function AnalyticsSection() {
  const ref = useScrollReveal();

  return (
    <section className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div ref={ref} className="text-center opacity-0 translate-y-6 transition-all duration-700">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Analytics that help you grow.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Revenue, conversion, pipeline, and team performance at a glance.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {METRICS.map((metric) => (
            <div key={metric.label} className="rounded-2xl border bg-background p-6 shadow-sm">
              <metric.icon className="h-6 w-6 text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-2xl font-bold">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
