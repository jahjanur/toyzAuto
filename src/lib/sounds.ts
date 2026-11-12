/** Which hover clip belongs to which brand. Pure functions, safe on server and client. */

const HOVER_BY_BRAND: Record<string, string> = {
  ferrari: "/sounds/hover/ferrari.mp3",
  lamborghini: "/sounds/hover/lamborghini.mp3",
  porsche: "/sounds/hover/porsche.mp3",
  "mercedes-benz": "/sounds/hover/mercedes-benz.mp3",
  "aston-martin": "/sounds/hover/aston-martin.mp3",
  "rolls-royce": "/sounds/hover/rolls-royce.mp3",
  maserati: "/sounds/hover/maserati.mp3",
  chevrolet: "/sounds/hover/chevrolet.mp3",
  terradyne: "/sounds/hover/terradyne.mp3",
};

/** Short clip for hovering a brand: admin upload first, then the built-in clip for that marque. */
export function hoverSoundFor(brand: { slug: string; soundUrl?: string | null }): string | null {
  return brand.soundUrl || HOVER_BY_BRAND[brand.slug] || null;
}
