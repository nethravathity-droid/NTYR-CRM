import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInvoiceFormOptions } from "@/features/invoices/hooks/useInvoices";
import {
  INVOICE_STATUS_LABELS,
  type InvoiceFormValues,
  type InvoiceStatus,
} from "@/features/invoices/types/invoice.types";

interface InvoiceFormProps {
  defaultValues: InvoiceFormValues;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: InvoiceFormValues) => Promise<void> | void;
  onCancel?: () => void;
}

export function InvoiceForm({ defaultValues, submitLabel, isSubmitting = false, onSubmit, onCancel }: InvoiceFormProps) {
  const { data: options } = useInvoiceFormOptions();
  const [values, setValues] = useState(defaultValues);

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

  const updateLineItem = (index: number, field: keyof InvoiceFormValues["lineItems"][0], raw: string) => {
    setValues((current) => {
      const lineItems = current.lineItems.map((item, idx) => {
        if (idx !== index) return item;
        const next = { ...item, [field]: raw };
        if (field === "quantity" || field === "rate") {
          const quantity = field === "quantity" ? Number(raw) : item.quantity;
          const rate = field === "rate" ? Number(raw) : item.rate;
          next.amount = Number.isFinite(quantity * rate) ? quantity * rate : 0;
        }
        return next;
      });
      const subtotal = lineItems.reduce((sum, item) => sum + (Number.isFinite(item.amount) ? item.amount : 0), 0);
      const taxAmount = (subtotal * current.taxRate) / 100;
      const total = Math.max(0, subtotal + taxAmount - current.discount);
      return { ...current, lineItems, subtotal, taxAmount, total };
    });
  };

  const addLineItem = () => {
    setValues((current) => ({
      ...current,
      lineItems: [...current.lineItems, { description: "", quantity: 1, rate: 0, amount: 0 }],
    }));
  };

  const removeLineItem = (index: number) => {
    setValues((current) => {
      const lineItems = current.lineItems.filter((_, idx) => idx !== index);
      const subtotal = lineItems.reduce((sum, item) => sum + (Number.isFinite(item.amount) ? item.amount : 0), 0);
      const taxAmount = (subtotal * current.taxRate) / 100;
      const total = Math.max(0, subtotal + taxAmount - current.discount);
      return { ...current, lineItems, subtotal, taxAmount, total };
    });
  };

  const handleTaxRateChange = (value: string) => {
    const taxRate = Number(value);
    const taxAmount = (values.subtotal * taxRate) / 100;
    const total = Math.max(0, values.subtotal + taxAmount - values.discount);
    setValues((current) => ({ ...current, taxRate, taxAmount, total }));
  };

  const handleDiscountChange = (value: string) => {
    const discount = Number(value);
    const total = Math.max(0, values.subtotal + values.taxAmount - discount);
    setValues((current) => ({ ...current, discount, total }));
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (!values.customerName) return;
        void onSubmit(values);
      }}
    >
      <Card>
        <CardHeader><CardTitle>Customer & Property</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Booking</Label>
            <Select value={values.bookingId ?? ""} onChange={(e) => setValues({ ...values, bookingId: e.target.value ? Number(e.target.value) : null })}>
              <option value="">Select booking</option>
              {options?.bookings.map((booking) => (
                <option key={booking.id} value={booking.id}>{booking.bookingNumber} — {booking.customerName}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2"><Label>Customer Name *</Label><Input value={values.customerName} onChange={(e) => setValues({ ...values, customerName: e.target.value })} required /></div>
          <div className="space-y-2"><Label>Customer Email</Label><Input type="email" value={values.customerEmail} onChange={(e) => setValues({ ...values, customerEmail: e.target.value })} /></div>
          <div className="space-y-2"><Label>Customer Phone</Label><Input value={values.customerPhone} onChange={(e) => setValues({ ...values, customerPhone: e.target.value })} /></div>
          <div className="space-y-2 md:col-span-2"><Label>Customer Address</Label><Textarea rows={2} value={values.customerAddress} onChange={(e) => setValues({ ...values, customerAddress: e.target.value })} /></div>
          <div className="space-y-2"><Label>Project</Label>
            <Select value={values.projectId ?? ""} onChange={(e) => setValues({ ...values, projectId: e.target.value ? Number(e.target.value) : null })}>
              <option value="">Select project</option>
              {options?.projects.map((project) => <option key={project.id} value={project.id}>{project.projectName} ({project.projectCode})</option>)}
            </Select>
          </div>
          <div className="space-y-2"><Label>Unit</Label>
            <Select value={values.unitId ?? ""} onChange={(e) => setValues({ ...values, unitId: e.target.value ? Number(e.target.value) : null })}>
              <option value="">Select unit</option>
              {options?.units.map((unit) => <option key={unit.id} value={unit.id}>{unit.unitNumber}</option>)}
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {values.lineItems.map((item, index) => (
            <div key={index} className="grid gap-4 md:grid-cols-12 md:items-end">
              <div className="space-y-2 md:col-span-4">
                <Label>Description *</Label>
                <Input value={item.description} onChange={(e) => updateLineItem(index, "description", e.target.value)} required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Qty</Label>
                <Input type="number" min={1} value={item.quantity} onChange={(e) => updateLineItem(index, "quantity", e.target.value)} required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Rate</Label>
                <Input type="number" min={0} step="0.01" value={item.rate} onChange={(e) => updateLineItem(index, "rate", e.target.value)} required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Amount</Label>
                <Input type="number" value={item.amount} readOnly />
              </div>
              <div className="md:col-span-2">
                <Button type="button" variant="outline" onClick={() => removeLineItem(index)} disabled={values.lineItems.length === 1}>Remove</Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={addLineItem}>Add Line Item</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Amounts & Dates</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Subtotal</Label><Input type="number" value={values.subtotal} readOnly /></div>
          <div className="space-y-2"><Label>Tax Rate (%)</Label><Input type="number" min={0} max={100} value={values.taxRate} onChange={(e) => handleTaxRateChange(e.target.value)} /></div>
          <div className="space-y-2"><Label>Tax Amount</Label><Input type="number" value={values.taxAmount} readOnly /></div>
          <div className="space-y-2"><Label>Discount</Label><Input type="number" min={0} value={values.discount} onChange={(e) => handleDiscountChange(e.target.value)} /></div>
          <div className="space-y-2"><Label>Total</Label><Input type="number" value={values.total} readOnly /></div>
          <div className="space-y-2"><Label>Due Date *</Label><Input type="date" value={values.dueDate} onChange={(e) => setValues({ ...values, dueDate: e.target.value })} required /></div>
          <div className="space-y-2"><Label>Status</Label>
            <Select value={values.status} onChange={(e) => setValues({ ...values, status: e.target.value as InvoiceStatus })}>
              {options?.statuses.map((status) => <option key={status} value={status}>{INVOICE_STATUS_LABELS[status]}</option>)}
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Additional Info</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-1">
          <div className="space-y-2"><Label>Notes</Label><Textarea rows={3} value={values.notes} onChange={(e) => setValues({ ...values, notes: e.target.value })} /></div>
          <div className="space-y-2"><Label>Terms & Conditions</Label><Textarea rows={3} value={values.terms} onChange={(e) => setValues({ ...values, terms: e.target.value })} /></div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : submitLabel}</Button>
        {onCancel ? <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button> : null}
      </div>
    </form>
  );
}
