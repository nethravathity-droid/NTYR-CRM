import { useEffect, useState } from "react";
import { PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCallFormOptions } from "@/features/calls/hooks/useCalls";
import {
  buildTelLink,
  CALL_DIRECTION_LABELS,
  CALL_STATUS_LABELS,
  type CallDirection,
  type CallFormValues,
  type CallStatus,
} from "@/features/calls/types/call.types";

interface CallFormProps {
  defaultValues: CallFormValues;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: CallFormValues) => Promise<void> | void;
  onCancel?: () => void;
}

export function CallForm({ defaultValues, submitLabel, isSubmitting = false, onSubmit, onCancel }: CallFormProps) {
  const { data: options } = useCallFormOptions();
  const [values, setValues] = useState(defaultValues);

  useEffect(() => {
    if (!values.leadId || !options?.leads) return;
    const lead = options.leads.find((item) => item.id === values.leadId);
    if (lead) {
      setValues((current) => ({
        ...current,
        customerName: lead.customerName,
        mobile: lead.mobile ?? current.mobile,
      }));
    }
  }, [values.leadId, options?.leads]);

  return (
    <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); void onSubmit(values); }}>
      <Card>
        <CardHeader><CardTitle>Customer & Lead</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Lead</Label>
            <Select value={values.leadId ?? ""} onChange={(e) => setValues({ ...values, leadId: e.target.value ? Number(e.target.value) : null })}>
              <option value="">No linked lead</option>
              {options?.leads.map((lead) => (
                <option key={lead.id} value={lead.id}>{lead.leadNumber} — {lead.customerName}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Customer Name *</Label>
            <Input value={values.customerName} onChange={(e) => setValues({ ...values, customerName: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Mobile *</Label>
            <div className="flex gap-2">
              <Input value={values.mobile} onChange={(e) => setValues({ ...values, mobile: e.target.value })} required />
              {values.mobile ? (
                <Button type="button" variant="outline" asChild>
                  <a href={buildTelLink(values.mobile)}><PhoneCall className="h-4 w-4" /></a>
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Call Details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Direction *</Label>
            <Select value={values.direction} onChange={(e) => setValues({ ...values, direction: e.target.value as CallDirection })}>
              {options?.directions.map((direction) => (
                <option key={direction} value={direction}>{CALL_DIRECTION_LABELS[direction]}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status *</Label>
            <Select value={values.callStatus} onChange={(e) => setValues({ ...values, callStatus: e.target.value as CallStatus })}>
              {options?.callStatuses.map((status) => (
                <option key={status} value={status}>{CALL_STATUS_LABELS[status]}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Call Date *</Label>
            <Input type="date" value={values.callDate} onChange={(e) => setValues({ ...values, callDate: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Call Time *</Label>
            <Input type="time" value={values.callTime} onChange={(e) => setValues({ ...values, callTime: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Duration (seconds)</Label>
            <Input type="number" min={0} value={values.durationSeconds} onChange={(e) => setValues({ ...values, durationSeconds: Number(e.target.value) || 0 })} />
          </div>
          <div className="space-y-2">
            <Label>Assigned Executive</Label>
            <Select value={values.assignedUserId ?? ""} onChange={(e) => setValues({ ...values, assignedUserId: e.target.value ? Number(e.target.value) : null })}>
              <option value="">Unassigned</option>
              {options?.assignees.map((assignee) => (
                <option key={assignee.id} value={assignee.id}>{assignee.displayName ?? assignee.employeeCode}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Call Notes</Label>
            <Textarea rows={4} value={values.notes} onChange={(e) => setValues({ ...values, notes: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Follow-up</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Auto-create Follow-up</Label>
            <Select value={values.autoCreateFollowup ? "yes" : "no"} onChange={(e) => setValues({ ...values, autoCreateFollowup: e.target.value === "yes" })}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Select>
          </div>
          {values.autoCreateFollowup ? (
            <>
              <div className="space-y-2">
                <Label>Next Follow-up Date *</Label>
                <Input type="date" value={values.nextFollowupDate} onChange={(e) => setValues({ ...values, nextFollowupDate: e.target.value })} required={values.autoCreateFollowup} />
              </div>
              <div className="space-y-2">
                <Label>Next Follow-up Time *</Label>
                <Input type="time" value={values.nextFollowupTime} onChange={(e) => setValues({ ...values, nextFollowupTime: e.target.value })} required={values.autoCreateFollowup} />
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : submitLabel}</Button>
        {onCancel ? <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button> : null}
      </div>
    </form>
  );
}
