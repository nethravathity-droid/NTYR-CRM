import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBookingFormOptions } from "@/features/bookings/hooks/useBookings";
import { BOOKING_STATUS_LABELS, type BookingFormValues, type BookingStatus } from "@/features/bookings/types/booking.types";
import { paths } from "@/routes/paths";

const BOOKABLE_UNIT_STATUSES = new Set(["AVAILABLE", "HOLD"]);

function sameId(left: number | null | undefined, right: number | string | null | undefined) {
  if (left == null || right == null || right === "") {
    return false;
  }
  return Number(left) === Number(right);
}

interface BookingFormProps {
  defaultValues: BookingFormValues;
  submitLabel: string;
  isSubmitting?: boolean;
  selectedUnitId?: number | null;
  onSubmit: (values: BookingFormValues) => Promise<void> | void;
  onCancel?: () => void;
}

export function BookingForm({
  defaultValues,
  submitLabel,
  isSubmitting = false,
  selectedUnitId = null,
  onSubmit,
  onCancel,
}: BookingFormProps) {
  const { data: options, isLoading: isLoadingOptions } = useBookingFormOptions();
  const [values, setValues] = useState(defaultValues);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const units = useMemo(
    () =>
      options?.units.filter(
        (unit) =>
          sameId(selectedUnitId, unit.id) ||
          (sameId(values.projectId, unit.projectId) &&
            BOOKABLE_UNIT_STATUSES.has(unit.availability)),
      ) ?? [],
    [options?.units, selectedUnitId, values.projectId],
  );

  useEffect(() => {
    if (!values.leadId || !options?.leads) return;
    const lead = options.leads.find((item) => item.id === values.leadId);
    if (lead) {
      setValues((current) => ({ ...current, customerName: lead.customerName }));
    }
  }, [values.leadId, options?.leads]);

  useEffect(() => {
    if (!values.unitId || !options?.units) return;
    const unit = options.units.find((item) => sameId(values.unitId, item.id));
    if (unit?.price != null) {
      const totalUnitPrice = Number(unit.price);
      const finalPrice = Math.max(totalUnitPrice - values.discountAmount, 0);
      setValues((current) => ({ ...current, totalUnitPrice, finalPrice }));
    }
  }, [values.unitId, options?.units, values.discountAmount]);

  useEffect(() => {
    const finalPrice = Math.max(values.totalUnitPrice - values.discountAmount, 0);
    setValues((current) => (current.finalPrice === finalPrice ? current : { ...current, finalPrice }));
  }, [values.totalUnitPrice, values.discountAmount]);

  return (
    <form className="space-y-6" onSubmit={(event) => {
      event.preventDefault();
      setSubmitError(null);

      if (!values.projectId) {
        setSubmitError("Select a project before creating the booking.");
        return;
      }

      if (!values.unitId) {
        setSubmitError("Select a unit for this booking.");
        return;
      }

      void onSubmit(values);
    }}>
      {submitError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {submitError}
        </div>
      ) : null}

      {isLoadingOptions ? (
        <div className="text-sm text-muted-foreground">Loading projects and units...</div>
      ) : null}
      <Card>
        <CardHeader><CardTitle>Customer & Lead</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Lead</Label>
            <Select value={values.leadId ?? ""} onChange={(e) => setValues({ ...values, leadId: e.target.value ? Number(e.target.value) : null })}>
              <option value="">No linked lead</option>
              {options?.leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.leadNumber} — {lead.customerName}</option>)}
            </Select>
          </div>
          <div className="space-y-2"><Label>Customer *</Label><Input value={values.customerName} onChange={(e) => setValues({ ...values, customerName: e.target.value })} required /></div>
          <div className="space-y-2"><Label>Booking Date *</Label><Input type="date" value={values.bookingDate} onChange={(e) => setValues({ ...values, bookingDate: e.target.value })} required /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Property</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Project *</Label>
            <Select value={values.projectId ?? ""} onChange={(e) => setValues({ ...values, projectId: e.target.value ? Number(e.target.value) : null, unitId: null })} required>
              <option value="">Select project</option>
              {options?.projects.map((project) => <option key={project.id} value={project.id}>{project.projectName}</option>)}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Unit *</Label>
            <Select
              value={values.unitId ?? ""}
              onChange={(e) =>
                setValues({
                  ...values,
                  unitId: e.target.value ? Number(e.target.value) : null,
                })
              }
              required
              disabled={!values.projectId || isLoadingOptions}
            >
              <option value="">
                {!values.projectId
                  ? "Select project first"
                  : units.length
                    ? "Select unit"
                    : "No available units"}
              </option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.unitNumber} ({unit.availability})
                </option>
              ))}
            </Select>
            {values.projectId && !isLoadingOptions && units.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No available units for this project. Add units in{" "}
                <Link to={paths.projects.inventory} className="font-medium text-primary hover:underline">
                  Projects → Inventory
                </Link>
                .
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Total Unit Price *</Label><Input type="number" min={0} step="0.01" value={values.totalUnitPrice} onChange={(e) => setValues({ ...values, totalUnitPrice: Number(e.target.value) })} required /></div>
          <div className="space-y-2"><Label>Discount Amount</Label><Input type="number" min={0} step="0.01" value={values.discountAmount} onChange={(e) => setValues({ ...values, discountAmount: Number(e.target.value) })} /></div>
          <div className="space-y-2"><Label>Final Price *</Label><Input type="number" min={0} step="0.01" value={values.finalPrice} readOnly /></div>
          <div className="space-y-2"><Label>Booking Amount *</Label><Input type="number" min={0} step="0.01" value={values.bookingAmount} onChange={(e) => setValues({ ...values, bookingAmount: Number(e.target.value) })} required /></div>
          <div className="space-y-2 md:col-span-2"><Label>Payment Plan</Label><Textarea rows={3} value={values.paymentPlan} onChange={(e) => setValues({ ...values, paymentPlan: e.target.value })} placeholder="Describe installment milestones..." /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Assignment</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Telecaller</Label><Select value={values.telecallerUserId ?? ""} onChange={(e) => setValues({ ...values, telecallerUserId: e.target.value ? Number(e.target.value) : null })}><option value="">Unassigned</option>{options?.users.map((user) => <option key={user.id} value={user.id}>{user.displayName ?? user.employeeCode}</option>)}</Select></div>
          <div className="space-y-2"><Label>Sales Executive</Label><Select value={values.salesExecutiveUserId ?? ""} onChange={(e) => setValues({ ...values, salesExecutiveUserId: e.target.value ? Number(e.target.value) : null })}><option value="">Unassigned</option>{options?.users.map((user) => <option key={user.id} value={user.id}>{user.displayName ?? user.employeeCode}</option>)}</Select></div>
          <div className="space-y-2"><Label>Branch</Label><Select value={values.branchId ?? ""} onChange={(e) => setValues({ ...values, branchId: e.target.value ? Number(e.target.value) : null })}><option value="">Select branch</option>{options?.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.branchName}</option>)}</Select></div>
          <div className="space-y-2"><Label>Status</Label><Select value={values.status} onChange={(e) => setValues({ ...values, status: e.target.value as BookingStatus })}>{options?.statuses.map((status) => <option key={status} value={status}>{BOOKING_STATUS_LABELS[status]}</option>)}</Select></div>
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
