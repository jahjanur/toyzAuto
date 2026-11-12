import { ShieldCheck, Wand2, Sparkles, Gauge, CircleDot } from "lucide-react";

export const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  shield: ShieldCheck, wand: Wand2, sparkles: Sparkles, gauge: Gauge, wheel: CircleDot,
};
