"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { useI18n } from "@/i18n/client";

export function ShareButton({ title }: { title: string }) {
  const { t } = useI18n();
  const [done, setDone] = useState(false);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else { await navigator.clipboard.writeText(url); setDone(true); setTimeout(() => setDone(false), 1800); }
    } catch {}
  };
  return (
    <button onClick={share} className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted hover:border-accent/60 hover:text-ink transition-colors">
      {done ? <Check className="size-3.5 text-accent" /> : <Share2 className="size-3.5" />} {done ? t.common.copied : t.common.share}
    </button>
  );
}
