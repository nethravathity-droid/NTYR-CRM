import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthCalendarGrid, useCalendarMonthState } from "@/components/calendar/MonthCalendarGrid";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { useFollowupsCalendar } from "@/features/followups/hooks/useFollowups";
import { FOLLOWUP_TYPE_LABELS } from "@/features/followups/types/followup.types";
import { getApiErrorMessage } from "@/lib/api/client";
import { formatLocalDateLabel, getMonthBounds } from "@/lib/date/local-date";
import { paths } from "@/routes/paths";

export function FollowupCalendarPage() {
  const navigate = useNavigate();
  const { currentMonth, setCurrentMonth, selectedDateKey, setSelectedDateKey } = useCalendarMonthState();

  const monthBounds = useMemo(() => getMonthBounds(currentMonth), [currentMonth]);
  const { data: followups = [], isLoading, isError, error } = useFollowupsCalendar(
    monthBounds.fromDate,
    monthBounds.toDate,
  );

  const followupsByDate = useMemo(() => {
    const grouped = new Map<string, typeof followups>();

    for (const followup of followups) {
      const items = grouped.get(followup.followupDate) ?? [];
      items.push(followup);
      grouped.set(followup.followupDate, items);
    }

    return grouped;
  }, [followups]);

  const selectedFollowups = followupsByDate.get(selectedDateKey) ?? [];

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

      {isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {getApiErrorMessage(error)}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Follow-up Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthCalendarGrid
            currentMonth={currentMonth}
            selectedDateKey={selectedDateKey}
            onMonthChange={setCurrentMonth}
            onSelectDate={(dateKey) => setSelectedDateKey(dateKey)}
            getCountForDate={(dateKey) => followupsByDate.get(dateKey)?.length ?? 0}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {formatLocalDateLabel(selectedDateKey, {
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
                    {(followup.followupTime ?? "").slice(0, 5)} • {FOLLOWUP_TYPE_LABELS[followup.type]} •{" "}
                    {followup.status}
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
