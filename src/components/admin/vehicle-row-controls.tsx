"use client";

import { useOptimistic, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { setVehicleStatus, toggleFeatured } from "@/lib/admin-actions";
import { VEHICLE_STATUSES } from "@/db/schema";
import { STATUS_LABEL, cn } from "@/lib/utils";

type Status = (typeof VEHICLE_STATUSES)[number];

/** Status dropdown that saves as soon as a new status is picked. */
export function StatusSelect({ id, status }: { id: number; status: Status }) {
  const [pending, start] = useTransition();
  const [value, setValue] = useOptimistic(status);
  return (
    <span className="inline-flex items-center gap-2">
      <select
        name="status"
        aria-label="Status"
        value={value}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as Status;
          start(async () => { setValue(next); await setVehicleStatus(id, next); });
        }}
        className="input h-9 w-auto py-0 text-[12px] disabled:opacity-60"
      >
        {VEHICLE_STATUSES.map((st) => <option key={st} value={st} className="bg-surface">{STATUS_LABEL[st]}</option>)}
      </select>
      {pending && <Loader2 className="size-3.5 animate-spin text-muted" />}
    </span>
  );
}

/** Featured on/off pill. */
export function FeaturedToggle({ id, featured }: { id: number; featured: boolean }) {
  const [pending, start] = useTransition();
  const [on, setOn] = useOptimistic(featured);
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={pending}
      onClick={() => start(async () => { setOn(!on); await toggleFeatured(id, !on); })}
      className={cn("rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-60", on ? "border-accent bg-accent/15 text-accent-2" : "border-line text-muted hover:text-ink")}
    >
      {on ? "Featured" : "—"}
    </button>
  );
}
