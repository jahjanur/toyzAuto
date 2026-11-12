"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { changePassword, createUser, deleteUser, type ActionState } from "@/lib/admin-actions";
import type { SessionPayload } from "@/lib/auth";
import { Card, ConfirmButton, Field, Notice, SubmitButton } from "./ui";
import { timeAgo } from "@/lib/utils";

type U = { id: number; email: string; name: string; role: string; lastLoginAt: number | null };

export function AccountForms({ session, users }: { session: SessionPayload; users: U[] }) {
  const [pw, pwAction] = useActionState<ActionState, FormData>(changePassword, null);
  const [nu, nuAction] = useActionState<ActionState, FormData>(createUser, null);
  return (
    <div className="max-w-3xl space-y-6">
      <div><p className="eyebrow">Security</p><h1 className="mt-2 font-display text-3xl font-light">Account & users</h1></div>
      <Card title="Change your password" description={`Signed in as ${session.email}`}>
        <form action={pwAction} className="grid gap-3 md:grid-cols-2">
          <Field label="Current password"><input name="current" type="password" required autoComplete="current-password" className="input" /></Field>
          <Field label="New password (8+ characters)"><input name="next" type="password" required minLength={8} autoComplete="new-password" className="input" /></Field>
          <div className="flex items-center justify-end gap-3 md:col-span-2"><Notice state={pw} /><SubmitButton>Update password</SubmitButton></div>
        </form>
      </Card>
      <Card title="Team" description={session.role === "owner" ? "Add colleagues who can manage the website." : "Only the owner can add or remove users."}>
        <ul className="mb-5 divide-y divide-line">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-3 py-2.5">
              <div><p className="text-sm">{u.name} <span className="ml-1 font-mono text-[10px] uppercase tracking-widest text-accent">{u.role}</span></p><p className="text-[12px] text-muted">{u.email} · {u.lastLoginAt ? `last login ${timeAgo(u.lastLoginAt)}` : "never signed in"}</p></div>
              {session.role === "owner" && u.id !== session.uid && <ConfirmButton action={() => deleteUser(u.id)} variant="icon" className="size-8" label={`Remove ${u.name}`} message={`Remove ${u.name} (${u.email})? They will no longer be able to sign in.`}><Trash2 className="size-3.5" /></ConfirmButton>}
            </li>
          ))}
        </ul>
        {session.role === "owner" && (
          <form action={nuAction} className="grid gap-3 md:grid-cols-3">
            <Field label="Name"><input name="name" required className="input" /></Field>
            <Field label="Email"><input name="email" type="email" required className="input" /></Field>
            <Field label="Temporary password"><input name="password" type="text" required minLength={8} className="input" /></Field>
            <div className="flex items-center justify-end gap-3 md:col-span-3"><Notice state={nu} /><SubmitButton>Add user</SubmitButton></div>
          </form>
        )}
      </Card>
    </div>
  );
}
