type Img = { url: string; width?: number | null; height?: number | null };

export const ratio = (img: Img) => (img.width && img.height ? img.width / img.height : 1.5);
export const isLandscape = (img: Img) => ratio(img) >= 1.3;

/** First landscape photo at or after `from` (falls back to any photo) — used wherever a wide frame shows the whole car. */
export function pickLandscape<T extends Img>(images: T[], from = 0): T | undefined {
  return images.slice(from).find(isLandscape) ?? images.find(isLandscape) ?? images[from] ?? images[0];
}

/** The next landscape photo after `cover` (for hover swaps). */
export function nextLandscape<T extends Img>(images: T[], cover: T | undefined): T | undefined {
  if (!cover) return undefined;
  const idx = images.indexOf(cover);
  return images.slice(idx + 1).find(isLandscape);
}
