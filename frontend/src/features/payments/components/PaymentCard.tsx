import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";
import { formatCurrency, PAYMENT_TYPE_LABELS, type PaymentListItem } from "@/features/payments/types/payment.types";
import { paths } from "@/routes/paths";

interface PaymentCardProps {
  payment: PaymentListItem;
  canUpdate?: boolean;
  canDelete?: boolean;
  onDelete?: (payment: PaymentListItem) => void;
}

export function PaymentCard({ payment, canUpdate, canDelete, onDelete }: PaymentCardProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <PaymentStatusBadge status={payment.status} />
            <span className="text-sm font-medium text-muted-foreground">{payment.paymentNumber}</span>
          </div>
          <div>
            <p className="font-semibold">{payment.customerName}</p>
            <p className="text-sm text-muted-foreground">{payment.booking.bookingNumber} — {PAYMENT_TYPE_LABELS[payment.paymentType]}</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>Due {payment.dueDate}</span>
            <span>{formatCurrency(payment.amount)}</span>
            {payment.dueAmount > 0 ? <span>Outstanding {formatCurrency(payment.dueAmount)}</span> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate(paths.payments.details(payment.uuid))}>Details</Button>
          {payment.hasReceipt ? <Button variant="outline" onClick={() => navigate(paths.payments.receipt(payment.uuid))}>Receipt</Button> : null}
          {canUpdate ? <Button variant="outline" onClick={() => navigate(paths.payments.edit(payment.uuid))}>Edit</Button> : null}
          {canDelete && onDelete ? <Button variant="destructive" onClick={() => onDelete(payment)}>Delete</Button> : null}
        </div>
      </CardContent>
    </Card>
  );
}
