"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Upload, X, Star, GripVertical, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type ImgItem = { url: string; width?: number | null; height?: number | null; blurDataUrl?: string | null; alt?: string | null };

export function ImageManager({ name = "images", initial, title }: { name?: string; initial: ImgItem[]; title?: string }) {
  const [items, setItems] = useState<ImgItem[]>(initial);
  const [busy, setBusy] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dirty = JSON.stringify(items.map((x) => x.url)) !== JSON.stringify(initial.map((x) => x.url));

  async function upload(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setBusy((b) => b + list.length);
    // upload in chunks of 4 to keep requests small
    for (let i = 0; i < list.length; i += 4) {
      const fd = new FormData();
      list.slice(i, i + 4).forEach((f) => fd.append("files", f));
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (res.ok) setItems((prev) => [...prev, ...json.files.map((f: ImgItem) => ({ url: f.url, width: f.width, height: f.height, blurDataUrl: f.blurDataUrl, alt: title ?? null }))]);
        else alert(json.error ?? "Upload failed");
      } catch { alert("Upload failed"); }
      setBusy((b) => Math.max(0, b - Math.min(4, list.length - i)));
    }
  }
  const move = (from: number, to: number) => setItems((prev) => { if (to < 0 || to >= prev.length) return prev; const next = [...prev]; const [x] = next.splice(from, 1); next.splice(to, 0, x); return next; });

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <div
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={(e) => { e.preventDefault(); if (drag === null) upload(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-2 bg-bg/40 px-6 py-10 text-center transition-colors hover:border-accent/60"
      >
        {busy ? <Loader2 className="size-6 animate-spin text-accent" /> : <Upload className="size-6 text-accent" />}
        <p className="text-sm text-ink">{busy ? `Uploading ${busy} photo${busy > 1 ? "s" : ""}…` : "Drop photos here or click to upload"}</p>
        <p className="text-[11px] text-muted">JPG, PNG, HEIC, WebP · converted to optimized WebP automatically · first photo is the cover</p>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && upload(e.target.files)} />
      </div>
      {items.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((img, i) => (
            <li
              key={img.url + i}
              draggable
              onDragStart={() => setDrag(i)}
              onDragOver={(e) => { e.preventDefault(); setOver(i); }}
              onDragEnd={() => { if (drag !== null && over !== null && drag !== over) move(drag, over); setDrag(null); setOver(null); }}
              className={cn("group relative aspect-[4/3] overflow-hidden rounded-xl border bg-bg-2", i === 0 ? "border-accent" : "border-line", over === i && drag !== i && "ring-2 ring-accent/60")}
            >
              <Image src={img.url} alt="" fill sizes="200px" className="object-cover" />
              {i === 0 && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-white"><Star className="size-2.5" /> Cover</span>}
              <span className="absolute right-2 top-2 grid size-7 cursor-grab place-items-center rounded-full glass text-ink opacity-0 transition-opacity group-hover:opacity-100 [@media(hover:none)]:hidden"><GripVertical className="size-3.5" /></span>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(i, i - 1)} className="grid size-7 place-items-center rounded-full glass text-ink hover:text-accent" aria-label="Move left"><ArrowLeft className="size-3.5" /></button>
                  <button type="button" onClick={() => move(i, i + 1)} className="grid size-7 place-items-center rounded-full glass text-ink hover:text-accent" aria-label="Move right"><ArrowRight className="size-3.5" /></button>
                  {i !== 0 && <button type="button" onClick={() => move(i, 0)} className="grid size-7 place-items-center rounded-full glass text-ink hover:text-accent" aria-label="Make cover"><Star className="size-3.5" /></button>}
                </div>
                <button type="button" onClick={() => setItems((p) => p.filter((_, j) => j !== i))} className="grid size-7 place-items-center rounded-full bg-danger/80 text-white" aria-label="Remove"><X className="size-3.5" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {dirty && (
        <p role="status" className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-[12.5px] text-ink-2">
          <span className="size-1.5 shrink-0 rounded-full bg-accent" />
          Photo changes are not saved yet. Press <strong className="font-medium text-ink">Save changes</strong> to apply them.
        </p>
      )}
    </div>
  );
}
