"use client";

import { useActionState } from "react";
import { Trash2, Plus } from "lucide-react";
import { saveBrand, deleteBrand, type ActionState } from "@/lib/admin-actions";
import { ConfirmButton, Notice, SubmitButton } from "./ui";
import { MediaPicker } from "./media-picker";

export function NewBrandForm() {
  const [state, action] = useActionState<ActionState, FormData>(saveBrand, null);
  return (
    <form action={action} className="flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-surface p-4">
      <label className="flex-1"><span className="label">New brand</span><input name="name" required placeholder="McLaren" className="input" /></label>
      <label className="w-28"><span className="label">Order</span><input name="sortOrder" type="number" defaultValue={50} className="input" /></label>
      <SubmitButton><Plus className="size-4" /> Add</SubmitButton>
      <div className="basis-full"><Notice state={state} /></div>
    </form>
  );
}

export function BrandRow({ brand }: { brand: { id: number; name: string; slug: string; count: number; sortOrder: number; soundUrl: string | null; defaultSound: string | null } }) {
  const [state, action] = useActionState<ActionState, FormData>(saveBrand, null);
  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3">
      <form action={action} className="flex flex-1 flex-wrap items-center gap-2">
        <input type="hidden" name="id" value={brand.id} />
        <input name="name" defaultValue={brand.name} className="input h-9 flex-1 py-0" />
        <input name="sortOrder" type="number" defaultValue={brand.sortOrder} className="input h-9 w-20 py-0" title="Sort order" />
        <span className="w-20 text-[12px] text-muted">{brand.count} live</span>
        <div className="basis-full">
          <p className="mb-1.5 text-[11px] text-muted">Hover sound {brand.soundUrl ? "(custom)" : brand.defaultSound ? "(built-in: leave empty to keep it)" : "(none)"}</p>
          <MediaPicker name="soundUrl" defaultValue={brand.soundUrl} accept="audio/*" label="Upload sound" preview={false} />
        </div>
        <SubmitButton variant="ghost" className="h-9">Save</SubmitButton>
        {state && <Notice state={state} />}
      </form>
      <ConfirmButton action={() => deleteBrand(brand.id)} variant="icon" label={`Delete ${brand.name}`} message={`Delete ${brand.name}? Its ${brand.count} vehicle(s) keep their data but lose the brand.`}><Trash2 className="size-3.5" /></ConfirmButton>
    </li>
  );
}
