import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookingStatusBadge } from "@/features/bookings/components/BookingStatusBadge";
import { formatCurrency, type BookingListItem } from "@/features/bookings/types/booking.types";
import { paths } from "@/routes/paths";

interface BookingCardProps {
  booking: BookingListItem;
  canUpdate?: boolean;
  canDelete?: boolean;
  onDelete?: (booking: BookingListItem) => void;
}

export function BookingCard({ booking, canUpdate, canDelete, onDelete }: BookingCardProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <BookingStatusBadge status={booking.status} />
            <span className="text-sm font-medium text-muted-foreground">{booking.bookingNumber}</span>
          </div>
          <div>
            <p className="font-semibold">{booking.customerName}</p>
            <p className="text-sm text-muted-foreground">{booking.project.projectName} — Unit {booking.unit.unitNumber}</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>{booking.bookingDate}</span>
            <span>{formatCurrency(booking.finalPrice)}</span>
            {booking.salesExecutive ? <span>{booking.salesExecutive.displayName ?? booking.salesExecutive.employeeCode}</span> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate(paths.bookings.details(booking.uuid))}>Details</Button>
          {canUpdate ? <Button variant="outline" onClick={() => navigate(paths.bookings.edit(booking.uuid))}>Edit</Button> : null}
          {canUpdate ? <Button variant="outline" onClick={() => navigate(paths.bookings.documents(booking.uuid))}>Documents</Button> : null}
          {canDelete && onDelete ? <Button variant="destructive" onClick={() => onDelete(booking)}>Delete</Button> : null}
        </div>
      </CardContent>
    </Card>
  );
}
