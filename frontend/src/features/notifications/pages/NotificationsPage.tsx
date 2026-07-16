import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { GlassCard, SectionHeader } from "@/components/premium/PremiumCards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications, type NotificationType } from "@/hooks/useNotifications";
import { paths } from "@/routes/paths";

const TYPE_LABELS: Record<NotificationType, string> = {
  LEAD_ASSIGNED: "Lead Assigned",
  FOLLOWUP_REMINDER: "Follow-up Reminder",
  VISIT_REMINDER: "Visit Reminder",
  BOOKING_CREATED: "Booking Created",
  PAYMENT_RECEIVED: "Payment Received",
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, isRead } = useNotifications();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Lead assignments, follow-ups, visits, bookings, and payments.</p>
        </div>
        {notifications.length > 0 ? (
          <Button variant="outline" className="rounded-[14px]" onClick={markAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        ) : null}
      </div>

      <GlassCard className="p-5">
        <SectionHeader
          title="Inbox"
          description={`${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
        />
        <div className="divide-y">
          {notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No notifications right now.</p>
          ) : (
            notifications.map((notification) => {
              const read = isRead(notification.id);
              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => {
                    markAsRead(notification.id);
                    navigate(notification.href);
                  }}
                  className={`flex w-full items-start gap-4 px-1 py-4 text-left transition hover:bg-muted/30 ${
                    read ? "opacity-70" : ""
                  }`}
                >
                  <Bell className={`mt-1 h-4 w-4 ${read ? "text-muted-foreground" : "text-[#2563EB]"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{notification.title}</p>
                      <Badge variant="outline">{TYPE_LABELS[notification.type]}</Badge>
                      {!read ? <Badge className="bg-[#2563EB]">Unread</Badge> : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(notification.occurredAt).toLocaleString()}
                    </p>
                  </div>
                  {!read ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        markAsRead(notification.id);
                      }}
                    >
                      Mark read
                    </Button>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
        {notifications.length > 0 ? (
          <div className="pt-4">
            <Button variant="link" className="px-0" onClick={() => navigate(paths.followups.list)}>
              View follow-ups
            </Button>
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}
