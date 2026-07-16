import type { DashboardActivityType } from "@/features/dashboard/types/dashboard.types";
import type { LeadStatus } from "@/features/leads/types/lead.types";
import type { DashboardDateRange } from "@/lib/dashboard/date-range";
import { paths } from "@/routes/paths";

function withDateQuery(base: string, range: DashboardDateRange, fromKey = "fromDate", toKey = "toDate"): string {
  const params = new URLSearchParams();
  params.set(fromKey, range.fromDate);
  params.set(toKey, range.toDate);
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}${params.toString()}`;
}

function leadListUrl(status?: LeadStatus, range?: DashboardDateRange): string {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (range) {
    params.set("fromDate", range.fromDate);
    params.set("toDate", range.toDate);
  }
  const query = params.toString();
  return query ? `${paths.leads.list}?${query}` : paths.leads.list;
}

const FUNNEL_STATUS_MAP: Record<string, LeadStatus> = {
  new: "NEW",
  assigned: "ASSIGNED",
  contacted: "CONTACTED",
  "follow up": "FOLLOW_UP",
  "follow-up": "FOLLOW_UP",
  "visit scheduled": "VISIT_SCHEDULED",
  visited: "VISITED",
  negotiation: "NEGOTIATION",
  booked: "BOOKED",
  lost: "LOST",
};

export function funnelLabelToStatus(label: string): LeadStatus | null {
  return FUNNEL_STATUS_MAP[label.trim().toLowerCase()] ?? null;
}

export function getKpiNavigationTarget(label: string, range: DashboardDateRange): string {
  switch (label) {
    case "Today's Leads":
      return leadListUrl(undefined, range);
    case "New Leads":
      return leadListUrl("NEW", range);
    case "Assigned Leads":
      return leadListUrl("ASSIGNED", range);
    case "Today's Calls":
      return withDateQuery(paths.calls.list, range);
    case "Today's Follow-ups":
      return range.fromDate === range.toDate
        ? paths.followups.today
        : withDateQuery(paths.followups.list, range);
    case "Upcoming Visits":
      return withDateQuery(paths.visits.list, range);
    case "Bookings":
      return withDateQuery(paths.bookings.list, range);
    case "Collections":
      return withDateQuery(paths.payments.list, range, "fromPaymentDate", "toPaymentDate");
    case "Revenue":
      return withDateQuery(paths.reports.payments, range);
    case "Outstanding":
      return `${paths.payments.list}?status=PENDING`;
    case "Lead Conversion":
      return paths.reports.leads;
    case "Site Visits":
      return withDateQuery(paths.reports.visits, range);
    case "Available Units":
      return paths.projects.inventory;
    case "Sold Units":
      return paths.projects.inventory;
    case "Pending Payments":
      return `${paths.payments.list}?status=PENDING`;
    default:
      return paths.reports.dashboard;
  }
}

export function getChartSegmentTarget(
  chartTitle: string,
  segmentLabel: string,
  range: DashboardDateRange,
): string {
  const normalized = segmentLabel.trim().toLowerCase();

  if (chartTitle === "Lead Sources") {
    const params = new URLSearchParams({ leadSource: segmentLabel });
    params.set("fromDate", range.fromDate);
    params.set("toDate", range.toDate);
    return `${paths.leads.list}?${params.toString()}`;
  }

  if (chartTitle === "Lead Status Funnel") {
    const status = funnelLabelToStatus(segmentLabel);
    return status ? leadListUrl(status, range) : paths.reports.leads;
  }

  if (chartTitle.includes("Revenue") || chartTitle.includes("Payment") || chartTitle.includes("Collection")) {
    return withDateQuery(paths.reports.payments, range);
  }

  if (chartTitle.includes("Booking") || chartTitle.includes("Sales")) {
    return withDateQuery(paths.reports.bookings, range);
  }

  if (chartTitle.includes("Employee")) {
    return withDateQuery(paths.reports.employees, range);
  }

  if (normalized.includes("lead")) return leadListUrl(undefined, range);
  if (normalized.includes("visit")) return withDateQuery(paths.reports.visits, range);
  if (normalized.includes("booking")) return withDateQuery(paths.reports.bookings, range);

  return paths.reports.dashboard;
}

export function getActivityNavigationTarget(
  type: DashboardActivityType,
  referenceId: string | null,
): string | null {
  if (!referenceId) return null;

  switch (type) {
    case "USER_CREATED":
    case "USER_LOGIN":
      return paths.employees.details(referenceId);
    case "COMPANY_CREATED":
    case "COMPANY_UPDATED":
      return paths.companies.details(referenceId);
    case "LEAD_CREATED":
      return paths.leads.details(referenceId);
    case "BOOKING_CREATED":
      return paths.bookings.details(referenceId);
    case "FOLLOWUP_DUE":
      return paths.followups.timeline(referenceId);
    default:
      return null;
  }
}
