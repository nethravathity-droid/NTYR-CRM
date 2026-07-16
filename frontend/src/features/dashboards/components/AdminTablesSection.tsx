import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ActivityTimeline } from "@/components/premium/ActivityTimeline";
import { GlassCard, SectionHeader } from "@/components/premium/PremiumCards";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BookingListItem } from "@/features/bookings/types/booking.types";
import type { DashboardRecentActivity } from "@/features/dashboard/types/dashboard.types";
import { FollowupQuickActions } from "@/features/dashboards/components/FollowupQuickActions";
import type { FollowupListItem } from "@/features/followups/types/followup.types";
import type { LeadListItem } from "@/features/leads/types/lead.types";
import type { PaymentListItem } from "@/features/payments/types/payment.types";
import { formatCurrency } from "@/features/payments/types/payment.types";
import type { EmployeePerformanceItem } from "@/features/reports/types/report.types";
import type { VisitListItem } from "@/features/visits/types/visit.types";
import { Badge } from "@/components/ui/badge";
import { paths } from "@/routes/paths";

function TableShell({
  title,
  action,
  loading,
  empty,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  children: React.ReactNode;
}) {
  return (
    <GlassCard className="overflow-hidden">
      <div className="border-b px-5 py-4">
        <SectionHeader title={title} action={action} />
      </div>
      {loading ? (
        <div className="space-y-3 p-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : empty ? (
        <p className="p-5 text-sm text-muted-foreground">No records found.</p>
      ) : (
        <div className="divide-y">{children}</div>
      )}
    </GlassCard>
  );
}

function Row({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-sm transition hover:bg-muted/30"
      >
        {children}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3 text-sm transition hover:bg-muted/30">
      {children}
    </div>
  );
}

export function AdminTablesSection({
  todayFollowups,
  recentLeads,
  upcomingVisits,
  recentBookings,
  overduePayments,
  activities,
  topEmployees,
  loading,
}: {
  todayFollowups: FollowupListItem[];
  recentLeads: LeadListItem[];
  upcomingVisits: VisitListItem[];
  recentBookings: BookingListItem[];
  overduePayments: PaymentListItem[];
  activities: DashboardRecentActivity[];
  topEmployees: EmployeePerformanceItem[];
  loading: {
    recentLeads?: boolean;
    visits?: boolean;
    bookings?: boolean;
    activities?: boolean;
  };
}) {
  const navigate = useNavigate();
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);

  const customerHref = (followup: FollowupListItem) =>
    followup.lead?.uuid ? paths.leads.details(followup.lead.uuid) : paths.followups.timeline(followup.uuid);

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-2">
        <TableShell
          title="Upcoming Follow-ups"
          action={<Link to={paths.followups.today} className="text-sm text-[#2563EB] hover:underline">View all</Link>}
          empty={todayFollowups.length === 0}
        >
          {todayFollowups.slice(0, 6).map((followup) => (
            <Row key={followup.uuid}>
              <button
                type="button"
                onClick={() => navigate(customerHref(followup))}
                className="min-w-0 flex-1 text-left"
              >
                <p className="font-medium">{followup.customerName}</p>
                <p className="text-xs text-muted-foreground">
                  {followup.followupTime.slice(0, 5)} · {followup.type}
                </p>
              </button>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{followup.status}</Badge>
                <FollowupQuickActions
                  followup={followup}
                  onWhatsAppUnavailable={() => setWhatsappDialogOpen(true)}
                />
              </div>
            </Row>
          ))}
        </TableShell>

        <TableShell
          title="Recent Leads"
          action={<Link to={paths.leads.list} className="text-sm text-[#2563EB] hover:underline">View all</Link>}
          loading={loading.recentLeads}
          empty={recentLeads.length === 0}
        >
          {recentLeads.map((lead) => (
            <Row key={lead.uuid} onClick={() => navigate(paths.leads.details(lead.uuid))}>
              <div>
                <p className="font-medium">{lead.customerName}</p>
                <p className="text-xs text-muted-foreground">{lead.leadNumber} · {lead.leadSource ?? "—"}</p>
              </div>
              <Badge variant="outline">{lead.status}</Badge>
            </Row>
          ))}
        </TableShell>

        <TableShell
          title="Upcoming Visits"
          action={<Link to={paths.visits.calendar} className="text-sm text-[#2563EB] hover:underline">Calendar</Link>}
          loading={loading.visits}
          empty={upcomingVisits.length === 0}
        >
          {upcomingVisits.map((visit) => (
            <Row key={visit.uuid} onClick={() => navigate(paths.visits.details(visit.uuid))}>
              <div>
                <p className="font-medium">{visit.customerName}</p>
                <p className="text-xs text-muted-foreground">{visit.visitDate} · {visit.visitTime.slice(0, 5)}</p>
              </div>
              <Badge variant="outline">{visit.status}</Badge>
            </Row>
          ))}
        </TableShell>

        <TableShell
          title="Recent Bookings"
          action={<Link to={paths.bookings.list} className="text-sm text-[#2563EB] hover:underline">View all</Link>}
          loading={loading.bookings}
          empty={recentBookings.length === 0}
        >
          {recentBookings.map((booking) => (
            <Row key={booking.uuid} onClick={() => navigate(paths.bookings.details(booking.uuid))}>
              <div>
                <p className="font-medium">{booking.customerName}</p>
                <p className="text-xs text-muted-foreground">{booking.bookingNumber}</p>
              </div>
              <span className="font-medium">{formatCurrency(booking.finalPrice)}</span>
            </Row>
          ))}
        </TableShell>

        <TableShell
          title="Pending Payments"
          action={<Link to={paths.payments.list} className="text-sm text-[#2563EB] hover:underline">View all</Link>}
          empty={overduePayments.length === 0}
        >
          {overduePayments.map((payment) => (
            <Row key={payment.uuid} onClick={() => navigate(paths.payments.details(payment.uuid))}>
              <div>
                <p className="font-medium">{payment.customerName}</p>
                <p className="text-xs text-muted-foreground">{payment.paymentNumber} · due {payment.dueDate}</p>
              </div>
              <span className="font-medium text-[#EF4444]">{formatCurrency(payment.dueAmount)}</span>
            </Row>
          ))}
        </TableShell>

        <TableShell title="Top Performing Employees" empty={topEmployees.length === 0}>
          {topEmployees.map((employee) => (
            <Row
              key={employee.userId}
              onClick={() =>
                navigate(`${paths.reports.employees}?search=${encodeURIComponent(employee.employeeCode)}`)
              }
            >
              <div>
                <p className="font-medium">{employee.displayName ?? employee.employeeCode}</p>
                <p className="text-xs text-muted-foreground">{employee.leadsAssigned} leads · {employee.bookingsClosed} bookings</p>
              </div>
              <span className="font-medium text-[#10B981]">{formatCurrency(employee.revenueCollected)}</span>
            </Row>
          ))}
        </TableShell>

        <div className="xl:col-span-2">
          <SectionHeader title="Latest Activities" />
          {loading.activities ? (
            <GlassCard className="p-5"><Skeleton className="h-32 w-full" /></GlassCard>
          ) : (
            <ActivityTimeline activities={activities} />
          )}
        </div>
      </div>

      <Dialog open={whatsappDialogOpen} onOpenChange={setWhatsappDialogOpen}>
        <DialogContent className="rounded-[18px] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>WhatsApp Not Available</DialogTitle>
            <DialogDescription>WhatsApp integration not configured.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
