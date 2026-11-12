/** Brand slugs that have an emblem in public/brand/marques/<slug>.svg */
export const MARQUES = new Set(["porsche", "ferrari", "lamborghini", "rolls-royce", "aston-martin", "maserati", "chevrolet", "mercedes-benz"]);

export function marqueMask(slug: string): React.CSSProperties {
  const url = `url(/brand/marques/${slug}.svg)`;
  return { maskImage: url, WebkitMaskImage: url, maskSize: "contain", WebkitMaskSize: "contain", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat", maskPosition: "center", WebkitMaskPosition: "center" };
}
