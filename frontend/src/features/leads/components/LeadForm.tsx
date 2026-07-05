import { useEffect, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Loader2,
  MapPin,
  Megaphone,
  Phone,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconBox, type IconBoxTone } from "@/features/companies/components/IconBox";
import {
  leadDefaultValues,
  leadFormSchema,
  type LeadFormSchema,
} from "@/features/leads/schemas/lead.schema";
import { useLeadFormOptions } from "@/features/leads/hooks/useLeads";
import { leadsService } from "@/features/leads/services/leads.service";
import {
  LEAD_PRIORITY_LABELS,
  LEAD_STATUS_LABELS,
} from "@/features/leads/types/lead.types";
import { cn } from "@/lib/utils";

interface LeadFormProps {
  mode: "create" | "edit";
  defaultValues?: LeadFormSchema;
  excludeUuid?: string;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: LeadFormSchema) => Promise<void> | void;
  onCancel?: () => void;
}

function FormSection({
  icon,
  tone,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  tone: IconBoxTone;
  title: string;
  description: string;
  children: ReactNode;
}) {
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

export function LeadForm({
  mode,
  defaultValues = leadDefaultValues,
  excludeUuid,
  submitLabel,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: LeadFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LeadFormSchema>({
    resolver: zodResolver(leadFormSchema) as Resolver<LeadFormSchema>,
    defaultValues,
  });

  const { data: options, isLoading: isLoadingOptions } = useLeadFormOptions();
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const mobile = watch("mobile");
  const email = watch("email");

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (!mobile || mobile.length < 10) {
        setDuplicateWarning(null);
        return;
      }

      try {
        const result = await leadsService.checkDuplicates({
          mobile,
          email: email?.trim() || undefined,
          excludeUuid,
        });

        if (result.mobileDuplicate) {
          setDuplicateWarning(
            `Duplicate mobile found: ${result.mobileDuplicate.leadNumber} (${result.mobileDuplicate.customerName})`,
          );
          return;
        }

        if (result.emailDuplicate) {
          setDuplicateWarning(
            `Duplicate email found: ${result.emailDuplicate.leadNumber} (${result.emailDuplicate.customerName})`,
          );
          return;
        }

        setDuplicateWarning(null);
      } catch {
        setDuplicateWarning(null);
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [mobile, email, excludeUuid]);

  if (isLoadingOptions) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading form options...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {duplicateWarning ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {duplicateWarning}
        </div>
      ) : null}

      <FormSection
        icon={UserRound}
        tone="indigo"
        title="Customer Details"
        description="Basic contact information for the lead."
      >
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="customerName">Customer Name *</Label>
          <Input id="customerName" {...register("customerName")} />
          {errors.customerName ? (
            <p className="text-sm text-destructive">{errors.customerName.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile Number *</Label>
          <Input id="mobile" {...register("mobile")} />
          {errors.mobile ? (
            <p className="text-sm text-destructive">{errors.mobile.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="alternateMobile">Alternate Number</Label>
          <Input id="alternateMobile" {...register("alternateMobile")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email ? (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} />
        </div>
      </FormSection>

      <FormSection
        icon={Building2}
        tone="emerald"
        title="Interest & Property"
        description="Project preferences and property details."
      >
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="projectInterested">Project Interested</Label>
          <Input id="projectInterested" {...register("projectInterested")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget">Budget</Label>
          <Input id="budget" type="number" min="0" step="1000" {...register("budget")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="propertyType">Property Type</Label>
          <Input
            id="propertyType"
            list="property-types"
            {...register("propertyType")}
          />
          <datalist id="property-types">
            {options?.propertyTypes.map((type) => (
              <option key={type} value={type} />
            ))}
          </datalist>
        </div>
      </FormSection>

      <FormSection
        icon={Megaphone}
        tone="violet"
        title="Source & Campaign"
        description="Track where this lead came from."
      >
        <div className="space-y-2">
          <Label htmlFor="leadSource">Lead Source</Label>
          <Input id="leadSource" list="lead-sources" {...register("leadSource")} />
          <datalist id="lead-sources">
            {options?.leadSources.map((source) => (
              <option key={source} value={source} />
            ))}
          </datalist>
        </div>

        <div className="space-y-2">
          <Label htmlFor="campaign">Campaign</Label>
          <Input id="campaign" {...register("campaign")} />
        </div>
      </FormSection>

      <FormSection
        icon={Phone}
        tone="amber"
        title="Assignment & Status"
        description="Assign the lead and set priority/status."
      >
        <div className="space-y-2">
          <Label htmlFor="assignedUserId">Assigned Employee</Label>
          <Select id="assignedUserId" {...register("assignedUserId")}>
            <option value="">Unassigned</option>
            {options?.assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.displayName ?? assignee.employeeCode}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select id="priority" {...register("priority")}>
            {options?.priorities.map((priority) => (
              <option key={priority} value={priority}>
                {LEAD_PRIORITY_LABELS[priority]}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select id="status" {...register("status")}>
            {options?.statuses.map((status) => (
              <option key={status} value={status}>
                {LEAD_STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        </div>
      </FormSection>

      <Card>
        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
          <IconBox icon={MapPin} tone="sky" />
          <div>
            <CardTitle>Notes</CardTitle>
            <CardDescription>Additional information about this lead.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea rows={4} {...register("notes")} />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>

      {mode === "create" ? (
        <p className={cn("text-xs text-muted-foreground")}>
          Lead number will be auto-generated after saving.
        </p>
      ) : null}
    </form>
  );
}
