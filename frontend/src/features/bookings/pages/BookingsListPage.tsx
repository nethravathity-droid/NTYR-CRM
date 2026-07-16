import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, CreditCard, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { BookingCard } from "@/features/bookings/components/BookingCard";
import { DeleteBookingDialog } from "@/features/bookings/components/DeleteBookingDialog";
import { useBookingFormOptions, useBookings, useDeleteBooking } from "@/features/bookings/hooks/useBookings";
import { BOOKING_STATUS_LABELS, type BookingListItem, type BookingStatus } from "@/features/bookings/types/booking.types";
import { usePermissions } from "@/hooks/usePermissions";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function BookingsListPage() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("bookings.create");
  const canUpdate = hasPermission("bookings.update");
  const canDelete = hasPermission("bookings.delete");

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [projectId, setProjectId] = useState<number | "">("");
  const [bookingToDelete, setBookingToDelete] = useState<BookingListItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: formOptions } = useBookingFormOptions();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const params = useMemo(
    () => ({
      page,
      limit: 10,
      search: search || undefined,
      status: status || undefined,
      projectId: projectId || undefined,
      sortBy: "booking_date" as const,
      sortOrder: "desc" as const,
    }),
    [page, search, status, projectId],
  );

  const { data, isLoading } = useBookings(params);
  const deleteBooking = useDeleteBooking();

  const handleDelete = async () => {
    if (!bookingToDelete) return;
    setActionError(null);
    try {
      await deleteBooking.mutateAsync(bookingToDelete.uuid);
      setBookingToDelete(null);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={CreditCard}
        tone="amber"
        title="Bookings"
        description="Manage unit bookings, pricing, and approval workflow."
        action={
          <div className="flex flex-wrap gap-2">
            {canUpdate ? (
              <Button variant="outline" asChild>
                <Link to={paths.bookings.approvals}>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Approvals
                </Link>
              </Button>
            ) : null}
            {canCreate ? (
              <Button onClick={() => navigate(paths.bookings.create)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Booking
              </Button>
            ) : null}
          </div>
        }
      />

      <Card>
        <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <Input placeholder="Search bookings..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          <Select value={status} onChange={(e) => { setStatus(e.target.value as BookingStatus | ""); setPage(1); }}>
            <option value="">All statuses</option>
            {Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
          <Select value={projectId} onChange={(e) => { setProjectId(e.target.value ? Number(e.target.value) : ""); setPage(1); }}>
            <option value="">All projects</option>
            {formOptions?.projects.map((project) => (
              <option key={project.id} value={project.id}>{project.projectName}</option>
            ))}
          </Select>
        </CardContent>
      </Card>

      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
      {isLoading ? <Loading label="Loading bookings..." /> : null}

      <div className="space-y-4">
        {data?.bookings.map((booking) => (
          <BookingCard
            key={booking.uuid}
            booking={booking}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onDelete={setBookingToDelete}
          />
        ))}
        {!isLoading && data?.bookings.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No bookings found.</CardContent></Card>
        ) : null}
      </div>

      {data && data.pagination.totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {data.pagination.page} of {data.pagination.totalPages}</span>
          <Button variant="outline" size="icon" disabled={page >= data.pagination.totalPages} onClick={() => setPage((current) => current + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      <DeleteBookingDialog
        booking={bookingToDelete}
        open={Boolean(bookingToDelete)}
        isDeleting={deleteBooking.isPending}
        onConfirm={handleDelete}
        onOpenChange={(open) => { if (!open) setBookingToDelete(null); }}
      />
    </div>
  );
}
