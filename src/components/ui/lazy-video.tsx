"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const MQ = "(max-width: 767px)";
function subscribe(cb: () => void) {
  const m = window.matchMedia(MQ);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}
export function useIsMobile(): boolean | null {
  return useSyncExternalStore(subscribe, () => window.matchMedia(MQ).matches, () => null);
}

/** Muted looping background video: picks the mobile source on phones, loads only near the viewport, pauses off-screen. */
export function LazyVideo({ src, srcMobile, poster, className, eager }: { src: string; srcMobile?: string; poster?: string; className?: string; eager?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const mobile = useIsMobile();
  const [near, setNear] = useState(!!eager);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          const p = el.play();
          if (p) p.catch(() => undefined);
        } else {
          el.pause();
        }
      },
      { rootMargin: "50% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const source = mobile === null ? undefined : mobile && srcMobile ? srcMobile : src;
  return (
    <video
      ref={ref}
      className={cn("h-full w-full object-cover", className)}
      src={near ? source : undefined}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay={eager}
      preload={eager ? "auto" : "none"}
      aria-hidden
    />
  );
}
