import { Badge } from "@/components/ui/badge";
import { BOOKING_STATUS_LABELS, type BookingStatus } from "@/features/bookings/types/booking.types";

const STATUS_VARIANT: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary",
  PENDING_APPROVAL: "default",
  APPROVED: "outline",
  REJECTED: "destructive",
  CANCELLED: "destructive",
  COMPLETED: "outline",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <Badge variant={STATUS_VARIANT[status] ?? "secondary"}>{BOOKING_STATUS_LABELS[status]}</Badge>;
}
