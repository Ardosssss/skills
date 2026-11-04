import type { Metadata } from "next";
import { IconCheck } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { Care } from "@/components/sections/Care";
import { CtaBand } from "@/components/sections/CtaBand";
import { Faq } from "@/components/sections/Faq";
import { PageHero } from "@/components/sections/PageHero";
import { Pricing } from "@/components/sections/Pricing";
import { Process } from "@/components/sections/Process";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { getPublicTreatments } from "@/lib/db";
import { images } from "@/lib/images";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Laser Haarentfernung mit Diodenlaser in Ebikon & Luzern",
  description: "Dauerhaft glatte Haut mit dem Diodenlaser: Laser-Haarentfernung für Frauen und Männer in Ebikon bei Luzern. V-NISSG-zertifiziert, kostenlose Beratung, Paketpreise.",
  alternates: { canonical: "/haarentfernung" },
};

const facts = [
  { t: "So funktioniert's", d: "Das Licht des Diodenlasers wird vom Pigment im Haar aufgenommen und in Wärme umgewandelt. So wird die Haarwurzel gezielt geschwächt – die umliegende Haut wird dabei gekühlt und geschont." },
  { t: "Für wen?", d: "Für Frauen und Männer und viele Hauttypen. Am besten wirkt die Behandlung bei dunklen Haaren; sehr helle, rote oder graue Haare sprechen meist kaum an." },
  { t: "Wie oft?", d: "Weil Haare in unterschiedlichen Wachstumsphasen sind, braucht es meist 6–10 Sitzungen im Abstand von 4–8 Wochen. Ergebnisse können individuell variieren." },
];

export default async function HaarPage() {
  const treatments = await getPublicTreatments();
  return (
    <>
      <PageHero
        eyebrow="Haarentfernung · Diodenlaser"
        title={<>Glatte Haut.<br /><span className="text-forest">Ohne Rasierer.</span></>}
        intro="Schluss mit Rasierpickeln, Stoppeln und Wachsterminen: Mit dem Diodenlaser reduzieren wir deine Haare Schritt für Schritt – sanft, sicher und mit ehrlicher Einschätzung von Anfang an."
        img={images.haar}
        category="haar"
      />
      <section className="bg-sand-soft/70 py-20 md:py-24">
        <div className="container-x grid gap-6 md:grid-cols-3">
          {facts.map((f, i) => (
            <Reveal key={f.t} delay={i * 100} className="card p-7">
              <h2 className="font-serif text-2xl tracking-[0.08em] uppercase">{f.t}</h2>
              <p className="mt-3 text-muted">{f.d}</p>
            </Reveal>
          ))}
        </div>
        <ul className="container-x mt-10 grid gap-3 text-[0.98rem] sm:grid-cols-2 lg:grid-cols-4">
          {["Diodenlaser mit Kontaktkühlung", "Alle Körperzonen", "Paket 6 Sitzungen ca. 20 % günstiger", "Zertifiziert nach V-NISSG"].map((b) => (
            <li key={b} className="flex items-center gap-3"><IconCheck className="shrink-0 text-forest" /> {b}</li>
          ))}
        </ul>
      </section>
      <Process />
      <section className="bg-sand-soft/70 py-20 md:py-28" id="preise">
        <div className="container-x">
          <SectionHeading eyebrow="Preise" title="Preise Haarentfernung" intro="Einzelsitzung oder Paket mit 6 Sitzungen – du entscheidest." />
          <Pricing treatments={treatments} initial="haar" />
        </div>
      </section>
      <section className="container-x py-20 md:py-28">
        <SectionHeading eyebrow="Prep & Care" title="Vor & nach der Behandlung" />
        <Care ids={["vor-haarlaser", "keine-behandlung", "nach-haar"]} />
      </section>
      <section className="bg-sand-soft/70 py-20 md:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="FAQ" title="Fragen zur Haarentfernung" />
          <Faq tag="haar" />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
