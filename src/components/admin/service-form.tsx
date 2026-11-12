"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { saveService, deleteService, type ActionState } from "@/lib/admin-actions";
import type { Service } from "@/db/schema";
import { Card, Field, Notice, SubmitButton, Toggle, ConfirmButton } from "./ui";
import { MediaPicker } from "./media-picker";

const ICONS = ["shield", "wand", "sparkles", "wheel", "gauge"];

export function ServiceForm({ service }: { service: Service | null }) {
  const [state, action] = useActionState<ActionState, FormData>(saveService.bind(null, service?.id ?? null), null);
  return (
    <form action={action} className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">{service ? "Edit service" : "New service"}</p><h1 className="mt-2 font-display text-3xl font-light">{service?.title ?? "Add a service"}</h1></div>
        {service && <ConfirmButton action={deleteService.bind(null, service.id)} message={`Delete the service “${service.title}”? This cannot be undone.`}><Trash2 className="size-3.5" /> Delete</ConfirmButton>}
      </div>
      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title"><input name="title" required defaultValue={service?.title ?? ""} className="input" /></Field>
          <Field label="Slug" hint="Leave empty to generate"><input name="slug" defaultValue={service?.slug ?? ""} className="input font-mono text-[13px]" /></Field>
          <Field label="Excerpt (card text)" className="md:col-span-2"><textarea name="excerpt" rows={2} defaultValue={service?.excerpt ?? ""} className="input" /></Field>
          <Field label="Body" hint="Blank-line paragraphs, “## Heading”, “- bullet”" className="md:col-span-2"><textarea name="body" rows={14} defaultValue={service?.body ?? ""} className="input font-mono text-[12.5px] leading-relaxed" /></Field>
          <div className="md:col-span-2 mt-2 border-t border-line pt-5"><p className="eyebrow">Français</p><p className="mt-1 text-[12px] text-muted">Shown on the French site. Empty fields fall back to English.</p></div>
          <Field label="Titre"><input name="titleFr" defaultValue={service?.titleFr ?? ""} className="input" /></Field>
          <Field label="Extrait (texte de la carte)" className="md:col-span-2"><textarea name="excerptFr" rows={2} defaultValue={service?.excerptFr ?? ""} className="input" /></Field>
          <Field label="Contenu" className="md:col-span-2"><textarea name="bodyFr" rows={14} defaultValue={service?.bodyFr ?? ""} className="input font-mono text-[12.5px] leading-relaxed" /></Field>
          <Field label="Icon"><select name="icon" defaultValue={service?.icon ?? "sparkles"} className="input">{ICONS.map((i) => <option key={i} value={i} className="bg-surface">{i}</option>)}</select></Field>
          <Field label="Sort order"><input name="sortOrder" type="number" defaultValue={service?.sortOrder ?? 0} className="input" /></Field>
          <Field label="Cover image (optional)" className="md:col-span-2"><MediaPicker name="coverImage" defaultValue={service?.coverImage} /></Field>
          <div className="md:col-span-2"><Toggle name="published" label="Published" defaultChecked={service?.published ?? true} /></div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-3"><Notice state={state} /><SubmitButton>{service ? "Save changes" : "Create service"}</SubmitButton></div>
      </Card>
    </form>
  );
}
