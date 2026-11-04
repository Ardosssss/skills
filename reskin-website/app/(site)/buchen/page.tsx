import type { Metadata } from "next";
import { BookingFlow } from "@/components/booking/BookingFlow";
import type { Category } from "@/lib/types";

export const metadata: Metadata = {
  title: "Termin online buchen",
  description: "Buche deinen Termin für Laser-Haarentfernung, Tattooentfernung, Kosmetik oder eine kostenlose Beratung bei RE|SKIN in Ebikon – rund um die Uhr online.",
  alternates: { canonical: "/buchen" },
};

const CATS: Category[] = ["beratung", "haar", "tattoo", "kosmetik"];

export default async function BuchenPage({ searchParams }: { searchParams: Promise<{ behandlung?: string }> }) {
  const { behandlung } = await searchParams;
  const initial = CATS.includes(behandlung as Category) ? (behandlung as Category) : undefined;
  return (
    <section className="container-x pt-10 pb-16 md:pt-16">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow mb-3">Online-Buchung</p>
        <h1 className="h-display mb-8 text-3xl md:text-4xl">Termin buchen</h1>
        <div className="card px-5 pt-6 md:px-8 md:pt-8">
          <BookingFlow initialCategory={initial} />
        </div>
      </div>
    </section>
  );
}
