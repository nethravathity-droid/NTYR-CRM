import { Link, useNavigate } from "react-router-dom";
import { Bell, CheckCircle2, MapPinned, Trophy } from "lucide-react";
import { GlassCard, SectionHeader } from "@/components/premium/PremiumCards";
import type { BookingListItem } from "@/features/bookings/types/booking.types";
import { FollowupQuickActions } from "@/features/dashboards/components/FollowupQuickActions";
import type { FollowupListItem } from "@/features/followups/types/followup.types";
import type { VisitListItem } from "@/features/visits/types/visit.types";
import type { EmployeePerformanceItem } from "@/features/reports/types/report.types";
import type { InventoryDashboard } from "@/features/properties/types/property.types";
import { formatCurrency } from "@/features/payments/types/payment.types";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { paths } from "@/routes/paths";

interface DashboardRightPanelProps {
  todayFollowups: FollowupListItem[];
  overdueFollowups: FollowupListItem[];
  upcomingVisits: VisitListItem[];
  pendingBookings: BookingListItem[];
  bestPerformer: EmployeePerformanceItem | null;
  inventory?: InventoryDashboard;
  paymentSummary: {
    todaysCollection: number;
    weeklyCollection: number;
    monthlyCollection: number;
    outstanding: number;
    overdueAmount: number;
    overdueCount: number;
  };
}

function SummaryLink({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link to={href} className="flex justify-between rounded-[10px] px-1 py-0.5 transition hover:bg-muted/40">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </Link>
  );
}

export function DashboardRightPanel({
  todayFollowups,
  overdueFollowups,
  upcomingVisits,
  pendingBookings,
  bestPerformer,
  inventory,
  paymentSummary,
}: DashboardRightPanelProps) {
  const navigate = useNavigate();
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);

  const customerHref = (followup: FollowupListItem) =>
    followup.lead?.uuid ? paths.leads.details(followup.lead.uuid) : paths.followups.timeline(followup.uuid);

  return (
    <>
      <aside className="min-w-0 space-y-5 2xl:sticky 2xl:top-0 2xl:self-start">
        <GlassCard className="p-5">
          <SectionHeader title="Upcoming Tasks" description="Follow-ups due in selected range" />
          <div className="space-y-2">
            {todayFollowups.slice(0, 5).map((task) => (
              <div key={task.uuid} className="rounded-[14px] border p-3 text-sm">
                <button
                  type="button"
                  onClick={() => navigate(customerHref(task))}
                  className="w-full text-left"
                >
                  <p className="font-medium">{task.customerName}</p>
                  <p className="text-xs text-muted-foreground">{task.followupTime.slice(0, 5)} · {task.type}</p>
                </button>
                <div className="mt-2 flex justify-end">
                  <FollowupQuickActions
                    followup={task}
                    onWhatsAppUnavailable={() => setWhatsappDialogOpen(true)}
                  />
                </div>
              </div>
            ))}
            {todayFollowups.length === 0 ? <p className="text-sm text-muted-foreground">No tasks due.</p> : null}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader title="Today's Meetings" description="Scheduled site visits" />
          <div className="space-y-2">
            {upcomingVisits.slice(0, 4).map((visit) => (
              <Link key={visit.uuid} to={paths.visits.details(visit.uuid)} className="flex items-start gap-3 rounded-[14px] border p-3 text-sm hover:bg-muted/40">
                <MapPinned className="mt-0.5 h-4 w-4 text-[#2563EB]" />
                <div>
                  <p className="font-medium">{visit.customerName}</p>
                  <p className="text-xs text-muted-foreground">{visit.visitDate} · {visit.visitTime.slice(0, 5)}</p>
                </div>
              </Link>
            ))}
            {upcomingVisits.length === 0 ? <p className="text-sm text-muted-foreground">No visits scheduled.</p> : null}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader
            title="Notifications"
            action={
              overdueFollowups.length > 0 ? (
                <Badge variant="destructive">{overdueFollowups.length}</Badge>
              ) : null
            }
          />
          <div className="space-y-2">
            {overdueFollowups.slice(0, 4).map((item) => (
              <button
                key={item.uuid}
                type="button"
                onClick={() => navigate(paths.followups.timeline(item.uuid))}
                className="flex w-full items-start gap-3 rounded-[14px] border border-[#EF4444]/20 bg-[#EF4444]/5 p-3 text-left text-sm hover:bg-[#EF4444]/10"
              >
                <Bell className="mt-0.5 h-4 w-4 text-[#EF4444]" />
                <div>
                  <p className="font-medium">Overdue follow-up</p>
                  <p className="text-xs text-muted-foreground">{item.customerName}</p>
                </div>
              </button>
            ))}
            {overdueFollowups.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                All caught up
              </div>
            ) : null}
            <Link to={paths.notifications.list} className="block pt-1 text-xs font-medium text-[#2563EB] hover:underline">
              View all notifications
            </Link>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader title="Pending Approvals" />
          <div className="space-y-2">
            {pendingBookings.map((booking) => (
              <Link key={booking.uuid} to={paths.bookings.approvals} className="block rounded-[14px] border p-3 text-sm hover:bg-muted/40">
                <p className="font-medium">{booking.customerName}</p>
                <p className="text-xs text-muted-foreground">{booking.bookingNumber} · {formatCurrency(booking.finalPrice)}</p>
              </Link>
            ))}
            {pendingBookings.length === 0 ? <p className="text-sm text-muted-foreground">No pending approvals.</p> : null}
          </div>
        </GlassCard>

        {bestPerformer ? (
          <GlassCard className="p-5">
            <SectionHeader title="Top Performer" />
            <button
              type="button"
              onClick={() =>
                navigate(`${paths.reports.employees}?search=${encodeURIComponent(bestPerformer.employeeCode)}`)
              }
              className="flex w-full items-center gap-3 rounded-[14px] border bg-[#10B981]/5 p-4 text-left hover:bg-[#10B981]/10"
            >
              <Trophy className="h-8 w-8 text-[#F59E0B]" />
              <div>
                <p className="font-semibold">{bestPerformer.displayName ?? bestPerformer.employeeCode}</p>
                <p className="text-sm text-muted-foreground">{bestPerformer.bookingsClosed} bookings · {formatCurrency(bestPerformer.revenueCollected)}</p>
              </div>
            </button>
          </GlassCard>
        ) : null}

        {inventory ? (
          <GlassCard className="p-5">
            <SectionHeader title="Property Summary" action={<Link to={paths.projects.inventory} className="text-xs text-[#2563EB] hover:underline">Inventory</Link>} />
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Link to={paths.projects.list} className="rounded-[14px] border p-3 hover:bg-muted/40"><dt className="text-muted-foreground">Projects</dt><dd className="text-xl font-bold">{inventory.totalProjects}</dd></Link>
              <Link to={paths.projects.inventory} className="rounded-[14px] border p-3 hover:bg-muted/40"><dt className="text-muted-foreground">Available</dt><dd className="text-xl font-bold">{inventory.availableUnits}</dd></Link>
              <Link to={paths.bookings.list} className="rounded-[14px] border p-3 hover:bg-muted/40"><dt className="text-muted-foreground">Booked</dt><dd className="text-xl font-bold">{inventory.bookedUnits}</dd></Link>
              <Link to={paths.projects.inventory} className="rounded-[14px] border p-3 hover:bg-muted/40"><dt className="text-muted-foreground">Sold</dt><dd className="text-xl font-bold">{inventory.soldUnits}</dd></Link>
            </dl>
          </GlassCard>
        ) : null}

        <GlassCard className="p-5">
          <SectionHeader title="Payment Summary" action={<Link to={paths.reports.payments} className="text-xs text-[#2563EB] hover:underline">Revenue report</Link>} />
          <dl className="space-y-3 text-sm">
            <SummaryLink label="Today" value={formatCurrency(paymentSummary.todaysCollection)} href={paths.payments.dashboard} />
            <SummaryLink label="This Week" value={formatCurrency(paymentSummary.weeklyCollection)} href={paths.reports.payments} />
            <SummaryLink label="This Month" value={formatCurrency(paymentSummary.monthlyCollection)} href={paths.reports.payments} />
            <SummaryLink label="Outstanding" value={formatCurrency(paymentSummary.outstanding)} href={`${paths.payments.list}?status=PENDING`} />
            <SummaryLink label="Overdue" value={`${formatCurrency(paymentSummary.overdueAmount)} (${paymentSummary.overdueCount})`} href={`${paths.payments.list}?status=PENDING`} />
          </dl>
        </GlassCard>
      </aside>

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
