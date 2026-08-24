const WHATSAPP_ENABLED = import.meta.env.VITE_WHATSAPP_ENABLED !== "false";
const DEFAULT_COUNTRY_CODE =
  import.meta.env.VITE_WHATSAPP_DEFAULT_COUNTRY_CODE?.replace(/\D/g, "") || "91";

export type WhatsAppTemplateId =
  | "greeting"
  | "followup"
  | "site_visit"
  | "booking"
  | "payment_reminder"
  | "project_info";

export interface WhatsAppMessageContext {
  customerName: string;
  companyName?: string;
  agentName?: string;
  projectName?: string;
  visitDate?: string;
  visitTime?: string;
  amount?: string;
  bookingNumber?: string;
}

export interface WhatsAppTemplateOption {
  id: WhatsAppTemplateId;
  label: string;
  description: string;
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplateOption[] = [
  {
    id: "greeting",
    label: "Introduction",
    description: "First contact greeting",
  },
  {
    id: "followup",
    label: "Follow-up",
    description: "Check in on lead interest",
  },
  {
    id: "site_visit",
    label: "Site visit",
    description: "Confirm or invite for site visit",
  },
  {
    id: "project_info",
    label: "Project details",
    description: "Share project information",
  },
  {
    id: "booking",
    label: "Booking update",
    description: "Booking confirmation message",
  },
  {
    id: "payment_reminder",
    label: "Payment reminder",
    description: "Payment due reminder",
  },
];

export function isWhatsAppConfigured(): boolean {
  return WHATSAPP_ENABLED;
}

export function normalizePhoneNumber(
  mobile: string,
  countryCode: string = DEFAULT_COUNTRY_CODE,
): string {
  const digits = mobile.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.length === 10) {
    return `${countryCode}${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return `${countryCode}${digits.slice(1)}`;
  }

  return digits;
}

export function isValidWhatsAppNumber(mobile: string): boolean {
  const normalized = normalizePhoneNumber(mobile);
  return normalized.length >= 10 && normalized.length <= 15;
}

export function buildWhatsAppMessage(
  templateId: WhatsAppTemplateId,
  context: WhatsAppMessageContext,
): string {
  const name = context.customerName.trim() || "there";
  const company = context.companyName?.trim() || "our team";
  const agent = context.agentName?.trim();
  const signOff = agent ? `\n\n— ${agent}, ${company}` : `\n\n— ${company}`;

  switch (templateId) {
    case "greeting":
      return `Hi ${name}, thank you for your interest in our properties. This is ${agent ?? company}. How can I help you today?${signOff}`;
    case "followup":
      return `Hi ${name}, I wanted to follow up regarding your property enquiry. Are you available for a quick call or chat?${signOff}`;
    case "site_visit":
      return `Hi ${name}, we'd like to schedule your site visit${context.projectName ? ` at ${context.projectName}` : ""}${context.visitDate ? ` on ${context.visitDate}` : ""}${context.visitTime ? ` at ${context.visitTime}` : ""}. Please confirm a convenient time.${signOff}`;
    case "project_info":
      return `Hi ${name}, sharing details about${context.projectName ? ` ${context.projectName}` : " our project"}. Please let me know if you'd like pricing, floor plans, or a site visit.${signOff}`;
    case "booking":
      return `Hi ${name}, your booking${context.bookingNumber ? ` (${context.bookingNumber})` : ""} has been recorded with ${company}. Please reach out if you need any assistance.${signOff}`;
    case "payment_reminder":
      return `Hi ${name}, this is a friendly reminder${context.amount ? ` for payment of ${context.amount}` : " regarding your pending payment"}. Please let us know once completed or if you need help.${signOff}`;
    default:
      return `Hi ${name},${signOff}`;
  }
}

export function buildWhatsAppUrl(mobile: string, message?: string): string {
  const phone = normalizePhoneNumber(mobile);
  if (!phone) return "";
  const base = `https://wa.me/${phone}`;
  if (!message?.trim()) return base;
  return `${base}?text=${encodeURIComponent(message.trim())}`;
}

export function openWhatsAppConversation(mobile: string, message?: string): boolean {
  if (!isWhatsAppConfigured() || !isValidWhatsAppNumber(mobile)) {
    return false;
  }

  const url = buildWhatsAppUrl(mobile, message);
  if (!url) return false;

  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

export function openWhatsAppWeb(): void {
  window.open("https://web.whatsapp.com", "_blank", "noopener,noreferrer");
}
