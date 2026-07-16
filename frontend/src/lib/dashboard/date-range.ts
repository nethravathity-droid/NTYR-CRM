export interface DashboardDateRange {
  fromDate: string;
  toDate: string;
}

export type DashboardDatePreset = "today" | "week" | "month" | "custom";

export function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getTodayRange(): DashboardDateRange {
  const today = formatDateInput(new Date());
  return { fromDate: today, toDate: today };
}

export function getWeekRange(): DashboardDateRange {
  const end = new Date();
  const start = new Date();
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  return { fromDate: formatDateInput(start), toDate: formatDateInput(end) };
}

export function getMonthRange(): DashboardDateRange {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth(), 1);
  return { fromDate: formatDateInput(start), toDate: formatDateInput(end) };
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
    return new Date(`${range.fromDate}T00:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const from = new Date(`${range.fromDate}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const to = new Date(`${range.toDate}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${from} – ${to}`;
}
