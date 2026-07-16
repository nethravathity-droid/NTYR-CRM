import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { bookingsService } from "@/features/bookings/services/bookings.service";
import { useOverdueFollowups, useTodayFollowups } from "@/features/followups/hooks/useFollowups";
import { leadsService } from "@/features/leads/services/leads.service";
import { paymentsService } from "@/features/payments/services/payments.service";
import { visitsService } from "@/features/visits/services/visits.service";
import { usePermissions } from "@/hooks/usePermissions";
import { paths } from "@/routes/paths";

export type NotificationType =
  | "LEAD_ASSIGNED"
  | "FOLLOWUP_REMINDER"
  | "VISIT_REMINDER"
  | "BOOKING_CREATED"
  | "PAYMENT_RECEIVED";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  occurredAt: string;
  href: string;
}

const READ_STORAGE_KEY = "crm-read-notifications";

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(ids)));
}

export function useNotifications() {
  const { hasPermission } = usePermissions();
  const canLeads = hasPermission("leads.view");
  const canVisits = hasPermission("visits.view");
  const canBookings = hasPermission("bookings.view");
  const canPayments = hasPermission("payments.view");
  const [readVersion, setReadVersion] = useState(0);

  const today = new Date().toISOString().slice(0, 10);

  const { data: assignedLeads } = useQuery({
    queryKey: ["notifications", "assigned-leads"],
    queryFn: () =>
      leadsService.list({ page: 1, limit: 8, status: "ASSIGNED", sortBy: "updated_at", sortOrder: "desc" }),
    enabled: canLeads,
  });
  const { data: todayFollowups = [] } = useTodayFollowups({ enabled: canLeads });
  const { data: overdueFollowups = [] } = useOverdueFollowups({ enabled: canLeads });
  const { data: upcomingVisits } = useQuery({
    queryKey: ["notifications", "visits", today],
    queryFn: () =>
      visitsService.list({ page: 1, limit: 8, fromDate: today, sortBy: "visit_date", sortOrder: "asc" }),
    enabled: canVisits,
  });
  const { data: recentBookings } = useQuery({
    queryKey: ["notifications", "bookings"],
    queryFn: () => bookingsService.list({ page: 1, limit: 8, sortBy: "created_at", sortOrder: "desc" }),
    enabled: canBookings,
  });
  const { data: recentPayments } = useQuery({
    queryKey: ["notifications", "payments"],
    queryFn: () =>
      paymentsService.list({ page: 1, limit: 8, status: "PAID", sortBy: "payment_date", sortOrder: "desc" }),
    enabled: canPayments,
  });

  const readIds = useMemo(() => {
    void readVersion;
    return loadReadIds();
  }, [readVersion]);

  const notifications = useMemo(() => {
    const items: AppNotification[] = [];

    for (const lead of assignedLeads?.leads ?? []) {
      items.push({
        id: `lead-assigned-${lead.uuid}`,
        type: "LEAD_ASSIGNED",
        title: "Lead Assigned",
        description: `${lead.customerName} · ${lead.leadNumber}`,
        occurredAt: lead.updatedAt,
        href: paths.leads.details(lead.uuid),
      });
    }

    for (const followup of [...overdueFollowups, ...todayFollowups]) {
      items.push({
        id: `followup-${followup.uuid}`,
        type: "FOLLOWUP_REMINDER",
        title: "Follow-up Reminder",
        description: `${followup.customerName} · ${followup.followupDate} ${followup.followupTime.slice(0, 5)}`,
        occurredAt: `${followup.followupDate}T${followup.followupTime}`,
        href: followup.lead?.uuid
          ? paths.leads.details(followup.lead.uuid)
          : paths.followups.timeline(followup.uuid),
      });
    }

    for (const visit of upcomingVisits?.visits ?? []) {
      items.push({
        id: `visit-${visit.uuid}`,
        type: "VISIT_REMINDER",
        title: "Visit Reminder",
        description: `${visit.customerName} · ${visit.visitDate} ${visit.visitTime.slice(0, 5)}`,
        occurredAt: `${visit.visitDate}T${visit.visitTime}`,
        href: paths.visits.details(visit.uuid),
      });
    }

    for (const booking of recentBookings?.bookings ?? []) {
      items.push({
        id: `booking-${booking.uuid}`,
        type: "BOOKING_CREATED",
        title: "Booking Created",
        description: `${booking.customerName} · ${booking.bookingNumber}`,
        occurredAt: booking.createdAt ?? booking.bookingDate,
        href: paths.bookings.details(booking.uuid),
      });
    }

    for (const payment of recentPayments?.payments ?? []) {
      items.push({
        id: `payment-${payment.uuid}`,
        type: "PAYMENT_RECEIVED",
        title: "Payment Received",
        description: `${payment.customerName} · ${payment.paymentNumber}`,
        occurredAt: payment.paymentDate ?? payment.createdAt,
        href: paths.payments.details(payment.uuid),
      });
    }

    return items.sort(
      (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );
  }, [
    assignedLeads?.leads,
    overdueFollowups,
    recentBookings?.bookings,
    recentPayments?.payments,
    todayFollowups,
    upcomingVisits?.visits,
  ]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !readIds.has(item.id)).length,
    [notifications, readIds],
  );

  const markAsRead = useCallback((id: string) => {
    const ids = loadReadIds();
    ids.add(id);
    saveReadIds(ids);
    setReadVersion((value) => value + 1);
  }, []);

  const markAllAsRead = useCallback(() => {
    const ids = loadReadIds();
    for (const item of notifications) {
      ids.add(item.id);
    }
    saveReadIds(ids);
    setReadVersion((value) => value + 1);
  }, [notifications]);

  const isRead = useCallback(
    (id: string) => readIds.has(id),
    [readIds],
  );

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isRead,
  };
}
