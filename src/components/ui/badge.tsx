import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  available: "bg-success/15 text-success border-success/30",
  reserved: "bg-warning/15 text-warning border-warning/30",
  sold: "bg-white/10 text-ink-2 border-white/15",
  coming_soon: "bg-accent/15 text-accent-2 border-accent/30",
  hidden: "bg-white/5 text-muted border-white/10",
  new: "bg-accent/15 text-accent-2 border-accent/30",
  neutral: "bg-white/[.06] text-ink-2 border-white/10",
  accent: "bg-accent text-white border-accent",
};

export function Badge({ tone = "neutral", className, children }: { tone?: keyof typeof tones | string; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em]", tones[tone] ?? tones.neutral, className)}>
      {children}
    </span>
  );
}
