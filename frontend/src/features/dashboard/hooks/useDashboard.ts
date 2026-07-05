import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: () => [...dashboardKeys.all, "summary"] as const,
};

export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: () => dashboardService.getSummary(),
  });
}
