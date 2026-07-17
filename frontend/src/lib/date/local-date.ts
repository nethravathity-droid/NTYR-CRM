/** Format a Date as YYYY-MM-DD in local timezone (avoids UTC shift from toISOString). */
export function formatLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getLocalTodayKey(): string {
  return formatLocalDateKey(new Date());
}

export function getMonthBounds(date: Date): { fromDate: string; toDate: string } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    fromDate: formatLocalDateKey(start),
    toDate: formatLocalDateKey(end),
  };
}

export type CalendarDayCell = {
  date: Date;
  dateKey: string;
  inCurrentMonth: boolean;
};

export function buildCalendarDays(currentMonth: Date): CalendarDayCell[] {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const gridStart = new Date(year, month, 1 - new Date(year, month, 1).getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return {
      date,
      dateKey: formatLocalDateKey(date),
      inCurrentMonth: date.getMonth() === month,
    };
  });
}

export function formatLocalDateLabel(dateKey: string, options?: Intl.DateTimeFormatOptions): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, options);
}

export function normalizeDateRange(fromDate: string, toDate: string): { fromDate: string; toDate: string } {
  if (fromDate <= toDate) {
    return { fromDate, toDate };
  }
  return { fromDate: toDate, toDate: fromDate };
}
