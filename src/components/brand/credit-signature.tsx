"use client";

import { useEffect } from "react";
import { ZULBERA_URL } from "./zulbera-paths";

/** A small signature in the browser's developer console. */
export function CreditSignature() {
  useEffect(() => {
    const w = window as unknown as { __zulberaSigned?: boolean };
    if (w.__zulberaSigned) return;
    w.__zulberaSigned = true;
    console.log(
      "%c zulbera %c Crafted by Zulbera — " + ZULBERA_URL.split("?")[0],
      "background:#e3121f;color:#fff;font-weight:700;padding:3px 8px;border-radius:4px",
      "color:#c8c8c6;padding:3px 6px",
    );
  }, []);
  return null;
}
