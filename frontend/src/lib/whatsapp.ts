const WHATSAPP_ENABLED = import.meta.env.VITE_WHATSAPP_ENABLED === "true";

export function isWhatsAppConfigured(): boolean {
  return WHATSAPP_ENABLED;
}

export function normalizePhoneNumber(mobile: string): string {
  return mobile.replace(/\D/g, "");
}

export function buildWhatsAppUrl(mobile: string, message?: string): string {
  const phone = normalizePhoneNumber(mobile);
  const base = `https://wa.me/${phone}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function openWhatsAppConversation(mobile: string, message?: string): boolean {
  if (!isWhatsAppConfigured()) return false;
  window.open(buildWhatsAppUrl(mobile, message), "_blank", "noopener,noreferrer");
  return true;
}
