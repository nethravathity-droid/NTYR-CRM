import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { useVisits } from "@/features/visits/hooks/useVisits";
import { VISIT_STATUS_LABELS } from "@/features/visits/types/visit.types";
import { paths } from "@/routes/paths";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getMonthBounds(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { fromDate: toDateKey(start), toDate: toDateKey(end) };
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
    days.push({ date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), inCurrentMonth: true });
  }

  while (days.length % 7 !== 0) {
    const date = new Date(lastDay);
    date.setDate(lastDay.getDate() + (days.length - (startOffset + lastDay.getDate()) + 1));
    days.push({ date, inCurrentMonth: false });
  }

  return days;
}

export function VisitCalendarPage() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));

  const monthBounds = useMemo(() => getMonthBounds(currentMonth), [currentMonth]);
  const { data, isLoading } = useVisits({
    page: 1,
    limit: 100,
    fromDate: monthBounds.fromDate,
    toDate: monthBounds.toDate,
    sortBy: "visit_date",
    sortOrder: "asc",
  });

  const visitsByDate = useMemo(() => {
    const grouped = new Map<string, NonNullable<typeof data>["visits"]>();
    for (const visit of data?.visits ?? []) {
      const items = grouped.get(visit.visitDate) ?? [];
      items.push(visit);
      grouped.set(visit.visitDate, items);
    }
    return grouped;
  }, [data?.visits]);

  const selectedVisits = visitsByDate.get(selectedDate) ?? [];
  const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);
  const monthLabel = currentMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={CalendarDays}
        tone="cyan"
        title="Visit Calendar"
        description="Browse scheduled site visits by date."
        action={
          <Button variant="outline" asChild>
            <Link to={paths.visits.list}>List View</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{monthLabel}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-2 grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground">
            {WEEKDAY_LABELS.map((label) => <div key={label}>{label}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map(({ date, inCurrentMonth }) => {
              const dateKey = toDateKey(date);
              const count = visitsByDate.get(dateKey)?.length ?? 0;
              const isSelected = selectedDate === dateKey;
              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => setSelectedDate(dateKey)}
                  className={`min-h-20 rounded-lg border p-2 text-left text-sm transition-colors ${isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"} ${inCurrentMonth ? "" : "opacity-40"}`}
                >
                  <div className="font-medium">{date.getDate()}</div>
                  {count > 0 ? <div className="mt-1 text-xs text-primary">{count} visit{count === 1 ? "" : "s"}</div> : null}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Visits on {selectedDate}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <Loading label="Loading visits..." /> : null}
          {!isLoading && selectedVisits.length === 0 ? (
            <p className="text-sm text-muted-foreground">No visits scheduled for this date.</p>
          ) : null}
          {selectedVisits.map((visit) => (
            <button
              key={visit.uuid}
              type="button"
              className="flex w-full items-center justify-between rounded-lg border p-4 text-left hover:bg-muted/50"
              onClick={() => navigate(paths.visits.details(visit.uuid))}
            >
              <div>
                <p className="font-medium">{visit.customerName}</p>
                <p className="text-sm text-muted-foreground">{visit.visitTime.slice(0, 5)} — {visit.project?.projectName ?? "No project"}</p>
              </div>
              <span className="text-sm text-muted-foreground">{VISIT_STATUS_LABELS[visit.status]}</span>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
