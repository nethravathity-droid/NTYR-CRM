import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthCalendarGrid, useCalendarMonthState } from "@/components/calendar/MonthCalendarGrid";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { useVisitsCalendar } from "@/features/visits/hooks/useVisits";
import { VISIT_STATUS_LABELS } from "@/features/visits/types/visit.types";
import { getApiErrorMessage } from "@/lib/api/client";
import { formatLocalDateLabel, getMonthBounds } from "@/lib/date/local-date";
import { paths } from "@/routes/paths";

export function VisitCalendarPage() {
  const navigate = useNavigate();
  const { currentMonth, setCurrentMonth, selectedDateKey, setSelectedDateKey } = useCalendarMonthState();

  const monthBounds = useMemo(() => getMonthBounds(currentMonth), [currentMonth]);
  const { data: visits = [], isLoading, isError, error } = useVisitsCalendar(
    monthBounds.fromDate,
    monthBounds.toDate,
  );

  const visitsByDate = useMemo(() => {
    const grouped = new Map<string, typeof visits>();
    for (const visit of visits) {
      const items = grouped.get(visit.visitDate) ?? [];
      items.push(visit);
      grouped.set(visit.visitDate, items);
    }
    return grouped;
  }, [visits]);

  const selectedVisits = visitsByDate.get(selectedDateKey) ?? [];

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

      {isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {getApiErrorMessage(error)}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Visit Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthCalendarGrid
            currentMonth={currentMonth}
            selectedDateKey={selectedDateKey}
            onMonthChange={setCurrentMonth}
            onSelectDate={(dateKey) => setSelectedDateKey(dateKey)}
            getCountForDate={(dateKey) => visitsByDate.get(dateKey)?.length ?? 0}
            isLoading={isLoading}
            countLabel={(count) => `${count} visit${count === 1 ? "" : "s"}`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Visits on{" "}
            {formatLocalDateLabel(selectedDateKey, {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
                <p className="text-sm text-muted-foreground">
                  {(visit.visitTime ?? "").slice(0, 5)} — {visit.project?.projectName ?? "No project"}
                </p>
              </div>
              <span className="text-sm text-muted-foreground">{VISIT_STATUS_LABELS[visit.status]}</span>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
