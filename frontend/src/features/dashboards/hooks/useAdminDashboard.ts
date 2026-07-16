import { useMemo } from "react";
import { useCallSummary } from "@/features/calls/hooks/useCalls";
import { useRecentActivities } from "@/features/dashboard/hooks/useDashboard";
import { useOverdueFollowups, useTodayFollowups } from "@/features/followups/hooks/useFollowups";
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

const today = new Date().toISOString().slice(0, 10);

function getWeekStart() {
  const d = new Date();
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

export function useAdminDashboard() {
  const { hasPermission } = usePermissions();
  const canReports = hasPermission("reports.view");
  const canCalls = hasPermission("calls.view");
  const canLeads = hasPermission("leads.view");
  const canProjects = hasPermission("projects.view");
  const canUpdateLeads = hasPermission("leads.update");

  const { data: dailyReport, isLoading: dailyLoading } = useDashboardReport(
    { period: "daily", fromDate: today, toDate: today, page: 1, limit: 5 },
    { enabled: canReports },
  );
  const { data: monthlyReport, isLoading: monthlyLoading } = useDashboardReport(
    { period: "monthly", page: 1, limit: 5 },
    { enabled: canReports },
  );
  const { data: weeklyReport } = useDashboardReport(
    { period: "weekly", fromDate: getWeekStart(), toDate: today, page: 1, limit: 5 },
    { enabled: canReports },
  );
  const { data: employeeReport } = useEmployeeReport(
    { period: "monthly", page: 1, limit: 10 },
    { enabled: canReports },
  );
  const { data: paymentReport } = usePaymentReport(
    { period: "monthly", page: 1, limit: 5 },
    { enabled: canReports },
  );

  const { data: callSummary, isLoading: callsLoading } = useCallSummary(
    { fromDate: today, toDate: today },
    { enabled: canCalls },
  );
  const { data: todayFollowups = [], isLoading: followupsLoading } = useTodayFollowups({ enabled: canLeads });
  const { data: overdueFollowups = [] } = useOverdueFollowups({ enabled: canLeads });
  const { data: payments, isLoading: paymentsLoading } = useCollectionSummary();
  const { data: activities = [], isLoading: activitiesLoading } = useRecentActivities(15);
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
    fromDate: today,
    sortBy: "visit_date",
    sortOrder: "asc",
  });
  const { data: recentBookings, isLoading: bookingsLoading } = useBookings({
    page: 1,
    limit: 8,
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
  const { data: overduePaymentsList } = usePayments(
    { page: 1, limit: 8, status: "PENDING", sortBy: "due_date", sortOrder: "asc" },
  );

  const kpis = useMemo(() => {
    const daily = dailyReport?.kpis;
    const monthly = monthlyReport?.kpis;
    const funnel = monthlyReport?.leadStatusFunnel ?? dailyReport?.leadStatusFunnel;
    const totalLeads = daily?.totalLeads ?? 0;
    const converted = monthly?.convertedLeads ?? daily?.convertedLeads ?? 0;
    const totalForConversion = monthly?.totalLeads ?? daily?.totalLeads ?? 0;
    const conversionRate = totalForConversion > 0 ? Math.round((converted / totalForConversion) * 100) : 0;

    return {
      todaysLeads: totalLeads,
      newLeads: funnelValue(funnel, "NEW"),
      assignedLeads: funnelValue(funnel, "ASSIGNED"),
      todaysCalls: callSummary?.totalCalls ?? 0,
      todaysFollowups: todayFollowups.length,
      upcomingVisits: upcomingVisits?.pagination.total ?? 0,
      bookings: daily?.bookings ?? monthly?.bookings ?? 0,
      collections: daily?.collection ?? payments?.totalCollected ?? 0,
      revenue: daily?.revenue ?? monthly?.revenue ?? 0,
      outstanding: payments?.totalOutstanding ?? daily?.outstanding ?? 0,
      conversionRate,
      siteVisits: daily?.siteVisits ?? monthly?.siteVisits ?? 0,
      availableUnits: inventory?.availableUnits ?? 0,
      soldUnits: inventory?.soldUnits ?? 0,
      pendingPayments: payments?.pendingCount ?? 0,
      followupsDue: monthly?.followupsDue ?? daily?.followupsDue ?? 0,
      lostLeads: monthly?.lostLeads ?? daily?.lostLeads ?? 0,
      activeLeads: monthly?.activeLeads ?? daily?.activeLeads ?? 0,
      weeklyCollection: weeklyReport?.kpis.collection ?? 0,
      monthlyCollection: monthly?.collection ?? 0,
      todaysCollection: daily?.collection ?? 0,
      overdueAmount: payments?.totalOverdue ?? 0,
      overdueCount: payments?.overdueCount ?? 0,
      paidCount: payments?.paidCount ?? 0,
    };
  }, [
    callSummary?.totalCalls,
    dailyReport,
    inventory,
    monthlyReport,
    payments,
    todayFollowups.length,
    upcomingVisits?.pagination.total,
    weeklyReport,
  ]);

  const topEmployees = employeeReport?.performance.slice(0, 5) ?? [];
  const bestPerformer = topEmployees[0] ?? null;

  const isLoading =
    (canReports && (dailyLoading || monthlyLoading)) ||
    (canCalls && callsLoading) ||
    (canLeads && followupsLoading) ||
    paymentsLoading ||
    (canProjects && inventoryLoading);

  return {
    hasPermission,
    canReports,
    canUpdateLeads,
    isLoading,
    kpis,
    dailyReport,
    monthlyReport,
    paymentReport,
    employeeReport,
    topEmployees,
    bestPerformer,
    callSummary,
    todayFollowups,
    overdueFollowups,
    payments,
    activities,
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
