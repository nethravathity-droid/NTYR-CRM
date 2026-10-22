import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/types";
import type {
  CreateInvoiceInput,
  InvoiceDetail,
  InvoiceFormOptions,
  ListInvoicesParams,
  PaginatedInvoices,
  UpdateInvoiceInput,
} from "@/features/invoices/types/invoice.types";

export async function listInvoices(params: ListInvoicesParams): Promise<PaginatedInvoices> {
  const response = await apiClient.get<ApiResponse<PaginatedInvoices>>("/invoices", { params });
  return response.data.data;
}

export async function getInvoiceByUuid(uuid: string): Promise<InvoiceDetail> {
  const response = await apiClient.get<ApiResponse<{ invoice: InvoiceDetail }>>(`/invoices/${uuid}`);
  return response.data.data.invoice;
}

export async function getInvoiceFormOptions(): Promise<InvoiceFormOptions> {
  const response = await apiClient.get<ApiResponse<InvoiceFormOptions>>("/invoices/form-options");
  return response.data.data;
}

export async function createInvoice(values: CreateInvoiceInput): Promise<InvoiceDetail> {
  const response = await apiClient.post<ApiResponse<{ invoice: InvoiceDetail }>>("/invoices", values);
  return response.data.data.invoice;
}

export async function updateInvoice(uuid: string, values: UpdateInvoiceInput): Promise<InvoiceDetail> {
  const response = await apiClient.put<ApiResponse<{ invoice: InvoiceDetail }>>(`/invoices/${uuid}`, values);
  return response.data.data.invoice;
}

export async function deleteInvoice(uuid: string): Promise<void> {
  await apiClient.delete(`/invoices/${uuid}`);
}

export const invoicesService = {
  list: listInvoices,
  getByUuid: getInvoiceByUuid,
  getFormOptions: getInvoiceFormOptions,
  create: createInvoice,
  update: updateInvoice,
  remove: deleteInvoice,
};
