import { Badge } from "@/components/ui/badge";
import { PAYMENT_STATUS_LABELS, type PaymentStatus } from "@/features/payments/types/payment.types";

const STATUS_VARIANT: Record<PaymentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  PAID: "outline",
  PARTIAL: "default",
  FAILED: "destructive",
  REFUNDED: "destructive",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={STATUS_VARIANT[status] ?? "secondary"}>{PAYMENT_STATUS_LABELS[status]}</Badge>;
}
