import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePaymentFormOptions } from "@/features/payments/hooks/usePayments";
import {
  PAYMENT_MODE_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  type PaymentFormValues,
  type PaymentMode,
  type PaymentStatus,
  type PaymentType,
} from "@/features/payments/types/payment.types";

interface PaymentFormProps {
  defaultValues: PaymentFormValues;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: PaymentFormValues, receipt?: File | null) => Promise<void> | void;
  onCancel?: () => void;
}

export function PaymentForm({ defaultValues, submitLabel, isSubmitting = false, onSubmit, onCancel }: PaymentFormProps) {
  const { data: options } = usePaymentFormOptions();
  const [values, setValues] = useState(defaultValues);
  const [receipt, setReceipt] = useState<File | null>(null);

  useEffect(() => {
    if (!values.bookingId || !options?.bookings) return;
    const booking = options.bookings.find((item) => item.id === values.bookingId);
    if (booking) {
      setValues((current) => ({
        ...current,
        customerName: booking.customerName,
        projectId: booking.projectId,
        unitId: booking.unitId,
      }));
    }
  }, [values.bookingId, options?.bookings]);

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (!values.bookingId || !values.projectId || !values.unitId) return;
        void onSubmit(values, receipt);
      }}
    >
      <Card>
        <CardHeader><CardTitle>Booking & Customer</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Booking *</Label>
            <Select value={values.bookingId ?? ""} onChange={(e) => setValues({ ...values, bookingId: e.target.value ? Number(e.target.value) : null })} required>
              <option value="">Select booking</option>
              {options?.bookings.map((booking) => (
                <option key={booking.id} value={booking.id}>{booking.bookingNumber} — {booking.customerName}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2"><Label>Customer *</Label><Input value={values.customerName} onChange={(e) => setValues({ ...values, customerName: e.target.value })} required /></div>
          <div className="space-y-2"><Label>Payment Type *</Label><Select value={values.paymentType} onChange={(e) => setValues({ ...values, paymentType: e.target.value as PaymentType })}>{options?.paymentTypes.map((type) => <option key={type} value={type}>{PAYMENT_TYPE_LABELS[type]}</option>)}</Select></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Amount & Schedule</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Amount *</Label><Input type="number" min={0} step="0.01" value={values.amount} onChange={(e) => setValues({ ...values, amount: Number(e.target.value) })} required /></div>
          <div className="space-y-2"><Label>Due Amount *</Label><Input type="number" min={0} step="0.01" value={values.dueAmount} onChange={(e) => setValues({ ...values, dueAmount: Number(e.target.value) })} required /></div>
          <div className="space-y-2"><Label>Due Date *</Label><Input type="date" value={values.dueDate} onChange={(e) => setValues({ ...values, dueDate: e.target.value })} required /></div>
          <div className="space-y-2"><Label>Payment Date</Label><Input type="date" value={values.paymentDate} onChange={(e) => setValues({ ...values, paymentDate: e.target.value })} /></div>
          <div className="space-y-2"><Label>Status</Label><Select value={values.status} onChange={(e) => setValues({ ...values, status: e.target.value as PaymentStatus })}>{options?.statuses.map((status) => <option key={status} value={status}>{PAYMENT_STATUS_LABELS[status]}</option>)}</Select></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Payment Mode</Label><Select value={values.paymentMode} onChange={(e) => setValues({ ...values, paymentMode: e.target.value as PaymentMode | "" })}><option value="">Select mode</option>{options?.paymentModes.map((mode) => <option key={mode} value={mode}>{PAYMENT_MODE_LABELS[mode]}</option>)}</Select></div>
          <div className="space-y-2"><Label>Transaction Reference</Label><Input value={values.transactionReference} onChange={(e) => setValues({ ...values, transactionReference: e.target.value })} /></div>
          <div className="space-y-2"><Label>Bank Name</Label><Input value={values.bankName} onChange={(e) => setValues({ ...values, bankName: e.target.value })} /></div>
          <div className="space-y-2"><Label>Receipt Number</Label><Input value={values.receiptNumber} onChange={(e) => setValues({ ...values, receiptNumber: e.target.value })} /></div>
          <div className="space-y-2 md:col-span-2"><Label>Attach Receipt</Label><Input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(e) => setReceipt(e.target.files?.[0] ?? null)} /></div>
          <div className="space-y-2 md:col-span-2"><Label>Notes</Label><Textarea rows={3} value={values.notes} onChange={(e) => setValues({ ...values, notes: e.target.value })} /></div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : submitLabel}</Button>
        {onCancel ? <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button> : null}
      </div>
    </form>
  );
}
