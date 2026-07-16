import { Link } from "react-router-dom";
import { AlertTriangle, Banknote, CalendarClock, IndianRupee, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";
import {
  useCollectionSummary,
  useOverduePayments,
  useOutstandingPayments,
} from "@/features/payments/hooks/usePayments";
import { formatCurrency, PAYMENT_TYPE_LABELS } from "@/features/payments/types/payment.types";
import { usePermissions } from "@/hooks/usePermissions";
import { paths } from "@/routes/paths";

export function PaymentDashboardPage() {
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("payments.create");

  const { data: summary, isLoading: summaryLoading } = useCollectionSummary();
  const { data: outstanding = [], isLoading: outstandingLoading } = useOutstandingPayments();
  const { data: overdue = [], isLoading: overdueLoading } = useOverduePayments();

  if (summaryLoading) return <Loading label="Loading payment dashboard..." />;

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={Banknote}
        tone="emerald"
        title="Payment Dashboard"
        description="Track collections, outstanding dues, and overdue payments."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild><Link to={paths.payments.list}>All Payments</Link></Button>
            <Button variant="outline" asChild><Link to={paths.payments.schedule}>Schedule</Link></Button>
            {canCreate ? (
              <Button asChild><Link to={paths.payments.create}><Plus className="mr-2 h-4 w-4" />Add Payment</Link></Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(summary?.totalCollected ?? 0)}</p><p className="text-xs text-muted-foreground">{summary?.paidCount ?? 0} paid payments</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(summary?.totalOutstanding ?? 0)}</p><p className="text-xs text-muted-foreground">{(summary?.pendingCount ?? 0) + (summary?.partialCount ?? 0)} open payments</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-destructive">{formatCurrency(summary?.totalOverdue ?? 0)}</p><p className="text-xs text-muted-foreground">{summary?.overdueCount ?? 0} overdue payments</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Outstanding Payments</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {outstandingLoading ? <Loading label="Loading outstanding..." /> : null}
            {!outstandingLoading && outstanding.length === 0 ? <p className="text-sm text-muted-foreground">No outstanding payments.</p> : null}
            {outstanding.slice(0, 5).map((payment) => (
              <Link key={payment.uuid} to={paths.payments.details(payment.uuid)} className="block rounded-lg border p-4 hover:bg-muted/50">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{payment.customerName}</p>
                    <p className="text-sm text-muted-foreground">{payment.paymentNumber} — Due {payment.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <PaymentStatusBadge status={payment.status} />
                    <p className="mt-1 text-sm font-medium">{formatCurrency(payment.dueAmount)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Overdue Payments</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {overdueLoading ? <Loading label="Loading overdue..." /> : null}
            {!overdueLoading && overdue.length === 0 ? <p className="text-sm text-muted-foreground">No overdue payments.</p> : null}
            {overdue.slice(0, 5).map((payment) => (
              <Link key={payment.uuid} to={paths.payments.details(payment.uuid)} className="block rounded-lg border p-4 hover:bg-muted/50">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{payment.customerName}</p>
                    <p className="text-sm text-muted-foreground">{PAYMENT_TYPE_LABELS[payment.paymentType]} — Due {payment.dueDate}</p>
                  </div>
                  <p className="text-sm font-semibold text-destructive">{formatCurrency(payment.dueAmount)}</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
