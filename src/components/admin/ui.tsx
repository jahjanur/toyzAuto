"use client";

import { useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/lib/admin-actions";

export function SubmitButton({ children, className, variant = "primary" }: { children: React.ReactNode; className?: string; variant?: "primary" | "ghost" | "danger" }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn(
      "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-all disabled:opacity-60",
      variant === "primary" && "bg-accent text-white hover:bg-accent-2",
      variant === "ghost" && "border border-line-2 text-ink hover:border-accent/60",
      variant === "danger" && "bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25",
      className)}>
      {pending && <Loader2 className="size-4 animate-spin" />}{children}
    </button>
  );
}

export function Notice({ state }: { state: ActionState }) {
  if (!state) return null;
  return (
    <div className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 text-sm", state.ok ? "border-success/30 bg-success/10 text-success" : "border-danger/30 bg-danger/10 text-danger")}>
      {state.ok ? <Check className="size-4" /> : <AlertCircle className="size-4" />} {state.ok ? state.message ?? "Done" : state.error}
    </div>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted-2">{hint}</span>}
    </label>
  );
}

export function Toggle({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line px-4 py-3">
      <span><span className="block text-sm text-ink">{label}</span>{hint && <span className="block text-[11px] text-muted">{hint}</span>}</span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative h-5 w-9 shrink-0 rounded-full bg-white/10 transition peer-checked:bg-accent after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-ink after:transition peer-checked:after:translate-x-4 peer-checked:after:bg-white" />
    </label>
  );
}

export function Card({ title, description, children, className, actions }: { title?: string; description?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-line bg-surface", className)}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>{title && <h2 className="font-display text-base font-medium">{title}</h2>}{description && <p className="mt-0.5 text-[12.5px] text-muted">{description}</p>}</div>
          {actions}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

const ACTION_VARIANTS = {
  danger: "inline-flex h-9 items-center gap-1.5 rounded-lg border border-danger/30 bg-danger/10 px-3 text-[13px] text-danger hover:bg-danger/20",
  ghost: "inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] text-ink-2 hover:text-ink",
  icon: "grid size-9 place-items-center rounded-lg border border-line text-muted hover:border-danger/40 hover:text-danger",
  link: "inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-danger",
} as const;

/**
 * Button that runs a server action (optionally after a confirm dialog) and shows a spinner while it runs.
 * It is a plain button, not a <form>, so it can sit inside another form (an HTML form inside a form is dropped by the browser).
 */
export function ActionButton({ action, children, className, confirmMessage, variant = "ghost", label }: { action: () => unknown; children: React.ReactNode; className?: string; confirmMessage?: string; variant?: keyof typeof ACTION_VARIANTS; label?: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={pending}
      aria-busy={pending || undefined}
      onClick={() => {
        if (confirmMessage && !confirm(confirmMessage)) return;
        start(async () => { await action(); });
      }}
      className={cn(ACTION_VARIANTS[variant], "transition-colors disabled:cursor-wait disabled:opacity-60", className)}
    >
      {pending ? <Loader2 className="size-3.5 animate-spin" /> : null}
      {pending && variant === "icon" ? null : children}
    </button>
  );
}

/** Delete-style button: asks for confirmation, then runs the action. */
export function ConfirmButton({ action, children, className, message = "Are you sure? This cannot be undone.", variant = "danger", label }: { action: () => unknown; children: React.ReactNode; className?: string; message?: string; variant?: keyof typeof ACTION_VARIANTS; label?: string }) {
  return <ActionButton action={action} confirmMessage={message} variant={variant} className={className} label={label}>{children}</ActionButton>;
}
