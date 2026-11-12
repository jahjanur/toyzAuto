"use client";

import { useEffect } from "react";
import Lenis from "lenis";

declare global {
  interface Window { __lenis?: Lenis }
}

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: { offset: -90 } });
    window.__lenis = lenis;
    let raf = 0;
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); delete window.__lenis; };
  }, []);
  return null;
}

export function lockScroll(lock: boolean) {
  document.documentElement.style.overflow = lock ? "hidden" : "";
  if (lock) window.__lenis?.stop(); else window.__lenis?.start();
}
