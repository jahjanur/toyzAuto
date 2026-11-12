"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

/**
 * One shared Web Audio graph for the whole site.
 * - Browsers only allow sound after the visitor's first click / tap / key press, so the context is "unlocked" then.
 * - Visitors can mute; the choice is remembered in localStorage.
 * - Only one engine plays at a time; switching crossfades.
 */

type PlayOpts = { id: string; volume?: number; fadeIn?: number };
type SoundApi = {
  enabled: boolean;
  unlocked: boolean;
  playingId: string | null;
  setEnabled: (on: boolean) => void;
  unlock: () => void;
  play: (src: string, opts: PlayOpts) => void;
  stop: (fade?: number) => void;
  preload: (src: string) => void;
  analyser: () => AnalyserNode | null;
  progress: () => number;
};

const Ctx = createContext<SoundApi | null>(null);
const STORE_KEY = "toyz-sound";

/* enabled preference (localStorage) as an external store so it renders correctly after hydration */
const listeners = new Set<() => void>();
function readEnabled() {
  try { return localStorage.getItem(STORE_KEY) !== "off"; } catch { return true; }
}
function writeEnabled(on: boolean) {
  try { localStorage.setItem(STORE_KEY, on ? "on" : "off"); } catch {}
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const enabled = useSyncExternalStore(subscribe, readEnabled, () => false);
  const [unlocked, setUnlocked] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const buffers = useRef(new Map<string, Promise<AudioBuffer | null>>());
  const current = useRef<{ src: AudioBufferSourceNode; gain: GainNode; id: string; start: number; duration: number } | null>(null);
  const pending = useRef<string | null>(null);

  const ensureGraph = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0.9;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.75;
    master.connect(analyser);
    analyser.connect(ctx.destination);
    ctxRef.current = ctx;
    masterRef.current = master;
    analyserRef.current = analyser;
    return ctx;
  }, []);

  const unlock = useCallback(() => {
    const ctx = ensureGraph();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().then(() => setUnlocked(true)).catch(() => undefined);
    else setUnlocked(true);
  }, [ensureGraph]);

  // first gesture anywhere unlocks audio
  useEffect(() => {
    const events = ["pointerdown", "pointerup", "touchend", "keydown", "click"] as const;
    const on = () => unlock();
    events.forEach((e) => window.addEventListener(e, on, { capture: true, passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, on, { capture: true }));
  }, [unlock]);

  const load = useCallback((src: string) => {
    let p = buffers.current.get(src);
    if (!p) {
      p = fetch(src)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
        .then((ab) => {
          const ctx = ensureGraph();
          return ctx ? ctx.decodeAudioData(ab) : null;
        })
        .catch(() => null);
      buffers.current.set(src, p);
    }
    return p;
  }, [ensureGraph]);

  const stop = useCallback((fade = 0.35) => {
    const cur = current.current;
    const ctx = ctxRef.current;
    if (!cur || !ctx) return;
    const t = ctx.currentTime;
    cur.gain.gain.cancelScheduledValues(t);
    cur.gain.gain.setValueAtTime(cur.gain.gain.value, t);
    cur.gain.gain.linearRampToValueAtTime(0, t + fade);
    try { cur.src.stop(t + fade + 0.02); } catch {}
    current.current = null;
    setPlayingId(null);
  }, []);

  const play = useCallback((src: string, { id, volume = 0.8, fadeIn = 0.05 }: PlayOpts) => {
    const ctx = ensureGraph();
    if (!ctx || !masterRef.current) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => undefined);
    stop(0.25);
    setPlayingId(id);
    const token = id + ":" + performance.now();
    pending.current = token;
    load(src).then((buf) => {
      if (!buf || pending.current !== token || !masterRef.current) {
        if (pending.current === token) setPlayingId(null);
        return;
      }
      const source = ctx.createBufferSource();
      source.buffer = buf;
      const gain = ctx.createGain();
      const t = ctx.currentTime;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(volume, t + fadeIn);
      source.connect(gain).connect(masterRef.current);
      source.start(t);
      current.current = { src: source, gain, id, start: t, duration: buf.duration };
      source.onended = () => {
        if (current.current?.src === source) { current.current = null; setPlayingId(null); }
      };
    });
  }, [ensureGraph, load, stop]);

  const setEnabled = useCallback((on: boolean) => {
    writeEnabled(on);
    if (!on) stop(0.2);
    else unlock();
  }, [stop, unlock]);

  // pause when the tab is hidden
  useEffect(() => {
    const onVis = () => { if (document.hidden) stop(0.1); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [stop]);

  const api = useMemo<SoundApi>(() => ({
    enabled, unlocked, playingId, setEnabled, unlock, play, stop,
    preload: (src) => { void load(src); },
    analyser: () => analyserRef.current,
    progress: () => {
      const cur = current.current, ctx = ctxRef.current;
      if (!cur || !ctx) return 0;
      return Math.min(1, (ctx.currentTime - cur.start) / cur.duration);
    },
  }), [enabled, unlocked, playingId, setEnabled, unlock, play, stop, load]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useSound() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSound must be used inside <SoundProvider>");
  return ctx;
}
