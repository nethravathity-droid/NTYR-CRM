import { useState } from "react";
import { Calendar, Clock, UserCheck, UserX, CalendarX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAttendanceStats } from "@/features/attendance/hooks/useAttendance";
import { Loading } from "@/components/shared/Loading";

const STAT_ITEMS = [
  { key: "presentDays", label: "Present", icon: UserCheck, color: "text-emerald-600" },
  { key: "absentDays", label: "Absent", icon: UserX, color: "text-rose-600" },
  { key: "leaveDays", label: "Leave", icon: CalendarX, color: "text-amber-600" },
  { key: "halfDays", label: "Half Day", icon: Clock, color: "text-blue-600" },
] as const;

export function AttendanceStatsCard() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { data: stats, isLoading } = useAttendanceStats(startDate || undefined, endDate || undefined);

  if (isLoading) return <Loading label="Loading attendance..." />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Attendance
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="startDate" className="text-xs">From</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-8 w-auto text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="endDate" className="text-xs">To</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-8 w-auto text-xs"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STAT_ITEMS.map((item) => (
              <div key={item.key} className="rounded-xl border p-4">
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <p className="mt-2 text-2xl font-bold">{stats[item.key]}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
            <div className="rounded-xl border p-4">
              <Calendar className="h-5 w-5 text-primary" />
              <p className="mt-2 text-2xl font-bold">{stats.totalWorkingDays}</p>
              <p className="text-xs text-muted-foreground">Working Days</p>
            </div>
            <div className="rounded-xl border p-4 sm:col-span-2 lg:col-span-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Attendance Rate</p>
                  <p className="text-xs text-muted-foreground">Based on present + half days</p>
                </div>
                <p className="text-2xl font-bold">{stats.attendancePercentage}%</p>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${stats.attendancePercentage}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No attendance data available.</p>
        )}
      </CardContent>
    </Card>
  );
}
