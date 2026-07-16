import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard } from "lucide-react";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { BookingForm } from "@/features/bookings/components/BookingForm";
import { useCreateBooking } from "@/features/bookings/hooks/useBookings";
import { bookingDefaultValues, type BookingFormValues } from "@/features/bookings/types/booking.types";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function BookingCreatePage() {
  const navigate = useNavigate();
  const createBooking = useCreateBooking();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: BookingFormValues) => {
    setError(null);
    try {
      const booking = await createBooking.mutateAsync(values);
      navigate(paths.bookings.details(booking.uuid));
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <CompanyPageHeader icon={CreditCard} tone="amber" title="Create Booking" description="Register a new unit booking for a customer." />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <BookingForm
        defaultValues={bookingDefaultValues}
        submitLabel="Create Booking"
        isSubmitting={createBooking.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(paths.bookings.list)}
      />
    </div>
  );
}
