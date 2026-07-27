import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CreditCard } from "lucide-react";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { BookingForm } from "@/features/bookings/components/BookingForm";
import { useBooking, useUpdateBooking } from "@/features/bookings/hooks/useBookings";
import type { BookingFormValues } from "@/features/bookings/types/booking.types";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function BookingEditPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { data: booking, isLoading } = useBooking(uuid ?? "");
  const updateBooking = useUpdateBooking(uuid ?? "");
  const [error, setError] = useState<string | null>(null);

  const defaultValues = useMemo<BookingFormValues | null>(() => {
    if (!booking) return null;
    return {
      leadId: booking.lead?.id ?? null,
      customerName: booking.customerName,
      projectId: booking.project.id,
      unitId: booking.unit.id,
      bookingDate: booking.bookingDate,
      bookingAmount: booking.bookingAmount,
      totalUnitPrice: booking.totalUnitPrice,
      discountAmount: booking.discountAmount,
      finalPrice: booking.finalPrice,
      paymentPlan: booking.paymentPlan ?? "",
      status: booking.status,
      telecallerUserId: booking.telecaller?.id ?? null,
      salesExecutiveUserId: booking.salesExecutive?.id ?? null,
      branchId: booking.branch?.id ?? null,
      notes: booking.notes ?? "",
    };
  }, [booking]);

  const handleSubmit = async (values: BookingFormValues) => {
    if (!uuid) return;
    setError(null);
    try {
      await updateBooking.mutateAsync(values);
      navigate(paths.bookings.details(uuid));
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  if (isLoading) return <Loading label="Loading booking..." />;

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={CreditCard}
        tone="amber"
        title="Edit Booking"
        description={booking ? `${booking.bookingNumber} — ${booking.customerName}` : "Update booking details"}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {defaultValues ? (
        <BookingForm
          defaultValues={defaultValues}
          selectedUnitId={defaultValues.unitId}
          submitLabel="Save Changes"
          isSubmitting={updateBooking.isPending}
          onSubmit={handleSubmit}
          onCancel={() => navigate(paths.bookings.details(uuid!))}
        />
      ) : null}
    </div>
  );
}
