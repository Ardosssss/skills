import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { Care } from "@/components/sections/Care";
import { CtaBand } from "@/components/sections/CtaBand";
import { Faq } from "@/components/sections/Faq";
import { PageHero } from "@/components/sections/PageHero";
import { Pricing } from "@/components/sections/Pricing";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { getPublicTreatments } from "@/lib/db";
import { images } from "@/lib/images";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Laser-Tattooentfernung in Ebikon & Luzern",
  description: "Tattoo entfernen oder aufhellen für ein Cover-up: Laser-Tattooentfernung in Ebikon bei Luzern. Ehrliche Beratung, Preise nach Grösse, V-NISSG-zertifiziert.",
  alternates: { canonical: "/tattooentfernung" },
};

const colors = [
  { c: "#1E2A33", t: "Schwarz & Dunkelblau", d: "sprechen am besten an" },
  { c: "#A63A32", t: "Rot, Orange, Lila", d: "meist gut aufhellbar" },
  { c: "#3F7F6A", t: "Grün & Türkis", d: "hartnäckiger" },
  { c: "#E1C24A", t: "Gelb & helle Töne", d: "oft schwierig" },
];

const goals = [
  { n: "01", t: "Komplett entfernen", d: "Für alle, die ihr Tattoo nicht mehr sehen möchten. Braucht Geduld – das Ergebnis lohnt sich." },
  { n: "02", t: "Aufhellen für Cover-up", d: "Das alte Motiv wird so weit aufgehellt, dass dein Tätowierer freie Hand für das neue hat." },
  { n: "03", t: "Teilweise korrigieren", d: "Einzelne Linien, Schriftzüge oder misslungene Stellen gezielt entfernen." },
];

export default async function TattooPage() {
  const treatments = await getPublicTreatments();
  return (
    <>
      <PageHero
        eyebrow="Laser-Tattooentfernung"
        title={<>Neuer Anfang.<br /><span className="text-forest">Deine Haut.</span></>}
        intro="Ob das Tattoo ganz verschwinden oder Platz für ein Cover-up machen soll: Ich schaue mir dein Motiv genau an und sage dir ehrlich, was möglich ist – und was nicht."
        img={images.tattoo}
        category="tattoo"
      />
      <section className="container-x pb-20 md:pb-28">
        <SectionHeading eyebrow="Dein Ziel" title="Entfernen, aufhellen, korrigieren" />
        <div className="grid gap-6 md:grid-cols-3">
          {goals.map((g, i) => (
            <Reveal key={g.n} delay={i * 100} className="border-t border-taupe/40 pt-6">
              <h3 className="flex items-baseline gap-3 font-serif text-2xl tracking-[0.08em] uppercase"><span className="text-taupe">{g.n}</span> {g.t}</h3>
              <p className="mt-3 text-muted">{g.d}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="bg-sand-soft/70 py-20 md:py-24">
        <div className="container-x">
          <SectionHeading eyebrow="Farben" title="Nicht jede Farbe ist gleich" intro="Der Laser zerkleinert die Farbpigmente, die dein Körper danach selbst abbaut. Wie gut das gelingt, hängt stark von der Farbe ab." />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {colors.map((c) => (
              <li key={c.t} className="card flex items-center gap-4 p-5">
                <span className="h-10 w-10 shrink-0 rounded-full" style={{ background: c.c }} aria-hidden />
                <span><span className="block">{c.t}</span><span className="text-sm text-muted">{c.d}</span></span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-sm text-muted">Meist sind mehrere Sitzungen im Abstand von 6–8 Wochen nötig. Ergebnisse können individuell variieren.</p>
        </div>
      </section>
      <BeforeAfter />
      <section className="bg-sand-soft/70 py-20 md:py-28" id="preise">
        <div className="container-x">
          <SectionHeading eyebrow="Preise" title="Preise Tattooentfernung" intro="Pro Sitzung, nach Grösse des Tattoos." />
          <Pricing treatments={treatments} initial="tattoo" />
        </div>
      </section>
      <section className="container-x py-20 md:py-28">
        <SectionHeading eyebrow="Prep & Care" title="Gut zu wissen" />
        <Care ids={["keine-behandlung", "nach-tattoo"]} />
      </section>
      <section className="bg-sand-soft/70 py-20 md:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="FAQ" title="Fragen zur Tattooentfernung" />
          <Faq tag="tattoo" />
        </div>
      </section>
      <CtaBand title="Lass uns dein Tattoo anschauen" />
    </>
  );
}
