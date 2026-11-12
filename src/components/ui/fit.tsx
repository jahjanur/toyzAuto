"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { cn } from "@/lib/utils";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Keeps big display text inside its box: if the widest word (elements marked [data-fit-word])
 * is wider than the element, the element's font-size is reduced (in em) until it fits.
 * Re-fits when the available width changes and once web fonts have loaded.
 */
export function useFitWords(ref: RefObject<HTMLElement | null>, key: unknown) {
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    let lastWidth = -1;
    const fit = () => {
      el.style.fontSize = "";
      el.classList.add("fit-measure");
      const avail = el.clientWidth;
      let widest = 0;
      el.querySelectorAll<HTMLElement>("[data-fit-word]").forEach((w) => {
        widest = Math.max(widest, w.getBoundingClientRect().width);
      });
      el.classList.remove("fit-measure");
      if (avail > 0 && widest > avail) el.style.fontSize = `${Math.max(0.35, (avail / widest) * 0.97)}em`;
    };
    fit();
    const target = el.parentElement ?? el;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      if (Math.abs(w - lastWidth) < 0.5) return;
      lastWidth = w;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    });
    ro.observe(target);
    document.fonts?.ready.then(() => fit()).catch(() => undefined);
    return () => { ro.disconnect(); cancelAnimationFrame(frame); };
  }, [key]);
}

/** Plain text that never sticks out of its box (shrinks only when a word is too wide). */
export function FitText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useFitWords(ref, text);
  const parts = text.split(/(\s+)/);
  return (
    <span ref={ref} className={cn("block", className)}>
      {parts.map((p, i) => (/^\s+$/.test(p) ? p : p ? <span key={i} data-fit-word className="inline-block">{p}</span> : null))}
    </span>
  );
}
