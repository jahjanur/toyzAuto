"use client";

import { useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useSound } from "./sound-provider";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

/** Animated equalizer bars (CSS only). */
export function Bars({ active, className }: { active: boolean; className?: string }) {
  return (
    <span aria-hidden className={cn("inline-flex h-3 items-end gap-[2px]", className)}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={cn("w-[2px] rounded-full bg-current", active ? "eq-bar" : "h-[3px]")} style={{ animationDelay: `${i * 0.12}s` }} />
      ))}
    </span>
  );
}

/** Speaker toggle for the navigation bar. */
export function SoundToggle({ className, withLabel }: { className?: string; withLabel?: boolean }) {
  const { enabled, setEnabled, playingId } = useSound();
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={() => setEnabled(!enabled)}
      aria-pressed={enabled}
      aria-label={`${t.sound.toggle}: ${enabled ? t.sound.on : t.sound.off}`}
      title={enabled ? t.sound.on : t.sound.off}
      className={cn("group flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-white/15 px-3 text-white transition-colors duration-300 hover:border-white/40", withLabel ? "" : "w-10 px-0", className)}
    >
      {enabled ? (playingId ? <Bars active className="text-accent" /> : <Volume2 className="size-4" />) : <VolumeX className="size-4 text-white/50" />}
      {withLabel && <span className="font-mono text-[10px] uppercase tracking-[0.18em]">{enabled ? t.sound.on : t.sound.off}</span>}
    </button>
  );
}

/**
 * Wraps a brand tile / chip. Mouse: plays while hovered (short delay so sweeping across the grid stays quiet).
 * Touch: plays on tap; the sound keeps going while the next page loads.
 */
export function EngineHover({ src, id, children, className, volume = 0.7, showBars = true }: { src: string | null; id: string; children: React.ReactNode; className?: string; volume?: number; showBars?: boolean }) {
  const { enabled, unlocked, play, stop, playingId, preload } = useSound();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPointer = useRef<string>("mouse");

  useEffect(() => { if (src && enabled && unlocked) preload(src); }, [src, enabled, unlocked, preload]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  if (!src) return <div className={className}>{children}</div>;
  const playing = playingId === id;
  return (
    <div
      className={cn("relative", className)}
      data-playing={playing || undefined}
      onPointerEnter={(e) => {
        lastPointer.current = e.pointerType;
        if (e.pointerType !== "mouse" || !enabled || !unlocked) return;
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => play(src, { id, volume }), 110);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        if (timer.current) clearTimeout(timer.current);
        if (playingId === id) stop(0.45);
      }}
      onPointerDown={(e) => { lastPointer.current = e.pointerType; }}
      onClickCapture={() => {
        if (lastPointer.current !== "mouse" && enabled) play(src, { id, volume });
      }}
    >
      {children}
      {showBars && (
        <span aria-hidden className={cn("pointer-events-none absolute right-2 top-2 text-accent transition-opacity duration-300", playing ? "opacity-100" : "opacity-0")}>
          <Bars active={playing} />
        </span>
      )}
    </div>
  );
}

/** Small status / unlock chip shown beside the brand grid. */
export function SoundHint({ className }: { className?: string }) {
  const { enabled, unlocked, setEnabled, unlock } = useSound();
  const { t } = useI18n();
  const touch = typeof window !== "undefined" && window.matchMedia?.("(hover: none)").matches;
  const label = !enabled ? t.sound.muted : !unlocked ? t.sound.enable : touch ? t.sound.tapHint : t.sound.hoverHint;
  return (
    <button
      type="button"
      onClick={() => { if (!enabled) setEnabled(true); else unlock(); }}
      className={cn("inline-flex items-center gap-2.5 rounded-full border border-white/10 px-3.5 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-2 transition-colors hover:border-white/30 hover:text-white", className)}
    >
      {enabled ? <Volume2 className={cn("size-3.5", unlocked ? "text-accent" : "")} /> : <VolumeX className="size-3.5" />}
      <span suppressHydrationWarning>{label}</span>
    </button>
  );
}
