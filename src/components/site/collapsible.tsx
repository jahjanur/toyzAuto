"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/client";

export function Collapsible({ children, collapsedHeight = 260 }: { children: React.ReactNode; collapsedHeight?: number }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className={cn("relative overflow-hidden transition-[max-height] duration-700 [transition-timing-function:cubic-bezier(.16,1,.3,1)]")} style={{ maxHeight: open ? 4000 : collapsedHeight }}>
        {children}
        {!open && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-bg to-transparent" />}
      </div>
      <button onClick={() => setOpen((v) => !v)} className="mt-4 inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-accent-2 hover:text-white">
        {open ? t.common.readLess : t.common.readMore} <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>
    </div>
  );
}
