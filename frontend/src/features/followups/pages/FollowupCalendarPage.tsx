import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { useFollowups } from "@/features/followups/hooks/useFollowups";
import { FOLLOWUP_TYPE_LABELS } from "@/features/followups/types/followup.types";
import { paths } from "@/routes/paths";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getMonthBounds(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    fromDate: toDateKey(start),
    toDate: toDateKey(end),
  };
}

function buildCalendarDays(currentMonth: Date) {
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startOffset = firstDay.getDay();
  const days: Array<{ date: Date; inCurrentMonth: boolean }> = [];

  for (let index = 0; index < startOffset; index += 1) {
    const date = new Date(firstDay);
    date.setDate(date.getDate() - (startOffset - index));
    days.push({ date, inCurrentMonth: false });
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push({
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day),
      inCurrentMonth: true,
    });
  }

  while (days.length % 7 !== 0) {
    const date = new Date(lastDay);
    date.setDate(lastDay.getDate() + (days.length - (startOffset + lastDay.getDate()) + 1));
    days.push({ date, inCurrentMonth: false });
  }

  return days;
}

export function FollowupCalendarPage() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));

  const monthBounds = useMemo(() => getMonthBounds(currentMonth), [currentMonth]);
  const { data, isLoading } = useFollowups({
    page: 1,
    limit: 100,
    fromDate: monthBounds.fromDate,
    toDate: monthBounds.toDate,
    sortBy: "followup_date",
    sortOrder: "asc",
  });

  const followupsByDate = useMemo(() => {
    const grouped = new Map<string, NonNullable<typeof data>["followups"]>();

    for (const followup of data?.followups ?? []) {
      const items = grouped.get(followup.followupDate) ?? [];
      items.push(followup);
      grouped.set(followup.followupDate, items);
    }

    return grouped;
  }, [data?.followups]);

  const selectedFollowups = followupsByDate.get(selectedDate) ?? [];
  const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);
  const monthLabel = currentMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={CalendarDays}
        tone="violet"
        title="Calendar View"
        description="Browse follow-ups by date and open details from the schedule."
        action={
          <Button variant="outline" asChild>
            <Link to={paths.followups.list}>List View</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{monthLabel}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth((value) => new Date(value.getFullYear(), value.getMonth() - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                setCurrentMonth(today);
                setSelectedDate(toDateKey(today));
              }}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth((value) => new Date(value.getFullYear(), value.getMonth() + 1, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <Loading label="Loading calendar..." /> : null}
          <div className="grid grid-cols-7 gap-2">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="px-2 py-1 text-center text-xs font-medium text-muted-foreground">
                {label}
              </div>
            ))}
            {calendarDays.map(({ date, inCurrentMonth }) => {
              const dateKey = toDateKey(date);
              const count = followupsByDate.get(dateKey)?.length ?? 0;
              const isSelected = selectedDate === dateKey;
              const isToday = dateKey === toDateKey(new Date());

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => setSelectedDate(dateKey)}
                  className={`min-h-24 rounded-lg border p-2 text-left transition-colors ${
                    isSelected ? "border-primary bg-primary/5" : "border-border"
                  } ${inCurrentMonth ? "" : "opacity-40"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>{date.getDate()}</span>
                    {count > 0 ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{count}</span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedFollowups.length === 0 ? (
            <p className="text-muted-foreground">No follow-ups on this date.</p>
          ) : (
            selectedFollowups.map((followup) => (
              <button
                key={followup.uuid}
                type="button"
                onClick={() => navigate(paths.followups.timeline(followup.uuid))}
                className="flex w-full items-start justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted/40"
              >
                <div>
                  <p className="font-medium">{followup.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {followup.followupTime} • {FOLLOWUP_TYPE_LABELS[followup.type]} • {followup.status}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{followup.lead?.leadNumber ?? "Unlinked"}</span>
              </button>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
