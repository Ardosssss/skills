import type { Metadata } from "next";
import { Care } from "@/components/sections/Care";
import { CtaBand } from "@/components/sections/CtaBand";
import { Faq } from "@/components/sections/Faq";
import { SectionHeading } from "@/components/sections/SectionHeading";

export const metadata: Metadata = {
  title: "Ratgeber: Prep & Care für Laserbehandlungen",
  description: "Was ist vor der Haarlaser-Behandlung zu beachten? Wann darf nicht gelasert werden? Pflegetipps nach Tattooentfernung und Haarentfernung – plus FAQ.",
  alternates: { canonical: "/ratgeber" },
};

export default function RatgeberPage() {
  return (
    <>
      <section className="container-x pt-12 pb-20 md:pt-20 md:pb-28">
        <SectionHeading as="h1" eyebrow="Ratgeber · Prep & Care" title="Gut vorbereitet, gut gepflegt" intro="Mit der richtigen Vorbereitung und Pflege wird deine Behandlung sicherer, angenehmer und wirksamer. Hier findest du alles auf einen Blick." />
        <Care />
      </section>
      <section className="bg-sand-soft/70 py-20 md:py-28" id="faq">
        <div className="container-x">
          <SectionHeading eyebrow="FAQ" title="Häufige Fragen" />
          <Faq />
        </div>
      </section>
      <CtaBand title="Noch Fragen?" text="Schreib mir per WhatsApp oder buche eine kostenlose Beratung – ich nehme mir Zeit für dich." />
    </>
  );
}
