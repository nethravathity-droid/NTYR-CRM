import { z } from "zod";

const leadPrioritySchema = z.enum(["COLD", "WARM", "HOT"]);

const leadStatusSchema = z.enum([
  "NEW",
  "ASSIGNED",
  "CONTACTED",
  "FOLLOW_UP",
  "VISIT_SCHEDULED",
  "VISITED",
  "NEGOTIATION",
  "BOOKED",
  "LOST",
]);

export const leadFormSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(1, "Customer name is required")
    .max(200, "Customer name is too long"),
  mobile: z
    .string()
    .trim()
    .min(10, "Mobile number must be at least 10 digits")
    .max(20, "Mobile number is too long"),
  alternateMobile: z.string().trim().max(20).optional(),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255)
    .optional()
    .or(z.literal("")),
  projectInterested: z.string().trim().max(200).optional(),
  budget: z.coerce.number().nonnegative().optional().or(z.literal("")),
  propertyType: z.string().trim().max(100).optional(),
  leadSource: z.string().trim().max(100).optional(),
  campaign: z.string().trim().max(150).optional(),
  city: z.string().trim().max(100).optional(),
  assignedUserId: z.coerce.number().int().positive().optional().or(z.literal("")),
  priority: leadPrioritySchema.default("WARM"),
  status: leadStatusSchema.default("NEW"),
  notes: z.string().trim().max(5000).optional(),
});

export type LeadFormSchema = z.infer<typeof leadFormSchema>;

export const leadDefaultValues: LeadFormSchema = {
  customerName: "",
  mobile: "",
  alternateMobile: "",
  email: "",
  projectInterested: "",
  budget: "",
  propertyType: "",
  leadSource: "",
  campaign: "",
  city: "",
  assignedUserId: "",
  priority: "WARM",
  status: "NEW",
  notes: "",
};

export function normalizeLeadPayload(values: LeadFormSchema) {
  return {
    customerName: values.customerName,
    mobile: values.mobile,
    alternateMobile: values.alternateMobile?.trim() || null,
    email: values.email?.trim() || null,
    projectInterested: values.projectInterested?.trim() || null,
    budget:
      values.budget === "" || values.budget === undefined
        ? null
        : Number(values.budget),
    propertyType: values.propertyType?.trim() || null,
    leadSource: values.leadSource?.trim() || null,
    campaign: values.campaign?.trim() || null,
    city: values.city?.trim() || null,
    assignedUserId:
      values.assignedUserId === "" || values.assignedUserId === undefined
        ? null
        : Number(values.assignedUserId),
    priority: values.priority,
    status: values.status,
    notes: values.notes?.trim() || null,
  };
}

export function leadDetailToFormValues(lead: {
  customerName: string;
  mobile: string;
  alternateMobile: string | null;
  email: string | null;
  projectInterested: string | null;
  budget: number | null;
  propertyType: string | null;
  leadSource: string | null;
  campaign: string | null;
  city: string | null;
  assignedEmployee: { id: number } | null;
  priority: LeadFormSchema["priority"];
  status: LeadFormSchema["status"];
  notes: string | null;
}): LeadFormSchema {
  return {
    customerName: lead.customerName,
    mobile: lead.mobile,
    alternateMobile: lead.alternateMobile ?? "",
    email: lead.email ?? "",
    projectInterested: lead.projectInterested ?? "",
    budget: lead.budget ?? "",
    propertyType: lead.propertyType ?? "",
    leadSource: lead.leadSource ?? "",
    campaign: lead.campaign ?? "",
    city: lead.city ?? "",
    assignedUserId: lead.assignedEmployee?.id ?? "",
    priority: lead.priority,
    status: lead.status,
    notes: lead.notes ?? "",
  };
}
