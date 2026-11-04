import type { Metadata } from "next";
import { BookButton } from "@/components/booking/BookButton";
import { CtaBand } from "@/components/sections/CtaBand";
import { Pricing } from "@/components/sections/Pricing";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { getPublicTreatments } from "@/lib/db";
import { formatChf } from "@/lib/time";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Preise Laser-Haarentfernung & Tattooentfernung",
  description: "Transparente Preise in CHF für Laser-Haarentfernung (Einzelsitzung & 6er-Paket), Tattooentfernung nach Grösse und Kosmetik bei RE|SKIN in Ebikon.",
  alternates: { canonical: "/preise" },
};

export default async function PreisePage() {
  const treatments = await getPublicTreatments();
  const cosmetic = treatments.filter((t) => t.category === "kosmetik");
  return (
    <>
      <section className="container-x pt-12 pb-20 md:pt-20">
        <SectionHeading as="h1" eyebrow="Preise" title="Transparent & fair" intro="Alle Preise in CHF. Die erste Beratung inkl. Hautanalyse ist immer kostenlos. Bezahlen kannst du mit TWINT, Karte oder bar." />
        <Pricing treatments={treatments} />
      </section>
      <section className="bg-sand-soft/70 py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Kosmetik" title="Kosmetik" />
          <div className="card mx-auto max-w-3xl divide-y divide-sand">
            {cosmetic.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div>
                  <p>{t.name}</p>
                  <p className="text-xs text-muted">{t.description ? `${t.description} · ` : ""}ca. {t.durationMin} Min.</p>
                </div>
                <p className="whitespace-nowrap">{formatChf(t.price)}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <BookButton category="kosmetik" className="btn btn-outline">Kosmetik buchen</BookButton>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
