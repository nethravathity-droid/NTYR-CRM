import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/shared/Loading";
import {
  buildCalendarDays,
  formatLocalDateKey,
  getLocalTodayKey,
} from "@/lib/date/local-date";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface MonthCalendarGridProps {
  currentMonth: Date;
  selectedDateKey: string;
  onMonthChange: (month: Date) => void;
  onSelectDate: (dateKey: string, date: Date) => void;
  getCountForDate: (dateKey: string) => number;
  isLoading?: boolean;
  countLabel?: (count: number) => string;
}

export function MonthCalendarGrid({
  currentMonth,
  selectedDateKey,
  onMonthChange,
  onSelectDate,
  getCountForDate,
  isLoading = false,
  countLabel = (count) => String(count),
}: MonthCalendarGridProps) {
  const calendarDays = buildCalendarDays(currentMonth);
  const monthLabel = currentMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const todayKey = getLocalTodayKey();

  const goToMonth = (offset: number) => {
    onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const goToToday = () => {
    const today = new Date();
    onMonthChange(new Date(today.getFullYear(), today.getMonth(), 1));
    onSelectDate(todayKey, today);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">{monthLabel}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => goToMonth(-1)} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => goToMonth(1)} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative">
        {isLoading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/70 backdrop-blur-[1px]">
            <Loading label="Loading calendar..." />
          </div>
        ) : null}

        <div className="grid grid-cols-7 gap-2">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="px-2 py-1 text-center text-xs font-medium text-muted-foreground">
              {label}
            </div>
          ))}
          {calendarDays.map((day, index) => {
            const count = getCountForDate(day.dateKey);
            const isSelected = selectedDateKey === day.dateKey;
            const isToday = day.dateKey === todayKey;

            return (
              <button
                key={`${day.dateKey}-${index}`}
                type="button"
                onClick={() => {
                  if (!day.inCurrentMonth) {
                    onMonthChange(new Date(day.date.getFullYear(), day.date.getMonth(), 1));
                  }
                  onSelectDate(day.dateKey, day.date);
                }}
                className={cn(
                  "min-h-24 rounded-lg border bg-white p-2 text-left shadow-sm transition-colors hover:border-primary/40 dark:bg-card",
                  isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-[#E2E8F0] dark:border-border",
                  !day.inCurrentMonth && "opacity-45",
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={cn("text-sm font-semibold", isToday && "text-primary")}>{day.date.getDate()}</span>
                  {count > 0 ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {countLabel(count)}
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function useCalendarMonthState(initialDate = new Date()) {
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  );
  const [selectedDateKey, setSelectedDateKey] = useState(() => formatLocalDateKey(initialDate));

  return { currentMonth, setCurrentMonth, selectedDateKey, setSelectedDateKey };
}
