import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentsService } from "@/features/payments/services/payments.service";
import type { ListPaymentsParams, PaymentFormValues } from "@/features/payments/types/payment.types";

export const paymentKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentKeys.all, "list"] as const,
  list: (params: ListPaymentsParams) => [...paymentKeys.lists(), params] as const,
  details: () => [...paymentKeys.all, "detail"] as const,
  detail: (uuid: string) => [...paymentKeys.details(), uuid] as const,
  audit: (uuid: string) => [...paymentKeys.all, "audit", uuid] as const,
  formOptions: () => [...paymentKeys.all, "form-options"] as const,
  summary: () => [...paymentKeys.all, "summary"] as const,
  outstanding: () => [...paymentKeys.all, "outstanding"] as const,
  overdue: () => [...paymentKeys.all, "overdue"] as const,
  schedule: (params: Record<string, unknown>) => [...paymentKeys.all, "schedule", params] as const,
};

export function usePayments(params: ListPaymentsParams) {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => paymentsService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function usePayment(uuid: string) {
  return useQuery({
    queryKey: paymentKeys.detail(uuid),
    queryFn: () => paymentsService.getByUuid(uuid),
    enabled: Boolean(uuid),
  });
}

export function usePaymentAuditTrail(uuid: string) {
  return useQuery({
    queryKey: paymentKeys.audit(uuid),
    queryFn: () => paymentsService.getAuditTrail(uuid),
    enabled: Boolean(uuid),
  });
}

export function usePaymentFormOptions() {
  return useQuery({
    queryKey: paymentKeys.formOptions(),
    queryFn: () => paymentsService.getFormOptions(),
  });
}

export function useCollectionSummary() {
  return useQuery({
    queryKey: paymentKeys.summary(),
    queryFn: () => paymentsService.getCollectionSummary(),
  });
}

export function useOutstandingPayments() {
  return useQuery({
    queryKey: paymentKeys.outstanding(),
    queryFn: () => paymentsService.getOutstanding(),
  });
}

export function useOverduePayments() {
  return useQuery({
    queryKey: paymentKeys.overdue(),
    queryFn: () => paymentsService.getOverdue(),
  });
}

export function usePaymentSchedule(params: { fromDate?: string; toDate?: string; bookingId?: number; projectId?: number } = {}) {
  return useQuery({
    queryKey: paymentKeys.schedule(params),
    queryFn: () => paymentsService.getSchedule(params),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ values, receipt }: { values: PaymentFormValues; receipt?: File | null }) =>
      paymentsService.create(values, receipt),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: paymentKeys.all }),
  });
}

export function useUpdatePayment(uuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ values, receipt }: { values: PaymentFormValues; receipt?: File | null }) =>
      paymentsService.update(uuid, values, receipt),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: paymentKeys.all }),
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => paymentsService.remove(uuid),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: paymentKeys.all }),
  });
}

export function useUploadPaymentReceipt(uuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => paymentsService.uploadReceipt(uuid, file),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: paymentKeys.all }),
  });
}
