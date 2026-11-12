"use client";

import { Fragment, useRef } from "react";
import { useFitWords } from "./fit";

/** Renders "\n"-separated lines, paints a trailing period in the accent red, and shrinks to fit if a word is too wide. */
export function Headline({ text }: { text: string }) {
  const lines = text.split("\n");
  const ref = useRef<HTMLSpanElement>(null);
  useFitWords(ref, text);
  return (
    <span ref={ref} className="block">
      {lines.map((line, i) => (
        <Fragment key={i}>
          {line.split(" ").map((w, wi, arr) => (
            <Fragment key={wi}>
              <span data-fit-word className="inline-block"><Dot text={w} /></span>
              {wi < arr.length - 1 ? " " : ""}
            </Fragment>
          ))}
          {i < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </span>
  );
}

export function Dot({ text }: { text: string }) {
  const m = /^(.*?)([.!?])$/.exec(text);
  if (!m) return <>{text}</>;
  return <>{m[1]}<span className="text-accent">{m[2]}</span></>;
}
