import Link from "next/link";
import { site } from "@/lib/site";
import { IconArrow } from "../Icons";
import { Reveal } from "../Reveal";
import { Gallery } from "./Gallery";

export function StudioTeaser() {
  return (
    <section className="container-x py-20 md:py-28" id="studio">
      <div className="grid gap-12 md:grid-cols-[1fr_1.6fr] md:gap-16">
        <Reveal className="md:sticky md:top-28 md:self-start">
          <p className="eyebrow mb-4">Das Studio</p>
          <h2 className="h-display text-[1.7rem] sm:text-3xl md:text-[2.5rem]">Ein Ort zum Ankommen</h2>
          <p className="mt-5 text-[1.02rem] leading-relaxed text-muted">
            Tageslicht, eine grüne Wand, ein weiches Bouclé-Sofa und viele Pflanzen: Im 1. Stock an der {site.address.street} in Ebikon wartet kein steriles Behandlungszimmer, sondern ein ruhiger Raum, in dem du dich wohlfühlen darfst.
          </p>
          <p className="mt-4 font-serif text-xl tracking-[0.04em] text-forest italic">«What if it all works out?»</p>
          <Link href="/studio" className="btn btn-outline mt-8">
            Studio ansehen <IconArrow width={16} height={16} />
          </Link>
        </Reveal>
        <Gallery />
      </div>
    </section>
  );
}
