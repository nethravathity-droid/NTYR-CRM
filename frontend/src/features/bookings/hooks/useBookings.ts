import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingsService } from "@/features/bookings/services/bookings.service";
import type { BookingDocumentType, BookingFormValues, ListBookingsParams } from "@/features/bookings/types/booking.types";

export const bookingKeys = {
  all: ["bookings"] as const,
  lists: () => [...bookingKeys.all, "list"] as const,
  list: (params: ListBookingsParams) => [...bookingKeys.lists(), params] as const,
  details: () => [...bookingKeys.all, "detail"] as const,
  detail: (uuid: string) => [...bookingKeys.details(), uuid] as const,
  audit: (uuid: string) => [...bookingKeys.all, "audit", uuid] as const,
  formOptions: () => [...bookingKeys.all, "form-options"] as const,
};

export function useBookings(params: ListBookingsParams) {
  return useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: () => bookingsService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useBooking(uuid: string) {
  return useQuery({
    queryKey: bookingKeys.detail(uuid),
    queryFn: () => bookingsService.getByUuid(uuid),
    enabled: Boolean(uuid),
  });
}

export function useBookingAuditTrail(uuid: string) {
  return useQuery({
    queryKey: bookingKeys.audit(uuid),
    queryFn: () => bookingsService.getAuditTrail(uuid),
    enabled: Boolean(uuid),
  });
}

export function useBookingFormOptions() {
  return useQuery({
    queryKey: bookingKeys.formOptions(),
    queryFn: () => bookingsService.getFormOptions(),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: BookingFormValues) => bookingsService.create(values),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: bookingKeys.all }),
  });
}

export function useUpdateBooking(uuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: BookingFormValues) => bookingsService.update(uuid, values),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: bookingKeys.all }),
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => bookingsService.remove(uuid),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: bookingKeys.all }),
  });
}

export function useApproveBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, notes }: { uuid: string; notes?: string | null }) => bookingsService.approve(uuid, notes),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: bookingKeys.all }),
  });
}

export function useRejectBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, notes }: { uuid: string; notes: string }) => bookingsService.reject(uuid, notes),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: bookingKeys.all }),
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, notes }: { uuid: string; notes?: string | null }) => bookingsService.cancel(uuid, notes),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: bookingKeys.all }),
  });
}

export function useUploadBookingDocument(uuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentType, file }: { documentType: BookingDocumentType; file: File }) =>
      bookingsService.uploadDocument(uuid, documentType, file),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: bookingKeys.detail(uuid) }),
  });
}
