import Image from "next/image";
import { ratio } from "@/lib/images";
import { cn } from "@/lib/utils";

type Img = { url: string; width?: number | null; height?: number | null; blurDataUrl?: string | null; alt?: string | null };

/**
 * Shows a photo inside a fixed-ratio frame without cutting the car.
 * - Photo close to the frame shape: fills it.
 * - mode "focus" (cards): portrait showroom shots are cropped around 62% height, where the car sits,
 *   so the whole car shows large instead of being cut by a centre crop.
 * - mode "contain" (gallery): the full photo is shown over a soft, darkened, blurred copy of itself.
 */
export function FramedImage({ img, frame = 1.5, alt, sizes, priority, className, imgClassName, mode = "contain" }: { img: Img; frame?: number; alt: string; sizes: string; priority?: boolean; className?: string; imgClassName?: string; mode?: "contain" | "focus" }) {
  const r = ratio(img);
  const fits = Math.abs(r - frame) / frame < 0.14;
  const blur = img.blurDataUrl ?? undefined;
  if (fits || (mode === "focus" && r > frame)) {
    return <Image src={img.url} alt={alt} fill sizes={sizes} priority={priority} placeholder={blur ? "blur" : "empty"} blurDataURL={blur} className={cn("object-cover", imgClassName, className)} />;
  }
  if (mode === "focus") {
    return <Image src={img.url} alt={alt} fill sizes={sizes} priority={priority} placeholder={blur ? "blur" : "empty"} blurDataURL={blur} style={{ objectPosition: "50% 62%" }} className={cn("object-cover", imgClassName, className)} />;
  }
  return (
    <>
      <Image src={img.url} alt="" aria-hidden fill sizes="200px" quality={40} className={cn("scale-125 object-cover opacity-60 blur-2xl saturate-50", className)} />
      <div className="absolute inset-0 bg-black/40" />
      <Image src={img.url} alt={alt} fill sizes={sizes} priority={priority} placeholder={blur ? "blur" : "empty"} blurDataURL={blur} className={cn("object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,.6)]", imgClassName)} />
    </>
  );
}
