"use client";

import { useActionState, useState } from "react";
import { Upload } from "lucide-react";
import { restoreBackup, type ActionState } from "@/lib/admin-actions";
import { Notice, SubmitButton } from "./ui";

export function RestoreForm() {
  const [state, action] = useActionState<ActionState, FormData>(restoreBackup, null);
  const [name, setName] = useState("");
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Replace the whole database with "${name}"? Everything currently on the site is replaced by the backup (a safety copy is kept on the server).`)) e.preventDefault();
      }}
      className="space-y-4"
    >
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-2 bg-bg/40 px-6 py-8 text-center transition-colors hover:border-accent/60">
        <Upload className="size-6 text-accent" />
        <span className="text-sm text-ink">{name || "Choose a backup file (.db)"}</span>
        <span className="text-[11px] text-muted">For example toyz.db or toyz-backup-2026-11-13.db</span>
        <input name="backup" type="file" accept=".db,.sqlite,.sqlite3,application/vnd.sqlite3,application/octet-stream" required className="sr-only" onChange={(e) => setName(e.target.files?.[0]?.name ?? "")} />
      </label>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Notice state={state} />
        <SubmitButton variant="danger">Restore backup</SubmitButton>
      </div>
    </form>
  );
}
