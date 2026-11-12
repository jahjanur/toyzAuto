"use server";

import { z } from "zod";
import { db, inquiries, INQUIRY_TYPES } from "@/db";
import { en } from "@/i18n/dictionaries/en";
import { fr } from "@/i18n/dictionaries/fr";

const makeSchema = (t: typeof en) => z.object({
  type: z.enum(INQUIRY_TYPES).default("contact"),
  vehicleId: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(2, t.form.nameRequired).max(120),
  email: z.string().trim().email(t.form.emailInvalid),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(4000).optional().or(z.literal("")),
  website: z.string().max(0).optional(), // honeypot
});

export type InquiryState = { ok: boolean; error?: string; fieldErrors?: Record<string, string> } | null;

export async function submitInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  const raw = Object.fromEntries(formData.entries());
  const lang = raw.locale === "fr" ? "fr" : "en";
  const t = lang === "fr" ? fr : en;
  const parsed = makeSchema(t).safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { ok: false, error: t.form.checkFields, fieldErrors };
  }
  if (parsed.data.website) return { ok: true }; // bot
  const meta: Record<string, string> = { language: lang === "fr" ? "Français" : "English" };
  for (const [k, v] of Object.entries(raw)) {
    if (k.startsWith("meta_") && typeof v === "string" && v) meta[k.slice(5)] = v.slice(0, 500);
  }
  db.insert(inquiries)
    .values({
      type: parsed.data.type,
      vehicleId: parsed.data.vehicleId ?? null,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message || null,
      meta,
    })
    .run();
  return { ok: true };
}
