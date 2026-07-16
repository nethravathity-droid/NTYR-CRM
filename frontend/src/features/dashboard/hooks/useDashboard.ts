import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import type { DashboardChartMetric, DashboardChartRange } from "@/features/dashboard/types/dashboard.types";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: () => [...dashboardKeys.all, "summary"] as const,
  activities: (limit: number) => [...dashboardKeys.all, "activities", limit] as const,
  chart: (metric: DashboardChartMetric, range: DashboardChartRange) =>
    [...dashboardKeys.all, "chart", metric, range] as const,
};

export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: () => dashboardService.getSummary(),
  });
}

export function useRecentActivities(limit = 10) {
  return useQuery({
    queryKey: dashboardKeys.activities(limit),
    queryFn: () => dashboardService.getRecentActivities(limit),
  });
}

export function useDashboardChart(metric: DashboardChartMetric, range: DashboardChartRange = "30d") {
  return useQuery({
    queryKey: dashboardKeys.chart(metric, range),
    queryFn: () => dashboardService.getChart(metric, range),
  });
}
