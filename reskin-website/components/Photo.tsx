import Image from "next/image";
import type { Img } from "@/lib/images";

type Props = { img: Img; className?: string; sizes?: string; priority?: boolean; palm?: boolean };

/** Bild mit Next-Optimierung; SVG-Platzhalter werden direkt eingebunden. */
export function Photo({ img, className = "", sizes = "(min-width: 1024px) 50vw, 100vw", priority, palm }: Props) {
  const isSvg = img.src.endsWith(".svg");
  return (
    <div className={`relative overflow-hidden bg-sand ${className}`}>
      {isSvg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img.src} alt={img.alt} loading={priority ? "eager" : "lazy"} decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <Image src={img.src} alt={img.alt} fill sizes={sizes} priority={priority} className="object-cover" />
      )}
      {palm && !isSvg && <div className="palm-overlay" aria-hidden />}
    </div>
  );
}
