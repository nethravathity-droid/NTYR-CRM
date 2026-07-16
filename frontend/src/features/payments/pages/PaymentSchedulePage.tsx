import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";
import { usePaymentSchedule } from "@/features/payments/hooks/usePayments";
import { formatCurrency, PAYMENT_TYPE_LABELS } from "@/features/payments/types/payment.types";
import { paths } from "@/routes/paths";

function getMonthBounds(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { fromDate: start.toISOString().slice(0, 10), toDate: end.toISOString().slice(0, 10) };
}

export function PaymentSchedulePage() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const monthBounds = useMemo(() => getMonthBounds(currentMonth), [currentMonth]);

  const { data: schedule = [], isLoading } = usePaymentSchedule(monthBounds);
  const monthLabel = currentMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={CalendarClock}
        tone="emerald"
        title="Payment Schedule"
        description="Upcoming and pending payment dues by date."
        action={
          <Button variant="outline" asChild><Link to={paths.payments.list}>All Payments</Link></Button>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{monthLabel}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCurrentMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}>Previous</Button>
            <Button variant="outline" onClick={() => setCurrentMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}>Next</Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">From Date</label>
            <Input type="date" value={monthBounds.fromDate} readOnly />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">To Date</label>
            <Input type="date" value={monthBounds.toDate} readOnly />
          </div>
        </CardContent>
      </Card>

      {isLoading ? <Loading label="Loading payment schedule..." /> : null}

      <div className="space-y-3">
        {schedule.map((payment) => (
          <button
            key={payment.uuid}
            type="button"
            className="flex w-full items-center justify-between rounded-lg border p-4 text-left hover:bg-muted/50"
            onClick={() => navigate(paths.payments.details(payment.uuid))}
          >
            <div>
              <p className="font-medium">{payment.customerName}</p>
              <p className="text-sm text-muted-foreground">{payment.paymentNumber} — {PAYMENT_TYPE_LABELS[payment.paymentType]} — Due {payment.dueDate}</p>
            </div>
            <div className="text-right">
              <PaymentStatusBadge status={payment.status} />
              <p className="mt-1 text-sm font-semibold">{formatCurrency(payment.dueAmount)}</p>
            </div>
          </button>
        ))}
        {!isLoading && schedule.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No scheduled payments for this period.</CardContent></Card>
        ) : null}
      </div>
    </div>
  );
}
