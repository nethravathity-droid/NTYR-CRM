import { z } from "zod";

const optionalString = z.string().trim().optional().or(z.literal(""));

export const companyFormSchema = z.object({
  companyCode: z
    .string()
    .trim()
    .min(2, "Company code must be at least 2 characters")
    .max(50)
    .regex(
      /^[A-Za-z0-9_-]+$/,
      "Only letters, numbers, hyphens, and underscores allowed",
    ),
  companyName: z.string().trim().min(2, "Company name is required").max(200),
  legalName: optionalString,
  ownerName: z.string().trim().min(2, "Owner name is required").max(150),
  gstNumber: optionalString,
  panNumber: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value),
      "Invalid PAN format",
    ),
  reraNumber: optionalString,
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().min(10, "Phone number is required").max(20),
  alternatePhone: optionalString,
  website: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || /^https?:\/\/.+/.test(value),
      "Enter a valid URL",
    ),
  addressLine1: z.string().trim().min(3, "Address is required").max(255),
  addressLine2: optionalString,
  city: z.string().trim().min(2, "City is required").max(100),
  state: z.string().trim().min(2, "State is required").max(100),
  country: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().min(3, "Postal code is required").max(20),
  logoUrl: optionalString,
  faviconUrl: optionalString,
  timezone: z.string().trim().min(1).max(50),
  currency: z.string().trim().min(1).max(10),
  status: z.enum(["TRIAL", "ACTIVE", "SUSPENDED", "EXPIRED"]),
  trialStartDate: optionalString,
  trialEndDate: optionalString,
  notes: optionalString,
});

export type CompanyFormSchema = z.infer<typeof companyFormSchema>;

export const companyDefaultValues: CompanyFormSchema = {
  companyCode: "",
  companyName: "",
  legalName: "",
  ownerName: "",
  gstNumber: "",
  panNumber: "",
  reraNumber: "",
  email: "",
  phone: "",
  alternatePhone: "",
  website: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",
  logoUrl: "",
  faviconUrl: "",
  timezone: "Asia/Kolkata",
  currency: "INR",
  status: "TRIAL",
  trialStartDate: "",
  trialEndDate: "",
  notes: "",
};

export function mapCompanyToFormValues(
  company: import("../types/company.types").CompanyDetail,
): CompanyFormSchema {
  return {
    companyCode: company.companyCode,
    companyName: company.companyName,
    legalName: company.legalName ?? "",
    ownerName: company.ownerName,
    gstNumber: company.gstNumber ?? "",
    panNumber: company.panNumber ?? "",
    reraNumber: company.reraNumber ?? "",
    email: company.email,
    phone: company.phone,
    alternatePhone: company.alternatePhone ?? "",
    website: company.website ?? "",
    addressLine1: company.addressLine1,
    addressLine2: company.addressLine2 ?? "",
    city: company.city,
    state: company.state,
    country: company.country,
    postalCode: company.postalCode,
    logoUrl: company.logoUrl ?? "",
    faviconUrl: company.faviconUrl ?? "",
    timezone: company.timezone,
    currency: company.currency,
    status: company.status,
    trialStartDate: company.trialStartDate ?? "",
    trialEndDate: company.trialEndDate ?? "",
    notes: company.notes ?? "",
  };
}

export function normalizeCompanyPayload(values: CompanyFormSchema) {
  const emptyToNull = (value?: string) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  };

  return {
    companyCode: values.companyCode.trim(),
    companyName: values.companyName.trim(),
    legalName: emptyToNull(values.legalName),
    ownerName: values.ownerName.trim(),
    gstNumber: emptyToNull(values.gstNumber),
    panNumber: emptyToNull(values.panNumber),
    reraNumber: emptyToNull(values.reraNumber),
    email: values.email.trim(),
    phone: values.phone.trim(),
    alternatePhone: emptyToNull(values.alternatePhone),
    website: emptyToNull(values.website),
    addressLine1: values.addressLine1.trim(),
    addressLine2: emptyToNull(values.addressLine2),
    city: values.city.trim(),
    state: values.state.trim(),
    country: values.country.trim(),
    postalCode: values.postalCode.trim(),
    logoUrl: emptyToNull(values.logoUrl),
    faviconUrl: emptyToNull(values.faviconUrl),
    timezone: values.timezone.trim(),
    currency: values.currency.trim(),
    status: values.status,
    trialStartDate: emptyToNull(values.trialStartDate),
    trialEndDate: emptyToNull(values.trialEndDate),
    notes: emptyToNull(values.notes),
  };
}
