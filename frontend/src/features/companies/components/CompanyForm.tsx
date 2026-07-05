import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import {
  companyDefaultValues,
  companyFormSchema,
  type CompanyFormSchema,
} from "@/features/companies/schemas/company.schema";
import { companyStatusOptions } from "@/features/companies/components/CompanyStatusBadge";

interface CompanyFormProps {
  defaultValues?: CompanyFormSchema;
  submitLabel: string;
  isSubmitting?: boolean;
  disableCode?: boolean;
  onSubmit: (values: CompanyFormSchema) => Promise<void> | void;
  onCancel?: () => void;
}

export function CompanyForm({
  defaultValues = companyDefaultValues,
  submitLabel,
  isSubmitting = false,
  disableCode = false,
  onSubmit,
  onCancel,
}: CompanyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyFormSchema>({
    resolver: zodResolver(companyFormSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Company identity and primary contact owner details.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormField label="Company Code" error={errors.companyCode?.message}>
            <Input
              {...register("companyCode")}
              placeholder="DEMO"
              disabled={disableCode}
            />
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax & Compliance</CardTitle>
          <CardDescription>GST, PAN, and RERA registration details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <FormField label="GST Number" error={errors.gstNumber?.message}>
            <Input {...register("gstNumber")} placeholder="22AAAAA0000A1Z5" />
          </FormField>

          <FormField label="PAN Number" error={errors.panNumber?.message}>
            <Input {...register("panNumber")} placeholder="ABCDE1234F" />
          </FormField>

          <FormField label="RERA Number" error={errors.reraNumber?.message}>
            <Input {...register("reraNumber")} placeholder="RERA/XX/2024/001" />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
          <CardDescription>Primary communication channels.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
          <CardDescription>Registered business address.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Regional preferences, status, and trial period.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
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
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
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
