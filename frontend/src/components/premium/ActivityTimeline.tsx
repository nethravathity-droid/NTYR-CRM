import type { DashboardRecentActivity } from "@/features/dashboard/types/dashboard.types";
import { GlassCard } from "@/components/premium/PremiumCards";

function formatRelativeTime(value: string | Date): string {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface ActivityTimelineProps {
  activities: DashboardRecentActivity[];
  emptyMessage?: string;
}

export function ActivityTimeline({ activities, emptyMessage = "No recent activity." }: ActivityTimelineProps) {
  return (
    <GlassCard>
      <div className="divide-y">
        {activities.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex gap-4 p-5 transition-colors hover:bg-muted/30">
              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-medium">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground">
                  {activity.actorName ? `${activity.actorName} · ` : ""}
                  {formatRelativeTime(activity.occurredAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
