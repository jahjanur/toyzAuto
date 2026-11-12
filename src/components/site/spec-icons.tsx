"use client";

import { motion, type Variants } from "motion/react";

/** Custom line icons for vehicle specs. Paths draw themselves when the parent enters view (variants "hidden"/"show"). */

export type SpecKind = "odometer" | "condition" | "body" | "drivetrain" | "transmission" | "fuel" | "year" | "engine" | "power" | "exterior" | "interior" | "stock";

const ease = [0.65, 0, 0.35, 1] as const;
const draw = (i: number): Variants => ({
  hidden: { pathLength: 0, opacity: 0 },
  show: { pathLength: 1, opacity: 1, transition: { pathLength: { duration: 1.1, delay: 0.1 + i * 0.12, ease }, opacity: { duration: 0.2, delay: 0.1 + i * 0.12 } } },
});

const W = "currentColor";
const R = "var(--color-accent)";

type P = { d?: string; c?: [number, number, number]; red?: boolean };

function Paths({ items }: { items: P[] }) {
  return (
    <>
      {items.map((p, i) =>
        p.c ? (
          <motion.circle key={i} cx={p.c[0]} cy={p.c[1]} r={p.c[2]} stroke={p.red ? R : W} variants={draw(i)} />
        ) : (
          <motion.path key={i} d={p.d} stroke={p.red ? R : W} variants={draw(i)} />
        ),
      )}
    </>
  );
}

const ICONS: Record<Exclude<SpecKind, "drivetrain" | "fuel">, P[]> = {
  odometer: [
    { d: "M10.1 36A16 16 0 1 1 37.9 36" },
    { d: "M13.2 24.5l2.4 1.2M24 12.5v2.7M34.8 24.5l-2.4 1.2M17.4 16.4l1.6 2.1M30.6 16.4L29 18.5" },
    { d: "M24 30l8.5-8.5", red: true },
    { c: [24, 30, 2.6], red: true },
    { d: "M17 38h14" },
  ],
  condition: [
    { d: "M24 6l14 5v11c0 9-6 16-14 20-8-4-14-11-14-20V11l14-5z" },
    { d: "M17.5 23.5l4.5 4.5 9-9", red: true },
  ],
  body: [
    { d: "M4.5 31.5v-3c0-1.7 1.3-2.9 3.1-3.3l7.4-1.4 5.5-5c1.3-1.1 2.9-1.8 4.6-1.8H31c2 0 3.8.9 5 2.5l3.5 4.7 2.5.7c1.5.4 2.5 1.8 2.5 3.3v3.3" },
    { d: "M18 31.5h14M17.5 24h21.5M27 17v7" },
    { c: [14, 31.5, 4], red: true },
    { c: [36, 31.5, 4], red: true },
  ],
  transmission: [
    { c: [24, 11, 5], red: true },
    { d: "M24 16v10" },
    { d: "M12 26v14M24 26v14M36 26v14M12 33h24" },
  ],
  year: [
    { d: "M12 11h24a4 4 0 0 1 4 4v21a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V15a4 4 0 0 1 4-4z" },
    { d: "M8 19h32M16 7v7M32 7v7" },
    { d: "M27 26h6v6h-6z", red: true },
  ],
  engine: [
    { d: "M9 20h5v-5h20v5h5v13h-5v4H14v-4H9z" },
    { d: "M19 15v-4h10v4", red: true },
    { d: "M4 24v5M44 24v5M18 25h12" },
  ],
  power: [{ d: "M27 5L12 27h11l-3 16 16-24H25z", red: true }],
  exterior: [
    { d: "M24 7S12 21 12 29a12 12 0 0 0 24 0C36 21 24 7 24 7z" },
    { d: "M18.5 30a5.5 5.5 0 0 0 5.5 5.5", red: true },
  ],
  interior: [
    { d: "M17 8a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3l2 21H15z" },
    { d: "M11 33h26a2 2 0 0 1 2 2v3H9v-3a2 2 0 0 1 2-2z" },
    { d: "M15 29h16M14 38v5M34 38v5", red: true },
  ],
  stock: [
    { d: "M19 8l-3 32M32 8l-3 32" },
    { d: "M10 18h30", red: true },
    { d: "M8 30h30" },
  ],
};

function drivetrainPaths(drive?: string | null): P[] {
  const d = (drive ?? "").toUpperCase();
  const front = d === "FWD" || d.includes("AWD") || d.includes("4WD") || d.includes("4X4") || d.includes("6X6");
  const rear = d === "RWD" || d.includes("AWD") || d.includes("4WD") || d.includes("4X4") || d.includes("6X6");
  const all = front && rear;
  return [
    { d: "M9 7h5a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zM34 7h5a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z", red: front },
    { d: "M15 13h18", red: front },
    { d: "M24 13v22", red: all },
    { d: "M9 29h5a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V30a1 1 0 0 1 1-1zM34 29h5a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V30a1 1 0 0 1 1-1z", red: rear },
    { d: "M15 35h18", red: rear },
    { d: "M21 32h6v6h-6z", red: rear },
  ];
}

function fuelPaths(fuel?: string | null): P[] {
  const f = (fuel ?? "").toLowerCase();
  if (f.includes("electric")) {
    return [
      { d: "M18 6v8M30 6v8" },
      { d: "M13 14h22v8c0 6.6-5 11-11 11s-11-4.4-11-11z" },
      { d: "M24 33v9" },
      { d: "M25.5 17L21 24h5l-3.5 6", red: true },
    ];
  }
  const pump: P[] = [
    { d: "M10 40V12a3 3 0 0 1 3-3h12.5a3 3 0 0 1 3 3v28M7 40h24.5" },
    { d: "M28.5 18H32a3 3 0 0 1 3 3v12a3 3 0 0 0 6 0V17l-4-4", red: true },
  ];
  if (f.includes("hybrid")) return [...pump, { d: "M20.5 13L16.5 20H21l-3 6", red: true }];
  return [...pump, { d: "M14 14h11v8H14z" }];
}

export function SpecIcon({ kind, drive, fuel, className }: { kind: SpecKind; drive?: string | null; fuel?: string | null; className?: string }) {
  const items = kind === "drivetrain" ? drivetrainPaths(drive) : kind === "fuel" ? fuelPaths(fuel) : ICONS[kind];
  return (
    <svg viewBox="0 0 48 48" fill="none" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <Paths items={items} />
    </svg>
  );
}
