import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type { DashboardSummary } from "@/features/dashboard/types/dashboard.types";

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const response = await apiClient.get<ApiResponse<DashboardSummary>>(
      "/dashboard/summary",
    );
    return response.data.data;
  },
};
