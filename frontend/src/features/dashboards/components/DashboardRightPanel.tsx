import { Link } from "react-router-dom";
import { Bell, CheckCircle2, MapPinned, Trophy } from "lucide-react";
import { GlassCard, SectionHeader } from "@/components/premium/PremiumCards";
import type { BookingListItem } from "@/features/bookings/types/booking.types";
import type { FollowupListItem } from "@/features/followups/types/followup.types";
import type { VisitListItem } from "@/features/visits/types/visit.types";
import type { EmployeePerformanceItem } from "@/features/reports/types/report.types";
import type { InventoryDashboard } from "@/features/properties/types/property.types";
import { formatCurrency } from "@/features/payments/types/payment.types";
import { Badge } from "@/components/ui/badge";
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

export function DashboardRightPanel({
  todayFollowups,
  overdueFollowups,
  upcomingVisits,
  pendingBookings,
  bestPerformer,
  inventory,
  paymentSummary,
}: DashboardRightPanelProps) {
  return (
    <aside className="min-w-0 space-y-5 2xl:sticky 2xl:top-0 2xl:self-start">
      <GlassCard className="p-5">
        <SectionHeader title="Upcoming Tasks" description="Follow-ups due today" />
        <div className="space-y-2">
          {todayFollowups.slice(0, 5).map((task) => (
            <Link key={task.uuid} to={paths.followups.list} className="block rounded-[14px] border p-3 text-sm hover:bg-muted/40">
              <p className="font-medium">{task.customerName}</p>
              <p className="text-xs text-muted-foreground">{task.followupTime.slice(0, 5)} · {task.type}</p>
            </Link>
          ))}
          {todayFollowups.length === 0 ? <p className="text-sm text-muted-foreground">No tasks due today.</p> : null}
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
            <div key={item.uuid} className="flex items-start gap-3 rounded-[14px] border border-[#EF4444]/20 bg-[#EF4444]/5 p-3 text-sm">
              <Bell className="mt-0.5 h-4 w-4 text-[#EF4444]" />
              <div>
                <p className="font-medium">Overdue follow-up</p>
                <p className="text-xs text-muted-foreground">{item.customerName}</p>
              </div>
            </div>
          ))}
          {overdueFollowups.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
              All caught up
            </div>
          ) : null}
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
          <div className="flex items-center gap-3 rounded-[14px] border bg-[#10B981]/5 p-4">
            <Trophy className="h-8 w-8 text-[#F59E0B]" />
            <div>
              <p className="font-semibold">{bestPerformer.displayName ?? bestPerformer.employeeCode}</p>
              <p className="text-sm text-muted-foreground">{bestPerformer.bookingsClosed} bookings · {formatCurrency(bestPerformer.revenueCollected)}</p>
            </div>
          </div>
        </GlassCard>
      ) : null}

      {inventory ? (
        <GlassCard className="p-5">
          <SectionHeader title="Property Summary" action={<Link to={paths.projects.inventory} className="text-xs text-[#2563EB] hover:underline">Inventory</Link>} />
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-[14px] border p-3"><dt className="text-muted-foreground">Projects</dt><dd className="text-xl font-bold">{inventory.totalProjects}</dd></div>
            <div className="rounded-[14px] border p-3"><dt className="text-muted-foreground">Available</dt><dd className="text-xl font-bold">{inventory.availableUnits}</dd></div>
            <div className="rounded-[14px] border p-3"><dt className="text-muted-foreground">Booked</dt><dd className="text-xl font-bold">{inventory.bookedUnits}</dd></div>
            <div className="rounded-[14px] border p-3"><dt className="text-muted-foreground">Sold</dt><dd className="text-xl font-bold">{inventory.soldUnits}</dd></div>
          </dl>
        </GlassCard>
      ) : null}

      <GlassCard className="p-5">
        <SectionHeader title="Payment Summary" />
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Today</dt><dd className="font-semibold">{formatCurrency(paymentSummary.todaysCollection)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">This Week</dt><dd className="font-semibold">{formatCurrency(paymentSummary.weeklyCollection)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">This Month</dt><dd className="font-semibold">{formatCurrency(paymentSummary.monthlyCollection)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Outstanding</dt><dd className="font-semibold">{formatCurrency(paymentSummary.outstanding)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Overdue</dt><dd className="font-semibold text-[#EF4444]">{formatCurrency(paymentSummary.overdueAmount)} ({paymentSummary.overdueCount})</dd></div>
        </dl>
      </GlassCard>
    </aside>
  );
}
