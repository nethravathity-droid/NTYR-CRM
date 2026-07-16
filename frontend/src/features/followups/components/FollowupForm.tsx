import { useEffect, useMemo, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PhoneCall, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBox, type IconBoxTone } from "@/features/companies/components/IconBox";
import { useFollowupFormOptions } from "@/features/followups/hooks/useFollowups";
import { FOLLOWUP_PRIORITY_LABELS, FOLLOWUP_STATUS_LABELS, FOLLOWUP_TYPE_LABELS } from "@/features/followups/types/followup.types";
import { followupFormSchema, followupDefaultValues, type FollowupFormSchema } from "@/features/followups/schemas/followup.schema";

interface FollowupFormProps {
  mode: "create" | "edit";
  defaultValues?: FollowupFormSchema;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: FollowupFormSchema) => Promise<void> | void;
  onCancel?: () => void;
}

function FormSection({ icon, tone, title, description, children }: { icon: typeof PhoneCall; tone: IconBoxTone; title: string; description: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <IconBox icon={icon} tone={tone} />
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">{children}</CardContent>
    </Card>
  );
}

export function FollowupForm({ mode: _mode, defaultValues, submitLabel, isSubmitting = false, onSubmit, onCancel }: FollowupFormProps) {
  const { data: options, isLoading: isLoadingOptions } = useFollowupFormOptions();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FollowupFormSchema>({
    resolver: zodResolver(followupFormSchema),
    defaultValues: useMemo(() => defaultValues ?? followupDefaultValues, [defaultValues]),
  });

  const selectedLeadId = watch("leadId");

  useEffect(() => {
    if (!selectedLeadId || !options?.leads) {
      return;
    }

    const lead = options.leads.find((item) => item.id === selectedLeadId);
    if (lead) {
      setValue("customerName", lead.customerName, { shouldDirty: true });
    }
  }, [selectedLeadId, options?.leads, setValue]);

  if (isLoadingOptions) {
    return <div className="flex items-center justify-center py-16 text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Loading form options...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSection icon={UserRound} tone="indigo" title="Customer & Lead" description="Identify the lead and customer for this follow-up.">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="leadId">Lead</Label>
          <Select
            id="leadId"
            {...register("leadId", {
              setValueAs: (value) => (value === "" ? null : Number(value)),
            })}
          >
            <option value="">No linked lead</option>
            {options?.leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.leadNumber} — {lead.customerName}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="customerName">Customer Name *</Label>
          <Input id="customerName" {...register("customerName")} />
          {errors.customerName ? <p className="text-sm text-destructive">{errors.customerName.message}</p> : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="assignedUserId">Assigned Employee</Label>
          <Select
            id="assignedUserId"
            {...register("assignedUserId", {
              setValueAs: (value) => (value === "" ? null : Number(value)),
            })}
          >
            <option value="">Unassigned</option>
            {options?.assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>{assignee.displayName ?? assignee.employeeCode}</option>
            ))}
          </Select>
        </div>
      </FormSection>

      <FormSection icon={PhoneCall} tone="amber" title="Schedule & Type" description="Choose the date, time, and interaction type.">
        <div className="space-y-2">
          <Label htmlFor="followupDate">Follow-up Date *</Label>
          <Input id="followupDate" type="date" {...register("followupDate")} />
          {errors.followupDate ? <p className="text-sm text-destructive">{errors.followupDate.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="followupTime">Follow-up Time *</Label>
          <Input id="followupTime" type="time" {...register("followupTime")} />
          {errors.followupTime ? <p className="text-sm text-destructive">{errors.followupTime.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select id="type" {...register("type")}>
            {options?.types.map((type) => <option key={type} value={type}>{FOLLOWUP_TYPE_LABELS[type]}</option>)}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select id="priority" {...register("priority")}>
            {options?.priorities.map((priority) => <option key={priority} value={priority}>{FOLLOWUP_PRIORITY_LABELS[priority]}</option>)}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select id="status" {...register("status")}>
            {options?.statuses.map((status) => <option key={status} value={status}>{FOLLOWUP_STATUS_LABELS[status]}</option>)}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reminderBefore">Reminder Before</Label>
          <Select id="reminderBefore" {...register("reminderBefore", { valueAsNumber: true })}>
            {options?.reminderOptions.map((value) => <option key={value} value={value}>{value} minutes</option>)}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nextFollowupDate">Next Follow-up Date</Label>
          <Input id="nextFollowupDate" type="date" {...register("nextFollowupDate")} />
        </div>
      </FormSection>

      <Card>
        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
          <IconBox icon={Sparkles} tone="violet" />
          <div>
            <CardTitle>Notes</CardTitle>
            <CardDescription>Capture context and action items for this follow-up.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea rows={4} {...register("notes")} />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : submitLabel}</Button>
        {onCancel ? <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button> : null}
      </div>
    </form>
  );
}
