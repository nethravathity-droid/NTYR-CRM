import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVisitFormOptions } from "@/features/visits/hooks/useVisits";
import { VISIT_STATUS_LABELS, type VisitFormValues, type VisitStatus } from "@/features/visits/types/visit.types";

interface VisitFormProps {
  defaultValues: VisitFormValues;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: VisitFormValues) => Promise<void> | void;
  onCancel?: () => void;
}

export function VisitForm({ defaultValues, submitLabel, isSubmitting = false, onSubmit, onCancel }: VisitFormProps) {
  const { data: options } = useVisitFormOptions();
  const [values, setValues] = useState(defaultValues);

  const units = useMemo(
    () => options?.units.filter((unit) => unit.projectId === values.projectId) ?? [],
    [options?.units, values.projectId],
  );

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
          <div className="space-y-2 md:col-span-2"><Label>Lead</Label><Select value={values.leadId ?? ""} onChange={(e) => setValues({ ...values, leadId: e.target.value ? Number(e.target.value) : null })}><option value="">No linked lead</option>{options?.leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.leadNumber} — {lead.customerName}</option>)}</Select></div>
          <div className="space-y-2"><Label>Customer Name *</Label><Input value={values.customerName} onChange={(e) => setValues({ ...values, customerName: e.target.value })} required /></div>
          <div className="space-y-2"><Label>Mobile *</Label><Input value={values.mobile} onChange={(e) => setValues({ ...values, mobile: e.target.value })} required /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Visit Schedule</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Project</Label><Select value={values.projectId ?? ""} onChange={(e) => setValues({ ...values, projectId: e.target.value ? Number(e.target.value) : null, unitId: null })}><option value="">Select project</option>{options?.projects.map((project) => <option key={project.id} value={project.id}>{project.projectName}</option>)}</Select></div>
          <div className="space-y-2"><Label>Unit (Optional)</Label><Select value={values.unitId ?? ""} onChange={(e) => setValues({ ...values, unitId: e.target.value ? Number(e.target.value) : null })}><option value="">No unit</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.unitNumber}</option>)}</Select></div>
          <div className="space-y-2"><Label>Visit Date *</Label><Input type="date" value={values.visitDate} onChange={(e) => setValues({ ...values, visitDate: e.target.value })} required /></div>
          <div className="space-y-2"><Label>Visit Time *</Label><Input type="time" value={values.visitTime} onChange={(e) => setValues({ ...values, visitTime: e.target.value })} required /></div>
          <div className="space-y-2"><Label>Assigned Executive</Label><Select value={values.assignedUserId ?? ""} onChange={(e) => setValues({ ...values, assignedUserId: e.target.value ? Number(e.target.value) : null })}><option value="">Unassigned</option>{options?.assignees.map((assignee) => <option key={assignee.id} value={assignee.id}>{assignee.displayName ?? assignee.employeeCode}</option>)}</Select></div>
          <div className="space-y-2"><Label>Status</Label><Select value={values.status} onChange={(e) => setValues({ ...values, status: e.target.value as VisitStatus })}>{options?.statuses.map((status) => <option key={status} value={status}>{VISIT_STATUS_LABELS[status]}</option>)}</Select></div>
          <div className="space-y-2"><Label>Transportation Required</Label><Select value={values.transportationRequired ? "yes" : "no"} onChange={(e) => setValues({ ...values, transportationRequired: e.target.value === "yes" })}><option value="no">No</option><option value="yes">Yes</option></Select></div>
          <div className="space-y-2"><Label>Pickup Location</Label><Input value={values.pickupLocation} onChange={(e) => setValues({ ...values, pickupLocation: e.target.value })} /></div>
          <div className="space-y-2"><Label>Rating (1-5)</Label><Input type="number" min={1} max={5} value={values.rating ?? ""} onChange={(e) => setValues({ ...values, rating: e.target.value ? Number(e.target.value) : null })} /></div>
          <div className="space-y-2 md:col-span-2"><Label>Next Action</Label><Input value={values.nextAction} onChange={(e) => setValues({ ...values, nextAction: e.target.value })} /></div>
          <div className="space-y-2 md:col-span-2"><Label>Feedback</Label><Textarea rows={3} value={values.feedback} onChange={(e) => setValues({ ...values, feedback: e.target.value })} /></div>
          <div className="space-y-2 md:col-span-2"><Label>Notes</Label><Textarea rows={3} value={values.notes} onChange={(e) => setValues({ ...values, notes: e.target.value })} /></div>
        </CardContent>
      </Card>

      <div className="flex gap-3"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : submitLabel}</Button>{onCancel ? <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button> : null}</div>
    </form>
  );
}
