import { AUTOART_PATHS, CAR_PATHS, LOGO_VIEWBOX, TOYZ_PATHS } from "@/components/brand/logo-paths";
import { ZulberaLogo } from "@/components/brand/zulbera";

/**
 * First-visit intro. Pure CSS/SVG so it plays before hydration:
 * 1) the car line draws in red while the letters trace in white,
 * 2) a molten red edge fills the mark from bottom to top,
 * 3) the curtain wipes up into the hero. Only the logo, plus a small "Crafted by Zulbera" signature at the bottom.
 * An inline script skips it for the rest of the session (and for reduced motion).
 */
export function Intro({ credit }: { credit: string }) {
  const script = `try{var k='toyz-intro',h=document.documentElement;if(sessionStorage.getItem(k)||matchMedia('(prefers-reduced-motion: reduce)').matches){h.dataset.intro='done'}else{sessionStorage.setItem(k,'1');setTimeout(function(){h.dataset.intro='done'},6500)}}catch(e){document.documentElement.dataset.intro='done'}`;
  const [vx, vy, vw, vh] = LOGO_VIEWBOX.split(" ").map(Number);
  const stroke = (paths: string[], cls: string, base: number, step: number) =>
    paths.map((d, i) => <path key={i} d={d} pathLength={1} className={cls} style={{ ["--d" as string]: `${base + i * step}s` }} />);
  const fills = (
    <>
      {CAR_PATHS.map((d, i) => <path key={`c${i}`} d={d} className="fill-accent" />)}
      {TOYZ_PATHS.map((d, i) => <path key={`t${i}`} d={d} />)}
      {AUTOART_PATHS.map((d, i) => <path key={`a${i}`} d={d} />)}
    </>
  );
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <div aria-hidden className="intro pointer-events-none fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg">
        <div className="intro-stage relative w-[min(80vw,640px)]">
          <svg viewBox={LOGO_VIEWBOX} className="h-auto w-full overflow-visible">
            <defs>
              <clipPath id="intro-fill"><rect className="intro-rise" x={vx} y={vy} width={vw} height={vh} /></clipPath>
              <clipPath id="intro-edge"><rect className="intro-rise" x={vx} y={vy - 16} width={vw} height={16} /></clipPath>
            </defs>
            {/* 1. line drawing */}
            <g className="intro-lines" fill="none" strokeLinejoin="round">
              <g stroke="var(--color-accent)" strokeWidth={2.6}>{stroke(CAR_PATHS, "intro-draw", 0.1, 0.12)}</g>
              <g stroke="#f5f5f4" strokeWidth={2}>{stroke(TOYZ_PATHS, "intro-draw", 0.3, 0.09)}</g>
              <g stroke="#f5f5f4" strokeWidth={1.6}>{stroke(AUTOART_PATHS, "intro-draw intro-draw-fast", 0.55, 0.05)}</g>
            </g>
            {/* 2. rising fill */}
            <g clipPath="url(#intro-fill)" fill="#f5f5f4">{fills}</g>
            {/* 3. molten leading edge */}
            <g clipPath="url(#intro-edge)" fill="var(--color-accent)" className="intro-edge">
              {CAR_PATHS.map((d, i) => <path key={`ec${i}`} d={d} fill="#ff8a8f" />)}
              {TOYZ_PATHS.map((d, i) => <path key={`et${i}`} d={d} />)}
              {AUTOART_PATHS.map((d, i) => <path key={`ea${i}`} d={d} />)}
            </g>
          </svg>
        </div>
        {/* signature */}
        <div className="intro-credit absolute inset-x-0 bottom-[max(2.25rem,calc(env(safe-area-inset-bottom)+1.25rem))] flex items-center justify-center gap-3 px-6 text-white">
          <span className="intro-credit-line h-px w-6 origin-right bg-gradient-to-l from-white/30 to-transparent sm:w-10 md:w-16" />
          <span className="whitespace-nowrap font-mono text-[9.5px] uppercase tracking-[0.32em] text-muted sm:text-[10px] md:text-[11px]">{credit}</span>
          <ZulberaLogo className="h-[18px] sm:h-5 md:h-6" emblemClassName="intro-emblem" />
          <span className="intro-credit-line h-px w-6 origin-left bg-gradient-to-r from-white/30 to-transparent sm:w-10 md:w-16" />
        </div>
      </div>
    </>
  );
}
