"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";

/** Single file picker that uploads immediately and writes the URL into a hidden/text input. */
export function MediaPicker({ name, defaultValue, accept = "image/*", label = "Upload", preview = true }: { name: string; defaultValue?: string | null; accept?: string; label?: string; preview?: boolean }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  async function upload(file: File) {
    setBusy(true);
    const fd = new FormData(); fd.append("files", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (res.ok) setUrl(json.files[0].url); else alert(json.error ?? "Upload failed");
    } catch { alert("Upload failed"); } finally { setBusy(false); }
  }
  const isVideo = /\.(mp4|webm|mov)$/i.test(url);
  const isAudio = /\.(mp3|m4a|aac|wav|ogg)$/i.test(url);
  return (
    <div className="flex items-start gap-3">
      {url && isAudio && <audio src={url} controls preload="none" className="h-10 w-56 shrink-0" />}
      {preview && url && !isAudio && (
        <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-line bg-bg-2">
          {isVideo ? <video src={url} muted className="h-full w-full object-cover" /> : <img src={url} alt="" className="h-full w-full object-cover" />}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2">
        <input name={name} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/uploads/… or https://…" className="input" />
        <div className="flex gap-2">
          <button type="button" onClick={() => ref.current?.click()} disabled={busy} className="inline-flex h-9 items-center gap-2 rounded-lg border border-line-2 px-3 text-[13px] hover:border-accent/60 disabled:opacity-60">
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />} {label}
          </button>
          {url && <button type="button" onClick={() => setUrl("")} className="inline-flex h-9 items-center gap-1 rounded-lg border border-line px-3 text-[13px] text-muted hover:text-danger"><X className="size-3.5" /> Clear</button>}
        </div>
        <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      </div>
    </div>
  );
}
