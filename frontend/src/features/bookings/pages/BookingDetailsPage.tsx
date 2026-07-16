import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CreditCard, FileText, History, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { BookingStatusBadge } from "@/features/bookings/components/BookingStatusBadge";
import { DeleteBookingDialog } from "@/features/bookings/components/DeleteBookingDialog";
import { useBooking, useBookingAuditTrail, useCancelBooking, useDeleteBooking } from "@/features/bookings/hooks/useBookings";
import { formatCurrency } from "@/features/bookings/types/booking.types";
import { usePermissions } from "@/hooks/usePermissions";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function BookingDetailsPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission("bookings.update");
  const canDelete = hasPermission("bookings.delete");

  const { data: booking, isLoading } = useBooking(uuid ?? "");
  const { data: auditTrail = [] } = useBookingAuditTrail(uuid ?? "");
  const deleteBooking = useDeleteBooking();
  const cancelBooking = useCancelBooking();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!uuid) return;
    setActionError(null);
    try {
      await deleteBooking.mutateAsync(uuid);
      navigate(paths.bookings.list);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  const handleCancel = async () => {
    if (!uuid) return;
    setActionError(null);
    try {
      await cancelBooking.mutateAsync({ uuid });
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  if (isLoading) return <Loading label="Loading booking details..." />;
  if (!booking) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Booking not found.</p>
        <Button variant="outline" onClick={() => navigate(paths.bookings.list)}>Back to Bookings</Button>
      </div>
    );
  }

  const canCancel = canUpdate && !["CANCELLED", "COMPLETED"].includes(booking.status);

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={CreditCard}
        tone="amber"
        title={booking.customerName}
        description={`${booking.bookingNumber} — ${booking.project.projectName}, Unit ${booking.unit.unitNumber}`}
        action={
          <div className="flex flex-wrap gap-2">
            {canUpdate ? <Button variant="outline" onClick={() => navigate(paths.bookings.edit(booking.uuid))}><Pencil className="mr-2 h-4 w-4" />Edit</Button> : null}
            {canUpdate ? <Button variant="outline" onClick={() => navigate(paths.bookings.documents(booking.uuid))}><FileText className="mr-2 h-4 w-4" />Documents</Button> : null}
            {canCancel ? <Button variant="outline" onClick={handleCancel} disabled={cancelBooking.isPending}>Cancel Booking</Button> : null}
            {canDelete ? <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}><Trash2 className="mr-2 h-4 w-4" />Delete</Button> : null}
          </div>
        }
      />

      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Booking Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Status</span><BookingStatusBadge status={booking.status} /></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Booking Date</span><span>{booking.bookingDate}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Lead</span><span>{booking.lead ? `${booking.lead.leadNumber} — ${booking.lead.customerName}` : "—"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Branch</span><span>{booking.branch?.branchName ?? "—"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Telecaller</span><span>{booking.telecaller?.displayName ?? booking.telecaller?.employeeCode ?? "—"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Sales Executive</span><span>{booking.salesExecutive?.displayName ?? booking.salesExecutive?.employeeCode ?? "—"}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Total Unit Price</span><span>{formatCurrency(booking.totalUnitPrice)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Discount</span><span>{formatCurrency(booking.discountAmount)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Final Price</span><span className="font-semibold">{formatCurrency(booking.finalPrice)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Booking Amount</span><span>{formatCurrency(booking.bookingAmount)}</span></div>
            <div><p className="mb-1 text-muted-foreground">Payment Plan</p><p>{booking.paymentPlan ?? "Not specified."}</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
        <CardContent className="text-sm">{booking.notes ?? "No notes."}{booking.approvalNotes ? <p className="mt-3 text-muted-foreground">Approval notes: {booking.approvalNotes}</p> : null}</CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2"><History className="h-5 w-5" /><CardTitle>Activity Timeline</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {auditTrail.length === 0 ? <p className="text-sm text-muted-foreground">No activity recorded yet.</p> : null}
          {auditTrail.map((entry) => (
            <div key={entry.uuid} className="rounded-lg border p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium capitalize">{entry.action.replaceAll("_", " ").toLowerCase()}</span>
                <span className="text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-1 text-muted-foreground">{entry.performerName ?? "System"}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button variant="outline" asChild><Link to={paths.bookings.list}>Back to Bookings</Link></Button>

      <DeleteBookingDialog
        booking={booking}
        open={showDeleteDialog}
        isDeleting={deleteBooking.isPending}
        onConfirm={handleDelete}
        onOpenChange={setShowDeleteDialog}
      />
    </div>
  );
}
