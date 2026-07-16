import { Banknote, CalendarClock, CreditCard, MapPinned, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { GlassCard, KpiCard, SectionHeader } from "@/components/premium/PremiumCards";
import { QuickActionBar } from "@/components/premium/QuickActionBar";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useVisits } from "@/features/visits/hooks/useVisits";
import { useBookings } from "@/features/bookings/hooks/useBookings";
import { useCollectionSummary } from "@/features/payments/hooks/usePayments";
import { formatCurrency } from "@/features/payments/types/payment.types";
import { Loading } from "@/components/shared/Loading";
import { paths } from "@/routes/paths";

const today = new Date().toISOString().slice(0, 10);

export function SalesExecutiveDashboardPage() {
  const { user } = useAuth();
  const assignedUserId = user?.user.id;

  const { data: visitsToday, isLoading: visitsLoading } = useVisits({
    page: 1,
    limit: 5,
    fromDate: today,
    toDate: today,
    assignedUserId,
    sortBy: "visit_date",
    sortOrder: "asc",
  });
  const { data: upcomingVisits } = useVisits({
    page: 1,
    limit: 5,
    fromDate: today,
    assignedUserId,
    sortBy: "visit_date",
    sortOrder: "asc",
  });
  const { data: bookings, isLoading: bookingsLoading } = useBookings({
    page: 1,
    limit: 5,
    sortBy: "booking_date",
    sortOrder: "desc",
  });
  const { data: payments } = useCollectionSummary();

  const pendingBookings = (bookings?.bookings ?? []).filter(
    (b) => b.status === "PENDING_APPROVAL" || b.status === "DRAFT",
  ).length;
  const approvedBookings = (bookings?.bookings ?? []).filter((b) => b.status === "APPROVED").length;

  if (visitsLoading || bookingsLoading) return <Loading label="Loading sales dashboard..." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sales Executive Dashboard</h1>
        <p className="text-muted-foreground">Visits, bookings, collections, and your performance pipeline.</p>
      </div>

      <QuickActionBar
        actions={[
          { label: "Schedule Visit", href: paths.visits.create, icon: MapPinned },
          { label: "Create Booking", href: paths.bookings.create, icon: CreditCard },
          { label: "Follow-ups", href: paths.followups.list, icon: CalendarClock },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Today's Visits" value={visitsToday?.pagination.total ?? 0} icon={MapPinned} tone="cyan" />
        <KpiCard label="Upcoming Visits" value={upcomingVisits?.pagination.total ?? 0} icon={CalendarClock} tone="blue" />
        <KpiCard label="Bookings" value={bookings?.pagination.total ?? 0} icon={CreditCard} tone="emerald" />
        <KpiCard label="Pending Bookings" value={pendingBookings} icon={CreditCard} tone="amber" />
        <KpiCard label="Collection" value={formatCurrency(payments?.totalCollected ?? 0)} icon={Banknote} tone="emerald" />
        <KpiCard label="Outstanding" value={formatCurrency(payments?.totalOutstanding ?? 0)} icon={Banknote} tone="rose" />
        <KpiCard label="Approved Deals" value={approvedBookings} icon={Target} tone="violet" />
        <KpiCard label="Performance" value={bookings?.pagination.total ?? 0} icon={TrendingUp} tone="indigo" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard className="p-5">
          <SectionHeader title="Upcoming Visits" action={<Link to={paths.visits.calendar} className="text-sm text-primary hover:underline">Calendar</Link>} />
          <div className="space-y-3">
            {(upcomingVisits?.visits ?? []).map((visit) => (
              <Link key={visit.uuid} to={paths.visits.details(visit.uuid)} className="block rounded-xl border p-4 hover:bg-muted/40">
                <p className="font-medium">{visit.customerName}</p>
                <p className="text-sm text-muted-foreground">{visit.visitDate} · {visit.visitTime.slice(0, 5)} · {visit.status}</p>
              </Link>
            ))}
            {(upcomingVisits?.visits ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming visits scheduled.</p>
            ) : null}
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <SectionHeader title="Recent Bookings" action={<Link to={paths.bookings.list} className="text-sm text-primary hover:underline">All bookings</Link>} />
          <div className="space-y-3">
            {(bookings?.bookings ?? []).map((booking) => (
              <Link key={booking.uuid} to={paths.bookings.details(booking.uuid)} className="block rounded-xl border p-4 hover:bg-muted/40">
                <p className="font-medium">{booking.customerName}</p>
                <p className="text-sm text-muted-foreground">{booking.bookingNumber} · {formatCurrency(booking.finalPrice)} · {booking.status}</p>
              </Link>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
