import { z } from "zod";

export const followupFormSchema = z.object({
  leadId: z.number().int().positive().nullable(),
  customerName: z.string().trim().min(1, "Customer name is required").max(200),
  assignedUserId: z.number().int().positive().nullable(),
  followupDate: z.string().min(1, "Follow-up date is required"),
  followupTime: z.string().min(1, "Follow-up time is required"),
  type: z.enum(["CALL", "WHATSAPP", "EMAIL", "MEETING", "SITE_VISIT"]),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  status: z.enum(["PENDING", "COMPLETED", "MISSED", "RESCHEDULED"]),
  notes: z.string(),
  reminderBefore: z.union([z.literal(5), z.literal(15), z.literal(30), z.literal(60)]),
  nextFollowupDate: z.string(),
});

export type FollowupFormSchema = z.infer<typeof followupFormSchema>;

export const followupDefaultValues: FollowupFormSchema = {
  leadId: null,
  customerName: "",
  assignedUserId: null,
  followupDate: new Date().toISOString().slice(0, 10),
  followupTime: "10:00",
  type: "CALL",
  priority: "MEDIUM",
  status: "PENDING",
  notes: "",
  reminderBefore: 30,
  nextFollowupDate: "",
};
