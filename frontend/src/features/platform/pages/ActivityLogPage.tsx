import { ActivityTimeline } from "@/components/premium/ActivityTimeline";
import { GlassCard, SectionHeader } from "@/components/premium/PremiumCards";
import { useRecentActivities } from "@/features/dashboard/hooks/useDashboard";
import { Loading } from "@/components/shared/Loading";

export function ActivityLogPage() {
  const { data: activities = [], isLoading } = useRecentActivities(50);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground">Platform-wide audit stream of recent actions and events.</p>
      </div>

      <GlassCard className="p-5">
        <SectionHeader title="Recent Activities" description={`${activities.length} latest events`} />
        {isLoading ? <Loading label="Loading activity log..." /> : <ActivityTimeline activities={activities} />}
      </GlassCard>
    </div>
  );
}
