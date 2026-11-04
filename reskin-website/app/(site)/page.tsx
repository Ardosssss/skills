import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { Care } from "@/components/sections/Care";
import { Contact } from "@/components/sections/Contact";
import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/sections/Hero";
import { Highlights } from "@/components/sections/Highlights";
import { Pricing } from "@/components/sections/Pricing";
import { Process } from "@/components/sections/Process";
import { Reviews } from "@/components/sections/Reviews";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Services } from "@/components/sections/Services";
import { StudioTeaser } from "@/components/sections/StudioTeaser";
import { Values } from "@/components/sections/Values";
import { getPublicSettings, getPublicTreatments } from "@/lib/db";

export const revalidate = 300;

export default async function HomePage() {
  const [treatments, settings] = await Promise.all([getPublicTreatments(), getPublicSettings()]);
  return (
    <>
      <Hero />
      <Highlights />
      <Services treatments={treatments} />
      <Values />
      <Process />
      <BeforeAfter />
      <section id="preise" className="bg-sand-soft/70 py-20 md:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Preise" title="Transparent & fair" intro="Alle Preise in CHF inkl. Vorbehandlung und Pflege. Die erste Beratung ist immer kostenlos." />
          <Pricing treatments={treatments} />
        </div>
      </section>
      <StudioTeaser />
      <Reviews />
      <section id="ratgeber" className="container-x py-20 md:py-28">
        <SectionHeading eyebrow="Prep & Care" title="Gut vorbereitet, gut gepflegt" intro="Die wichtigsten Tipps aus meinen Story-Highlights – damit deine Behandlung sicher ist und das Ergebnis stimmt." />
        <Care />
      </section>
      <section id="faq" className="bg-sand-soft/70 py-20 md:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="FAQ" title="Häufige Fragen" />
          <Faq />
        </div>
      </section>
      <Contact settings={settings} />
    </>
  );
}
