import { Link } from "react-router-dom";
import { PhoneCall, PhoneIncoming, PhoneMissed, PhoneOutgoing, Plus, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { CallDirectionBadge } from "@/features/calls/components/CallDirectionBadge";
import { CallStatusBadge } from "@/features/calls/components/CallStatusBadge";
import { useCallSummary } from "@/features/calls/hooks/useCalls";
import { buildTelLink, formatCallDuration } from "@/features/calls/types/call.types";
import { usePermissions } from "@/hooks/usePermissions";
import { paths } from "@/routes/paths";

export function CallsDashboardPage() {
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("calls.create");
  const { data: summary, isLoading } = useCallSummary();

  if (isLoading) return <Loading label="Loading calls dashboard..." />;

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={PhoneCall}
        tone="violet"
        title="Calls Dashboard"
        description="Track incoming, outgoing, and missed calls across your team."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild><Link to={paths.calls.list}>All Calls</Link></Button>
            {canCreate ? (
              <Button asChild><Link to={paths.calls.create}><Plus className="mr-2 h-4 w-4" />Log Call</Link></Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <PhoneCall className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{summary?.totalCalls ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Incoming</CardTitle>
            <PhoneIncoming className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{summary?.incomingCalls ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Outgoing</CardTitle>
            <PhoneOutgoing className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{summary?.outgoingCalls ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Missed</CardTitle>
            <PhoneMissed className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{summary?.missedCalls ?? 0}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCallDuration(summary?.averageDurationSeconds ?? 0)}</p>
            <p className="text-xs text-muted-foreground">{summary?.answeredCalls ?? 0} answered</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Calls</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {(summary?.recentCalls ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No calls logged yet.</p>
          ) : null}
          {(summary?.recentCalls ?? []).map((call) => (
            <Link key={call.uuid} to={paths.calls.details(call.uuid)} className="block rounded-lg border p-4 hover:bg-muted/50">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{call.customerName}</p>
                  <p className="text-sm text-muted-foreground">{call.callNumber} · {call.callDate} {call.callTime.slice(0, 5)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <CallDirectionBadge direction={call.direction} />
                  <CallStatusBadge status={call.callStatus} />
                  <span className="text-sm text-muted-foreground">{formatCallDuration(call.durationSeconds)}</span>
                  <Button size="sm" variant="outline" asChild onClick={(e) => e.stopPropagation()}>
                    <a href={buildTelLink(call.mobile)}>Call</a>
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
