import { Link } from "react-router-dom";
import { CalendarClock, MessageSquare, PhoneCall, PhoneOutgoing, Target, UserSquare2 } from "lucide-react";
import { GlassCard, KpiCard, SectionHeader } from "@/components/premium/PremiumCards";
import { QuickActionBar } from "@/components/premium/QuickActionBar";
import { CallCard } from "@/features/calls/components/CallCard";
import { useCallSummary } from "@/features/calls/hooks/useCalls";
import { useOverdueFollowups, useTodayFollowups } from "@/features/followups/hooks/useFollowups";
import { useLeads } from "@/features/leads/hooks/useLeads";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatCallDuration } from "@/features/calls/types/call.types";
import { Loading } from "@/components/shared/Loading";
import { paths } from "@/routes/paths";

export function TelecallerDashboardPage() {
  const { user } = useAuth();
  const { data: callSummary, isLoading: callsLoading } = useCallSummary({});
  const { data: todayFollowups = [] } = useTodayFollowups();
  const { data: overdueFollowups = [] } = useOverdueFollowups();
  const { data: leadsData, isLoading: leadsLoading } = useLeads({
    page: 1,
    limit: 6,
    assignedUserId: user?.user.id,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  const conversionRate = callSummary && callSummary.totalCalls > 0
    ? Math.round((callSummary.answeredCalls / callSummary.totalCalls) * 100)
    : 0;

  if (callsLoading || leadsLoading) return <Loading label="Loading telecaller desk..." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Telecaller Desk</h1>
        <p className="text-muted-foreground">Your calling queue, follow-ups, and conversion metrics.</p>
      </div>

      <QuickActionBar
        actions={[
          { label: "Log Call", href: paths.calls.create, icon: PhoneCall },
          { label: "Schedule Follow-up", href: paths.followups.create, icon: CalendarClock },
          { label: "My Leads", href: paths.leads.list, icon: UserSquare2 },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="My Leads" value={leadsData?.pagination.total ?? 0} icon={UserSquare2} tone="indigo" />
        <KpiCard label="Today's Calls" value={callSummary?.totalCalls ?? 0} icon={PhoneCall} tone="violet" />
        <KpiCard label="Pending Calls" value={callSummary?.missedCalls ?? 0} icon={PhoneOutgoing} tone="rose" />
        <KpiCard label="Today's Follow-ups" value={todayFollowups.length} icon={CalendarClock} tone="amber" />
        <KpiCard label="Missed Follow-ups" value={overdueFollowups.length} icon={MessageSquare} tone="rose" />
        <KpiCard label="Avg Call Duration" value={formatCallDuration(callSummary?.averageDurationSeconds ?? 0)} icon={PhoneCall} tone="cyan" />
        <KpiCard label="Conversion Rate" value={`${conversionRate}%`} icon={Target} tone="emerald" />
        <KpiCard label="Answered Calls" value={callSummary?.answeredCalls ?? 0} icon={PhoneCall} tone="blue" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <SectionHeader title="Recent Calls" action={<Link to={paths.calls.list} className="text-sm text-primary hover:underline">View all</Link>} />
          {(callSummary?.recentCalls ?? []).map((call) => (
            <CallCard key={call.uuid} call={call} />
          ))}
        </div>
        <GlassCard className="p-5">
          <SectionHeader title="Today's Follow-ups" action={<Link to={paths.followups.today} className="text-sm text-primary hover:underline">Open queue</Link>} />
          <div className="space-y-3">
            {todayFollowups.slice(0, 8).map((followup) => (
              <div key={followup.uuid} className="rounded-xl border p-4">
                <p className="font-medium">{followup.customerName}</p>
                <p className="text-sm text-muted-foreground">{followup.followupDate} · {followup.followupTime.slice(0, 5)}</p>
              </div>
            ))}
            {todayFollowups.length === 0 ? <p className="text-sm text-muted-foreground">No follow-ups scheduled for today.</p> : null}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
