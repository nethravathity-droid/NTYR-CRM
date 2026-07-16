import { useMemo } from "react";
import { useCallSummary } from "@/features/calls/hooks/useCalls";
import { useRecentActivities } from "@/features/dashboard/hooks/useDashboard";
import { useFollowups, useOverdueFollowups, useTodayFollowups } from "@/features/followups/hooks/useFollowups";
import { useLeads } from "@/features/leads/hooks/useLeads";
import type { LeadStatus } from "@/features/leads/types/lead.types";
import { useBookings } from "@/features/bookings/hooks/useBookings";
import { usePayments } from "@/features/payments/hooks/usePayments";
import { useCollectionSummary } from "@/features/payments/hooks/usePayments";
import { useInventoryDashboard } from "@/features/properties/hooks/useProperties";
import {
  useDashboardReport,
  useEmployeeReport,
  usePaymentReport,
} from "@/features/reports/hooks/useReports";
import { useVisits } from "@/features/visits/hooks/useVisits";
import { usePermissions } from "@/hooks/usePermissions";
import type { BreakdownItem } from "@/features/reports/types/report.types";
import { getTodayRange, type DashboardDateRange } from "@/lib/dashboard/date-range";

function getWeekStart(reference = new Date()) {
  const d = new Date(reference);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().slice(0, 10);
}

export function funnelValue(funnel: BreakdownItem[] | undefined, ...statuses: string[]) {
  if (!funnel) return 0;
  const set = new Set(statuses.map((s) => s.toUpperCase()));
  return funnel
    .filter((item) => set.has(item.label.toUpperCase()))
    .reduce((sum, item) => sum + item.value, 0);
}

export function useAdminDashboard(dateRange: DashboardDateRange = getTodayRange()) {
  const { hasPermission } = usePermissions();
  const canReports = hasPermission("reports.view");
  const canCalls = hasPermission("calls.view");
  const canLeads = hasPermission("leads.view");
  const canProjects = hasPermission("projects.view");
  const canUpdateLeads = hasPermission("leads.update");

  const { fromDate, toDate } = dateRange;
  const today = getTodayRange().fromDate;
  const isTodayOnly = fromDate === toDate && fromDate === today;
  const reportPeriod = fromDate === toDate ? "daily" : "custom";

  const { data: rangeReport, isLoading: rangeReportLoading } = useDashboardReport(
    { period: reportPeriod, fromDate, toDate, page: 1, limit: 5 },
    { enabled: canReports },
  );
  const { data: monthlyReport, isLoading: monthlyLoading } = useDashboardReport(
    { period: "monthly", fromDate: getWeekStart(), toDate: today, page: 1, limit: 5 },
    { enabled: canReports && isTodayOnly },
  );
  const { data: employeeReport } = useEmployeeReport(
    { period: reportPeriod, fromDate, toDate, page: 1, limit: 10 },
    { enabled: canReports },
  );
  const { data: paymentReport } = usePaymentReport(
    { period: reportPeriod, fromDate, toDate, page: 1, limit: 5 },
    { enabled: canReports },
  );

  const { data: callSummary, isLoading: callsLoading } = useCallSummary(
    { fromDate, toDate },
    { enabled: canCalls },
  );
  const { data: todayFollowups = [], isLoading: followupsLoading } = useTodayFollowups({
    enabled: canLeads && isTodayOnly,
  });
  const { data: rangeFollowups, isLoading: rangeFollowupsLoading } = useFollowups({
    page: 1,
    limit: 50,
    fromDate,
    toDate,
    sortBy: "followup_date",
    sortOrder: "asc",
  });
  const { data: overdueFollowups = [] } = useOverdueFollowups({ enabled: canLeads });
  const { data: payments, isLoading: paymentsLoading } = useCollectionSummary();
  const { data: activities = [], isLoading: activitiesLoading } = useRecentActivities(30);
  const { data: inventory, isLoading: inventoryLoading } = useInventoryDashboard();

  const { data: pipelineLeads, isLoading: pipelineLoading } = useLeads({
    page: 1,
    limit: 100,
    sortBy: "updated_at",
    sortOrder: "desc",
  });
  const { data: recentLeads, isLoading: recentLeadsLoading } = useLeads({
    page: 1,
    limit: 8,
    sortBy: "created_at",
    sortOrder: "desc",
  });
  const { data: upcomingVisits, isLoading: visitsLoading } = useVisits({
    page: 1,
    limit: 8,
    fromDate,
    toDate,
    sortBy: "visit_date",
    sortOrder: "asc",
  });
  const { data: recentBookings, isLoading: bookingsLoading } = useBookings({
    page: 1,
    limit: 8,
    fromDate,
    toDate,
    sortBy: "booking_date",
    sortOrder: "desc",
  });
  const { data: pendingBookings } = useBookings({
    page: 1,
    limit: 5,
    status: "PENDING_APPROVAL",
    sortBy: "booking_date",
    sortOrder: "desc",
  });
  const { data: overduePaymentsList } = usePayments({
    page: 1,
    limit: 8,
    status: "PENDING",
    sortBy: "due_date",
    sortOrder: "asc",
  });

  const followupsForRange = isTodayOnly ? todayFollowups : (rangeFollowups?.followups ?? []);

  const filteredActivities = useMemo(
    () =>
      activities.filter((activity) => {
        const occurred = activity.occurredAt.slice(0, 10);
        return occurred >= fromDate && occurred <= toDate;
      }),
    [activities, fromDate, toDate],
  );

  const dailyReport = rangeReport;
  const kpis = useMemo(() => {
    const daily = dailyReport?.kpis;
    const monthly = monthlyReport?.kpis;
    const funnel = dailyReport?.leadStatusFunnel ?? monthlyReport?.leadStatusFunnel;
    const totalLeads = daily?.totalLeads ?? 0;
    const converted = daily?.convertedLeads ?? monthly?.convertedLeads ?? 0;
    const totalForConversion = daily?.totalLeads ?? monthly?.totalLeads ?? 0;
    const conversionRate = totalForConversion > 0 ? Math.round((converted / totalForConversion) * 100) : 0;

    return {
      todaysLeads: totalLeads,
      newLeads: funnelValue(funnel, "NEW"),
      assignedLeads: funnelValue(funnel, "ASSIGNED"),
      todaysCalls: callSummary?.totalCalls ?? 0,
      todaysFollowups: followupsForRange.length,
      upcomingVisits: upcomingVisits?.pagination.total ?? 0,
      bookings: daily?.bookings ?? monthly?.bookings ?? 0,
      collections: daily?.collection ?? paymentReport?.summary.totalCollected ?? payments?.totalCollected ?? 0,
      revenue: daily?.revenue ?? paymentReport?.summary.totalCollected ?? monthly?.revenue ?? 0,
      outstanding: payments?.totalOutstanding ?? daily?.outstanding ?? 0,
      conversionRate,
      siteVisits: daily?.siteVisits ?? monthly?.siteVisits ?? 0,
      availableUnits: inventory?.availableUnits ?? 0,
      soldUnits: inventory?.soldUnits ?? 0,
      pendingPayments: payments?.pendingCount ?? 0,
      followupsDue: daily?.followupsDue ?? monthly?.followupsDue ?? 0,
      lostLeads: daily?.lostLeads ?? monthly?.lostLeads ?? 0,
      activeLeads: daily?.activeLeads ?? monthly?.activeLeads ?? 0,
      weeklyCollection: paymentReport?.summary.totalCollected ?? daily?.collection ?? 0,
      monthlyCollection: paymentReport?.summary.totalCollected ?? monthly?.collection ?? 0,
      todaysCollection: daily?.collection ?? 0,
      overdueAmount: payments?.totalOverdue ?? 0,
      overdueCount: payments?.overdueCount ?? 0,
      paidCount: payments?.paidCount ?? 0,
    };
  }, [
    callSummary?.totalCalls,
    dailyReport,
    followupsForRange.length,
    inventory,
    monthlyReport,
    paymentReport,
    payments,
    upcomingVisits?.pagination.total,
  ]);

  const topEmployees = employeeReport?.performance.slice(0, 5) ?? [];
  const bestPerformer = topEmployees[0] ?? null;

  const isLoading =
    (canReports && (rangeReportLoading || monthlyLoading)) ||
    (canCalls && callsLoading) ||
    (canLeads && (followupsLoading || rangeFollowupsLoading)) ||
    paymentsLoading ||
    (canProjects && inventoryLoading);

  return {
    hasPermission,
    canReports,
    canUpdateLeads,
    isLoading,
    dateRange,
    kpis,
    dailyReport,
    monthlyReport: dailyReport ?? monthlyReport,
    paymentReport,
    employeeReport,
    topEmployees,
    bestPerformer,
    callSummary,
    todayFollowups: followupsForRange,
    overdueFollowups,
    payments,
    activities: filteredActivities,
    inventory,
    pipelineLeads: pipelineLeads?.leads ?? [],
    recentLeads: recentLeads?.leads ?? [],
    upcomingVisits: upcomingVisits?.visits ?? [],
    recentBookings: recentBookings?.bookings ?? [],
    pendingBookings: pendingBookings?.bookings ?? [],
    overduePayments: overduePaymentsList?.payments ?? [],
    loading: {
      pipeline: pipelineLoading,
      recentLeads: recentLeadsLoading,
      visits: visitsLoading,
      bookings: bookingsLoading,
      activities: activitiesLoading,
    },
  };
}

export type PipelineColumn = {
  id: string;
  label: string;
  targetStatus: LeadStatus;
  statuses: LeadStatus[];
  color: string;
};

export const PIPELINE_COLUMNS: PipelineColumn[] = [
  { id: "new", label: "New", targetStatus: "NEW", statuses: ["NEW", "ASSIGNED"], color: "#2563EB" },
  { id: "contacted", label: "Contacted", targetStatus: "CONTACTED", statuses: ["CONTACTED"], color: "#14B8A6" },
  { id: "interested", label: "Interested", targetStatus: "FOLLOW_UP", statuses: ["FOLLOW_UP"], color: "#8B5CF6" },
  { id: "visit", label: "Visit Scheduled", targetStatus: "VISIT_SCHEDULED", statuses: ["VISIT_SCHEDULED", "VISITED"], color: "#F59E0B" },
  { id: "negotiation", label: "Negotiation", targetStatus: "NEGOTIATION", statuses: ["NEGOTIATION"], color: "#6366F1" },
  { id: "booked", label: "Booked", targetStatus: "BOOKED", statuses: ["BOOKED"], color: "#10B981" },
  { id: "lost", label: "Lost", targetStatus: "LOST", statuses: ["LOST"], color: "#EF4444" },
];
