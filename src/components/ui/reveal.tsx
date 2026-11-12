"use client";

import { motion, type Variants } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useFitWords } from "./fit";

const variants: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0 },
};
const ease = [0.16, 1, 0.3, 1] as const;

export function Reveal({
  children, delay = 0, className, as = "div", once = true, amount = 0.2, duration = 1,
}: { children: ReactNode; delay?: number; className?: string; as?: "div" | "section" | "span" | "li" | "p" | "h1" | "h2" | "h3"; once?: boolean; amount?: number; duration?: number }) {
  const M = motion[as] as typeof motion.div;
  return (
    <M className={className} variants={variants} initial="hidden" whileInView="show" viewport={{ once, amount, margin: "0px 0px -6% 0px" }} transition={{ duration, delay, ease }}>
      {children}
    </M>
  );
}

export function Stagger({ children, className, delay = 0, stagger = 0.08 }: { children: ReactNode; className?: string; delay?: number; stagger?: number }) {
  return (
    <motion.div className={className} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} transition={{ staggerChildren: stagger, delayChildren: delay }}>
      {children}
    </motion.div>
  );
}

export function Item({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={variants} transition={{ duration: 1, ease }}>
      {children}
    </motion.div>
  );
}

/** Masked line-by-line word reveal. With `inView`, the (unclipped) wrapper watches the viewport and drives the words. */
export function SplitWords({ text, className, delay = 0, inView = false }: { text: string; className?: string; delay?: number; inView?: boolean }) {
  const lines = text.split("\n");
  const ref = useRef<HTMLSpanElement>(null);
  useFitWords(ref, text);
  let i = 0;
  const word: Variants = {
    hidden: { y: "108%" },
    show: (idx: number) => ({ y: "0%", transition: { duration: 1.05, delay: delay + idx * 0.055, ease } }),
  };
  return (
    <motion.span
      ref={ref}
      className={className}
      aria-label={text.replace(/\n/g, " ")}
      initial="hidden"
      {...(inView ? { whileInView: "show", viewport: { once: true, amount: 0.3 } } : { animate: "show" })}
      style={{ display: "block" }}
    >
      {lines.map((line, li) => {
        const words = line.split(" ");
        return (
          <span key={li} className="block" aria-hidden>
            {words.map((w, wi) => {
              const idx = i++;
              const m = /^(.*?)([.!?])$/.exec(w);
              return (
                <span key={wi} className="inline-block overflow-hidden align-bottom pb-[0.06em] -mb-[0.06em]">
                  <motion.span data-fit-word className="inline-block will-change-transform" variants={word} custom={idx}>
                    {m ? <>{m[1]}<span className="text-accent">{m[2]}</span></> : w}
                  </motion.span>
                  {wi < words.length - 1 ? "\u00A0" : ""}
                </span>
              );
            })}
          </span>
        );
      })}
    </motion.span>
  );
}
