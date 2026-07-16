import { apiClient } from "@/lib/api/client";

import type { ApiResponse } from "@/lib/api/types";

import type {

  DashboardChart,

  DashboardChartMetric,

  DashboardChartRange,

  DashboardRecentActivity,

  DashboardSummary,

} from "@/features/dashboard/types/dashboard.types";



export const dashboardService = {

  async getSummary(): Promise<DashboardSummary> {

    const response = await apiClient.get<ApiResponse<DashboardSummary>>("/dashboard/summary");

    return response.data.data;

  },



  async getRecentActivities(limit = 10): Promise<DashboardRecentActivity[]> {

    const response = await apiClient.get<ApiResponse<{ activities: DashboardRecentActivity[] }>>(

      "/dashboard/recent-activities",

      { params: { limit } },

    );

    return response.data.data.activities;

  },



  async getChart(metric: DashboardChartMetric, range: DashboardChartRange = "30d"): Promise<DashboardChart> {

    const response = await apiClient.get<ApiResponse<{ chart: DashboardChart }>>("/dashboard/chart", {

      params: { metric, range },

    });

    return response.data.data.chart;

  },

};


