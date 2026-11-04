import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { CtaBand } from "@/components/sections/CtaBand";
import { Gallery } from "@/components/sections/Gallery";
import { PageHero } from "@/components/sections/PageHero";
import { Values } from "@/components/sections/Values";
import { images } from "@/lib/images";

export const metadata: Metadata = {
  title: "Das Studio in Ebikon",
  description: "Ein Ort zum Ankommen: das helle, ruhige Laser-Studio von RE|SKIN an der Zentralstrasse 10 in Ebikon – mit grüner Wand, Bouclé-Sofa und viel Tageslicht.",
  alternates: { canonical: "/studio" },
};

export default function StudioPage() {
  return (
    <>
      <PageHero
        eyebrow="Das Studio"
        title={<>Ein Ort<br /><span className="text-forest">zum Ankommen</span></>}
        intro={
          <>
            <p>Im 1. Stock an der Zentralstrasse 10 in Ebikon habe ich mir einen Raum geschaffen, in dem du durchatmen kannst: Tageslicht, Holzboden, eine tiefgrüne Wand, ein weiches Bouclé-Sofa und viele Pflanzen.</p>
            <p className="mt-3">Hier wird nichts im Akkord erledigt. Du bekommst Zeit, Ruhe und meine volle Aufmerksamkeit – von der ersten Beratung bis zur Nachsorge.</p>
          </>
        }
        img={images.studioLounge}
      />
      <section className="container-x pb-20 md:pb-28">
        <Gallery />
        <Reveal className="mt-14 text-center">
          <p className="font-serif text-3xl tracking-[0.04em] text-forest italic md:text-4xl">«What if it all works out?»</p>
          <p className="mt-3 text-sm tracking-[0.2em] text-muted uppercase">– an meiner Studiowand</p>
        </Reveal>
      </section>
      <Values />
      <CtaBand title="Komm vorbei und lern mich kennen" />
    </>
  );
}
