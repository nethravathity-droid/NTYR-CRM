import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { BookingStatusBadge } from "@/features/bookings/components/BookingStatusBadge";
import { useApproveBooking, useBookings, useRejectBooking } from "@/features/bookings/hooks/useBookings";
import { formatCurrency, type BookingListItem } from "@/features/bookings/types/booking.types";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function BookingApprovalPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<BookingListItem | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const params = useMemo(
    () => ({ page: 1, limit: 50, status: "PENDING_APPROVAL" as const, sortBy: "booking_date" as const, sortOrder: "desc" as const }),
    [],
  );

  const { data, isLoading } = useBookings(params);
  const approveBooking = useApproveBooking();
  const rejectBooking = useRejectBooking();

  const openAction = (booking: BookingListItem, type: "approve" | "reject") => {
    setSelectedBooking(booking);
    setActionType(type);
    setNotes("");
    setActionError(null);
  };

  const handleConfirm = async () => {
    if (!selectedBooking || !actionType) return;
    setActionError(null);

    try {
      if (actionType === "approve") {
        await approveBooking.mutateAsync({ uuid: selectedBooking.uuid, notes: notes.trim() || null });
      } else {
        if (!notes.trim()) {
          setActionError("Rejection notes are required.");
          return;
        }
        await rejectBooking.mutateAsync({ uuid: selectedBooking.uuid, notes: notes.trim() });
      }
      setSelectedBooking(null);
      setActionType(null);
      setNotes("");
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={ShieldCheck}
        tone="amber"
        title="Booking Approvals"
        description="Review and approve pending booking requests."
        action={
          <Button variant="outline" asChild>
            <Link to={paths.bookings.list}>All Bookings</Link>
          </Button>
        }
      />

      {isLoading ? <Loading label="Loading pending approvals..." /> : null}

      <div className="space-y-4">
        {data?.bookings.map((booking) => (
          <Card key={booking.uuid}>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <BookingStatusBadge status={booking.status} />
                  <span className="text-sm text-muted-foreground">{booking.bookingNumber}</span>
                </div>
                <CardTitle>{booking.customerName}</CardTitle>
                <p className="text-sm text-muted-foreground">{booking.project.projectName} — Unit {booking.unit.unitNumber}</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">{formatCurrency(booking.finalPrice)}</p>
                <p className="text-muted-foreground">{booking.bookingDate}</p>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate(paths.bookings.details(booking.uuid))}>View Details</Button>
              <Button variant="outline" onClick={() => navigate(paths.bookings.documents(booking.uuid))}>Documents</Button>
              <Button onClick={() => openAction(booking, "approve")}>Approve</Button>
              <Button variant="destructive" onClick={() => openAction(booking, "reject")}>Reject</Button>
            </CardContent>
          </Card>
        ))}
        {!isLoading && data?.bookings.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No bookings pending approval.</CardContent></Card>
        ) : null}
      </div>

      <Dialog open={Boolean(selectedBooking && actionType)} onOpenChange={(open) => { if (!open) { setSelectedBooking(null); setActionType(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === "approve" ? "Approve booking" : "Reject booking"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{selectedBooking?.bookingNumber} — {selectedBooking?.customerName}</p>
            <div className="space-y-2">
              <Label>{actionType === "reject" ? "Rejection Notes *" : "Approval Notes"}</Label>
              <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedBooking(null); setActionType(null); }}>Cancel</Button>
            <Button
              variant={actionType === "reject" ? "destructive" : "default"}
              disabled={approveBooking.isPending || rejectBooking.isPending}
              onClick={handleConfirm}
            >
              {approveBooking.isPending || rejectBooking.isPending ? "Saving..." : actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
