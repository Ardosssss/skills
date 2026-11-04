import { gallery } from "@/lib/images";
import { Photo } from "../Photo";
import { Reveal } from "../Reveal";

export function Gallery({ limit }: { limit?: number }) {
  const items = limit ? gallery.slice(0, limit) : gallery;
  return (
    <div className="columns-2 gap-3 md:columns-3 md:gap-5">
      {items.map((img, i) => (
        <Reveal key={img.src + i} delay={(i % 3) * 90} className="mb-3 break-inside-avoid md:mb-5">
          <Photo img={img} className={`${img.tall ? "aspect-[3/4.4]" : "aspect-[4/5]"} rounded-[14px]`} sizes="(min-width: 768px) 33vw, 50vw" />
        </Reveal>
      ))}
    </div>
  );
}
