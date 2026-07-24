import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  KeyRound,
  Loader2,
  MapPin,
  Phone,
  Receipt,
  Settings2,
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
  companyCreateDefaultValues,
  companyCreateFormSchema,
  companyDefaultValues,
  companyFormSchema,
  type CompanyCreateFormSchema,
  type CompanyFormSchema,
} from "@/features/companies/schemas/company.schema";
import { companyStatusOptions } from "@/features/companies/components/CompanyStatusBadge";
import { cn } from "@/lib/utils";

interface CompanyFormProps {
  defaultValues?: CompanyFormSchema;
  submitLabel: string;
  isSubmitting?: boolean;
  disableCode?: boolean;
  includeInitialAdmin?: boolean;
  onSubmit: (values: CompanyFormSchema | CompanyCreateFormSchema) => Promise<void> | void;
  onCancel?: () => void;
}

export function CompanyForm({
  defaultValues = companyDefaultValues,
  submitLabel,
  isSubmitting = false,
  disableCode = false,
  includeInitialAdmin = false,
  onSubmit,
  onCancel,
}: CompanyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyCreateFormSchema>({
    resolver: zodResolver(includeInitialAdmin ? companyCreateFormSchema : companyFormSchema),
    defaultValues: includeInitialAdmin
      ? { ...companyCreateDefaultValues, ...defaultValues }
      : defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSection
        icon={Building2}
        tone="indigo"
        title="Basic Information"
        description="Company identity and primary contact owner details."
      >
        <FormField label="Company Code" error={errors.companyCode?.message}>
          <Input
            {...register("companyCode")}
            placeholder="NAMMABLR"
            disabled={disableCode}
          />
          {includeInitialAdmin ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Used at login (e.g. NAMMABLR). Letters, numbers, hyphens only — no spaces.
            </p>
          ) : null}
        </FormField>

        <FormField label="Company Name" error={errors.companyName?.message}>
          <Input {...register("companyName")} placeholder="Acme Realty" />
        </FormField>

        <FormField label="Legal Name" error={errors.legalName?.message}>
          <Input {...register("legalName")} placeholder="Acme Realty Pvt Ltd" />
        </FormField>

        <FormField label="Owner Name" error={errors.ownerName?.message}>
          <Input {...register("ownerName")} placeholder="John Doe" />
        </FormField>
      </FormSection>

      <FormSection
        icon={Receipt}
        tone="amber"
        title="Tax & Compliance"
        description="GST, PAN, and RERA registration details."
        columns="grid-cols-1 md:grid-cols-3"
      >
        <FormField label="GST Number" error={errors.gstNumber?.message}>
          <Input {...register("gstNumber")} placeholder="22AAAAA0000A1Z5" />
        </FormField>

        <FormField label="PAN Number" error={errors.panNumber?.message}>
          <Input {...register("panNumber")} placeholder="ABCDE1234F" />
        </FormField>

        <FormField label="RERA Number" error={errors.reraNumber?.message}>
          <Input {...register("reraNumber")} placeholder="RERA/XX/2024/001" />
        </FormField>
      </FormSection>

      <FormSection
        icon={Phone}
        tone="emerald"
        title="Contact Details"
        description="Primary communication channels."
      >
        <FormField label="Email" error={errors.email?.message}>
          <Input {...register("email")} type="email" placeholder="info@company.com" />
        </FormField>

        <FormField label="Phone" error={errors.phone?.message}>
          <Input {...register("phone")} placeholder="+91 9876543210" />
        </FormField>

        <FormField label="Alternate Phone" error={errors.alternatePhone?.message}>
          <Input {...register("alternatePhone")} placeholder="+91 9876543211" />
        </FormField>

        <FormField label="Website" error={errors.website?.message}>
          <Input {...register("website")} placeholder="https://company.com" />
        </FormField>
      </FormSection>

      <FormSection
        icon={MapPin}
        tone="rose"
        title="Address"
        description="Registered business address."
      >
        <FormField
          label="Address Line 1"
          error={errors.addressLine1?.message}
          className="md:col-span-2"
        >
          <Input {...register("addressLine1")} placeholder="Street address" />
        </FormField>

        <FormField
          label="Address Line 2"
          error={errors.addressLine2?.message}
          className="md:col-span-2"
        >
          <Input {...register("addressLine2")} placeholder="Suite, floor, etc." />
        </FormField>

        <FormField label="City" error={errors.city?.message}>
          <Input {...register("city")} placeholder="Mumbai" />
        </FormField>

        <FormField label="State" error={errors.state?.message}>
          <Input {...register("state")} placeholder="Maharashtra" />
        </FormField>

        <FormField label="Country" error={errors.country?.message}>
          <Input {...register("country")} placeholder="India" />
        </FormField>

        <FormField label="Postal Code" error={errors.postalCode?.message}>
          <Input {...register("postalCode")} placeholder="400001" />
        </FormField>
      </FormSection>

      <FormSection
        icon={Settings2}
        tone="violet"
        title="Settings"
        description="Regional preferences, status, and trial period."
      >
        <FormField label="Timezone" error={errors.timezone?.message}>
          <Input {...register("timezone")} placeholder="Asia/Kolkata" />
        </FormField>

        <FormField label="Currency" error={errors.currency?.message}>
          <Input {...register("currency")} placeholder="INR" />
        </FormField>

        <FormField label="Status" error={errors.status?.message}>
          <Select {...register("status")}>
            {companyStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>

        <div />

        <FormField label="Trial Start Date" error={errors.trialStartDate?.message}>
          <Input {...register("trialStartDate")} type="date" />
        </FormField>

        <FormField label="Trial End Date" error={errors.trialEndDate?.message}>
          <Input {...register("trialEndDate")} type="date" />
        </FormField>

        <FormField
          label="Notes"
          error={errors.notes?.message}
          className="md:col-span-2"
        >
          <Textarea
            {...register("notes")}
            placeholder="Internal notes about this company..."
            rows={4}
          />
        </FormField>
      </FormSection>

      {includeInitialAdmin ? (
        <FormSection
          icon={KeyRound}
          tone="violet"
          title="First company admin login"
          description="Tenant owner uses company code + username + password on the login page."
          columns="grid-cols-1 md:grid-cols-3"
        >
          <FormField label="Username" error={errors.adminUsername?.message}>
            <Input {...register("adminUsername")} placeholder="admin" autoComplete="off" />
          </FormField>
          <FormField label="Password" error={errors.adminPassword?.message}>
            <Input
              {...register("adminPassword")}
              type="password"
              autoComplete="new-password"
              placeholder="Min. 8 characters"
            />
          </FormField>
          <FormField label="Employee code" error={errors.adminEmployeeCode?.message}>
            <Input {...register("adminEmployeeCode")} placeholder="ADM001" />
          </FormField>
        </FormSection>
      ) : null}

      <div className="flex flex-col-reverse gap-3 rounded-xl border bg-muted/20 p-4 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}

function FormSection({
  icon,
  tone,
  title,
  description,
  columns = "grid-cols-1 md:grid-cols-2",
  children,
}: {
  icon: LucideIcon;
  tone: IconBoxTone;
  title: string;
  description: string;
  columns?: string;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-border/60">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex items-start gap-3">
          <IconBox icon={icon} tone={tone} />
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn("grid gap-4 pt-6", columns)}>{children}</CardContent>
    </Card>
  );
}

function FormField({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-2 block">{label}</Label>
      {children}
      {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
