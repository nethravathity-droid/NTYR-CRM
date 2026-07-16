import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Banknote, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Loading } from "@/components/shared/Loading";
import { CompanyPageHeader } from "@/features/companies/components/CompanyPageHeader";
import { DeletePaymentDialog } from "@/features/payments/components/DeletePaymentDialog";
import { PaymentCard } from "@/features/payments/components/PaymentCard";
import { useDeletePayment, usePaymentFormOptions, usePayments } from "@/features/payments/hooks/usePayments";
import {
  PAYMENT_MODE_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  type PaymentListItem,
  type PaymentMode,
  type PaymentStatus,
  type PaymentType,
} from "@/features/payments/types/payment.types";
import { usePermissions } from "@/hooks/usePermissions";
import { getApiErrorMessage } from "@/lib/api/client";
import { paths } from "@/routes/paths";

export function PaymentsListPage() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("payments.create");
  const canUpdate = hasPermission("payments.update");
  const canDelete = hasPermission("payments.delete");

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PaymentStatus | "">("");
  const [paymentType, setPaymentType] = useState<PaymentType | "">("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode | "">("");
  const [projectId, setProjectId] = useState<number | "">("");
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentListItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: formOptions } = usePaymentFormOptions();

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
      paymentType: paymentType || undefined,
      paymentMode: paymentMode || undefined,
      projectId: projectId || undefined,
      sortBy: "due_date" as const,
      sortOrder: "asc" as const,
    }),
    [page, search, status, paymentType, paymentMode, projectId],
  );

  const { data, isLoading } = usePayments(params);
  const deletePayment = useDeletePayment();

  const handleDelete = async () => {
    if (!paymentToDelete) return;
    setActionError(null);
    try {
      await deletePayment.mutateAsync(paymentToDelete.uuid);
      setPaymentToDelete(null);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        icon={Banknote}
        tone="emerald"
        title="Payments"
        description="Manage booking payments, receipts, and collection status."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild><Link to={paths.payments.dashboard}>Dashboard</Link></Button>
            <Button variant="outline" asChild><Link to={paths.payments.schedule}>Schedule</Link></Button>
            {canCreate ? <Button onClick={() => navigate(paths.payments.create)}><Plus className="mr-2 h-4 w-4" />Add Payment</Button> : null}
          </div>
        }
      />

      <Card>
        <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          <Input placeholder="Search payments..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          <Select value={status} onChange={(e) => { setStatus(e.target.value as PaymentStatus | ""); setPage(1); }}>
            <option value="">All statuses</option>
            {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
          <Select value={paymentType} onChange={(e) => { setPaymentType(e.target.value as PaymentType | ""); setPage(1); }}>
            <option value="">All types</option>
            {Object.entries(PAYMENT_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
          <Select value={paymentMode} onChange={(e) => { setPaymentMode(e.target.value as PaymentMode | ""); setPage(1); }}>
            <option value="">All modes</option>
            {Object.entries(PAYMENT_MODE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
          <Select value={projectId} onChange={(e) => { setProjectId(e.target.value ? Number(e.target.value) : ""); setPage(1); }}>
            <option value="">All projects</option>
            {formOptions?.projects.map((project) => <option key={project.id} value={project.id}>{project.projectName}</option>)}
          </Select>
        </CardContent>
      </Card>

      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
      {isLoading ? <Loading label="Loading payments..." /> : null}

      <div className="space-y-4">
        {data?.payments.map((payment) => (
          <PaymentCard key={payment.uuid} payment={payment} canUpdate={canUpdate} canDelete={canDelete} onDelete={setPaymentToDelete} />
        ))}
        {!isLoading && data?.payments.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No payments found.</CardContent></Card>
        ) : null}
      </div>

      {data && data.pagination.totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm text-muted-foreground">Page {data.pagination.page} of {data.pagination.totalPages}</span>
          <Button variant="outline" size="icon" disabled={page >= data.pagination.totalPages} onClick={() => setPage((current) => current + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      ) : null}

      <DeletePaymentDialog
        payment={paymentToDelete}
        open={Boolean(paymentToDelete)}
        isDeleting={deletePayment.isPending}
        onConfirm={handleDelete}
        onOpenChange={(open) => { if (!open) setPaymentToDelete(null); }}
      />
    </div>
  );
}
