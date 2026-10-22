import { env } from "../../config/env.js";

export type SmsSendResult =
  | { outcome: "sent"; externalId?: string }
  | { outcome: "queued"; reason: string }
  | { outcome: "failed"; error: string };

function normalizeIndianMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return digits;
  return digits;
}

async function sendViaMsg91(mobile: string, message: string): Promise<SmsSendResult> {
  const authKey = env.MSG91_AUTH_KEY;
  const sender = env.MSG91_SENDER_ID;
  if (!authKey || !sender) {
    return { outcome: "queued", reason: "MSG91 not configured" };
  }

  const mobiles = normalizeIndianMobile(mobile);
  const params = new URLSearchParams({
    authkey: authKey,
    mobiles,
    message,
    sender,
    route: "4",
    country: "0",
  });

  const response = await fetch(`https://control.msg91.com/api/sendhttp.php?${params.toString()}`, {
    method: "GET",
  });
  const text = await response.text();

  if (!response.ok) {
    return { outcome: "failed", error: text || `MSG91 HTTP ${response.status}` };
  }

  if (text.toLowerCase().includes("error") || text.length < 4) {
    return { outcome: "failed", error: text };
  }

  return { outcome: "sent", externalId: text.trim() };
}

async function sendViaTwilio(mobile: string, message: string): Promise<SmsSendResult> {
  const accountSid = env.TWILIO_ACCOUNT_SID;
  const authToken = env.TWILIO_AUTH_TOKEN;
  const from = env.TWILIO_FROM_NUMBER;
  if (!accountSid || !authToken || !from) {
    return { outcome: "queued", reason: "Twilio not configured" };
  }

  const to = mobile.startsWith("+") ? mobile : `+${normalizeIndianMobile(mobile)}`;
  const body = new URLSearchParams({ To: to, From: from, Body: message });
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
  );

  const payload = (await response.json()) as { sid?: string; message?: string };
  if (!response.ok) {
    return { outcome: "failed", error: payload.message ?? `Twilio HTTP ${response.status}` };
  }

  return { outcome: "sent", externalId: payload.sid };
}

export async function sendTransactionalSms(mobile: string, message: string): Promise<SmsSendResult> {
  const provider = env.SMS_PROVIDER;
  if (provider === "msg91") {
    return sendViaMsg91(mobile, message);
  }
  if (provider === "twilio") {
    return sendViaTwilio(mobile, message);
  }
  return { outcome: "queued", reason: "SMS_PROVIDER is none" };
}
