import {
  formatLocalDateLabel,
  formatLocalDateKey,
  getLocalTodayKey,
  normalizeDateRange,
} from "@/lib/date/local-date";

export interface DashboardDateRange {
  fromDate: string;
  toDate: string;
}

export type DashboardDatePreset = "today" | "week" | "month" | "custom";

export function formatDateInput(date: Date): string {
  return formatLocalDateKey(date);
}

export function getTodayRange(): DashboardDateRange {
  const today = getLocalTodayKey();
  return { fromDate: today, toDate: today };
}

export function getWeekRange(): DashboardDateRange {
  const end = new Date();
  const start = new Date();
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  return normalizeDateRange(formatDateInput(start), formatDateInput(end));
}

export function getMonthRange(): DashboardDateRange {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth(), 1);
  return normalizeDateRange(formatDateInput(start), formatDateInput(end));
}

export function getRangeForPreset(preset: DashboardDatePreset): DashboardDateRange {
  switch (preset) {
    case "today":
      return getTodayRange();
    case "week":
      return getWeekRange();
    case "month":
      return getMonthRange();
    default:
      return getTodayRange();
  }
}

export function formatDateRangeLabel(range: DashboardDateRange): string {
  if (range.fromDate === range.toDate) {
    return formatLocalDateLabel(range.fromDate, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const from = formatLocalDateLabel(range.fromDate, { month: "short", day: "numeric" });
  const to = formatLocalDateLabel(range.toDate, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${from} – ${to}`;
}

export { normalizeDateRange };
