import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ListInvoicesParams, InvoiceFormValues } from "@/features/invoices/types/invoice.types";
import { invoicesService } from "@/features/invoices/services/invoices.service";

const invoiceKeys = {
  all: ["invoices"] as const,
  lists: () => [...invoiceKeys.all, "list"] as const,
  list: (params: ListInvoicesParams) => [...invoiceKeys.lists(), params] as const,
  details: () => [...invoiceKeys.all, "detail"] as const,
  detail: (uuid: string) => [...invoiceKeys.details(), uuid] as const,
  formOptions: () => [...invoiceKeys.all, "form-options"] as const,
};

export function useInvoices(params: ListInvoicesParams) {
  return useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: () => invoicesService.list(params),
  });
}

export function useInvoice(uuid: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(uuid),
    queryFn: () => invoicesService.getByUuid(uuid),
    enabled: Boolean(uuid),
  });
}

export function useInvoiceFormOptions() {
  return useQuery({
    queryKey: invoiceKeys.formOptions(),
    queryFn: () => invoicesService.getFormOptions(),
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: InvoiceFormValues) => invoicesService.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, values }: { uuid: string; values: InvoiceFormValues }) =>
      invoicesService.update(uuid, values),
    onSuccess: (_, { uuid }) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(uuid) });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => invoicesService.remove(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}
