import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { BookingListItem } from "@/features/bookings/types/booking.types";

interface DeleteBookingDialogProps {
  booking: BookingListItem | null;
  open: boolean;
  isDeleting?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export function DeleteBookingDialog({ booking, open, isDeleting = false, onConfirm, onOpenChange }: DeleteBookingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete booking</DialogTitle>
          <DialogDescription>
            This will soft-delete booking {booking?.bookingNumber} for {booking?.customerName}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" disabled={isDeleting} onClick={onConfirm}>
            {isDeleting ? "Deleting..." : "Delete Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
