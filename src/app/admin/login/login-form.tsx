"use client";

import { useActionState } from "react";
import { login, type ActionState } from "@/lib/admin-actions";
import { SubmitButton, Notice } from "@/components/admin/ui";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<ActionState, FormData>(login, null);
  return (
    <form action={action} className="mt-6 grid gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      <label className="block"><span className="label">Email</span><input name="email" type="email" required autoComplete="username" className="input" placeholder="you@toyzautoart.com" /></label>
      <label className="block"><span className="label">Password</span><input name="password" type="password" required autoComplete="current-password" className="input" /></label>
      <Notice state={state} />
      <SubmitButton className="h-11 w-full">Sign in</SubmitButton>
    </form>
  );
}
