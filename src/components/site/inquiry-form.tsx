"use client";

import { useActionState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Loader2, Send } from "lucide-react";
import { submitInquiry, type InquiryState } from "@/lib/public-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/config";

export function InquiryForm({ type = "contact", vehicleId, vehicleTitle, defaultMessage, compact, meta, submitLabel, className }: {
  type?: "vehicle" | "contact" | "test_drive" | "sell" | "service" | "wheels";
  vehicleId?: number; vehicleTitle?: string; defaultMessage?: string; compact?: boolean; meta?: Record<string, string>; submitLabel?: string; className?: string;
}) {
  const { t, locale } = useI18n();
  const [state, action, pending] = useActionState<InquiryState, FormData>(submitInquiry, null);
  const fe = state && !state.ok ? state.fieldErrors ?? {} : {};

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        {state?.ok ? (
          <motion.div key="ok" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-4 rounded-[20px] border border-accent/30 bg-accent/5 px-6 py-12 text-center">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }} className="grid size-14 place-items-center rounded-full bg-accent text-white"><Check className="size-6" /></motion.span>
            <h3 className="display text-2xl">{t.form.thanks.replace(/\.$/, "")}<span className="text-accent">.</span></h3>
            <p className="max-w-sm text-sm text-muted">{vehicleTitle ? fmt(t.form.receivedAbout, { title: vehicleTitle }) : ""}{t.form.followUp}</p>
          </motion.div>
        ) : (
          <motion.form key="form" action={action} initial={false} className="grid gap-4">
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="locale" value={locale} />
            {vehicleId && <input type="hidden" name="vehicleId" value={vehicleId} />}
            {meta && Object.entries(meta).map(([k, v]) => <input key={k} type="hidden" name={`meta_${k}`} value={v} />)}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            <div className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
              <Field label={t.form.fullName} name="name" error={fe.name} placeholder={t.form.namePlaceholder} autoComplete="name" required />
              <Field label={t.form.email} name="email" type="email" error={fe.email} placeholder={t.form.emailPlaceholder} autoComplete="email" required />
            </div>
            <Field label={t.form.phone} name="phone" type="tel" error={fe.phone} placeholder="+1 514 000 0000" autoComplete="tel" />
            <div>
              <label className="label" htmlFor={`msg-${type}`}>{t.form.message}</label>
              <textarea id={`msg-${type}`} name="message" rows={compact ? 3 : 5} defaultValue={defaultMessage} placeholder={t.form.messagePlaceholder} className="input resize-y" />
            </div>
            {state && !state.ok && state.error && <p className="text-sm text-danger">{state.error}</p>}
            <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {pending ? t.form.sending : submitLabel ?? t.vehicle.sendInquiry}
            </Button>
            <p className="text-[11px] text-muted-2">{t.form.privacy}</p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, name, error, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; error?: string }) {
  return (
    <div>
      <label className="label" htmlFor={`f-${name}`}>{label}</label>
      <input id={`f-${name}`} name={name} className={cn("input", error && "border-danger/60")} {...rest} />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
