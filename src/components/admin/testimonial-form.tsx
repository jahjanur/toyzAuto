"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { saveTestimonial, deleteTestimonial, type ActionState } from "@/lib/admin-actions";
import type { Testimonial } from "@/db/schema";
import { Card, ConfirmButton, Field, Notice, SubmitButton, Toggle } from "./ui";

export function TestimonialForm({ t }: { t: Testimonial | null }) {
  const [state, action] = useActionState<ActionState, FormData>(saveTestimonial, null);
  return (
    <Card title={t ? undefined : "Add testimonial"}>
      <form action={action} className="grid gap-3 md:grid-cols-2">
        {t && <input type="hidden" name="id" value={t.id} />}
        <Field label="Author"><input name="author" required defaultValue={t?.author ?? ""} className="input" /></Field>
        <Field label="Role / car"><input name="role" defaultValue={t?.role ?? ""} placeholder="Porsche 911 S/T owner" className="input" /></Field>
        <Field label="Quote" className="md:col-span-2"><textarea name="quote" required rows={3} defaultValue={t?.quote ?? ""} className="input" /></Field>
        <Field label="Rating (1–5)"><input name="rating" type="number" min={1} max={5} defaultValue={t?.rating ?? 5} className="input" /></Field>
        <Field label="Sort order"><input name="sortOrder" type="number" defaultValue={t?.sortOrder ?? 0} className="input" /></Field>
        <div className="md:col-span-2"><Toggle name="published" label="Published" defaultChecked={t?.published ?? true} /></div>
        <div className="flex items-center justify-between gap-3 md:col-span-2">
          {t ? <ConfirmButton action={() => deleteTestimonial(t.id)} variant="link" message={`Delete the testimonial from ${t.author}?`}><Trash2 className="size-3.5" /> Delete</ConfirmButton> : <span />}
          <div className="flex items-center gap-3"><Notice state={state} /><SubmitButton>{t ? "Save" : "Add"}</SubmitButton></div>
        </div>
      </form>
    </Card>
  );
}
