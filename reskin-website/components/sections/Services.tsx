import Link from "next/link";
import { images } from "@/lib/images";
import { formatChf } from "@/lib/time";
import type { Treatment } from "@/lib/types";
import { BookButton } from "../booking/BookButton";
import { IconArrow, IconCheck } from "../Icons";
import { Photo } from "../Photo";
import { Reveal } from "../Reveal";
import { SectionHeading } from "./SectionHeading";

const minPrice = (list: Treatment[]) => Math.min(...list.map((t) => t.price ?? Infinity));

export function Services({ treatments }: { treatments: Treatment[] }) {
  const hair = treatments.filter((t) => t.category === "haar");
  const tattoo = treatments.filter((t) => t.category === "tattoo");
  const cards = [
    {
      key: "haar" as const,
      eyebrow: "Diodenlaser",
      title: "Haarentfernung",
      img: images.haar,
      href: "/haarentfernung",
      from: minPrice(hair),
      benefits: ["Langfristig glatte Haut – ohne Rasierpickel", "Diodenlaser mit Kühlung, für viele Hauttypen", "Alle Zonen, für Frauen und Männer"],
    },
    {
      key: "tattoo" as const,
      eyebrow: "Laser",
      title: "Tattooentfernung",
      img: images.tattoo,
      href: "/tattooentfernung",
      from: minPrice(tattoo),
      benefits: ["Vollständig entfernen oder aufhellen", "Ideal als Vorbereitung für ein Cover-up", "Realistische Einschätzung vorab"],
    },
  ];
  return (
    <section className="container-x py-20 md:py-28" id="leistungen">
      <SectionHeading eyebrow="Leistungen" title="Was ich für dich tun kann" intro="Zwei Spezialgebiete, eine Haltung: sorgfältig, sicher und mit ehrlicher Einschätzung. Ergänzt durch klassische Kosmetik." />
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        {cards.map((c, i) => (
          <Reveal key={c.key} delay={i * 120} as="article" className="card group overflow-hidden">
            <Photo img={c.img} palm className="aspect-[5/4]" sizes="(min-width: 768px) 45vw, 100vw" />
            <div className="p-6 md:p-8">
              <p className="eyebrow">{c.eyebrow}</p>
              <h3 className="h-display mt-2 text-2xl md:text-[1.9rem]">{c.title}</h3>
              <ul className="mt-5 space-y-2.5">
                {c.benefits.map((b) => (
                  <li key={b} className="flex gap-3 text-[0.97rem]">
                    <IconCheck width={20} height={20} className="mt-0.5 shrink-0 text-forest" /> {b}
                  </li>
                ))}
              </ul>
              <p className="mt-6 font-serif text-xl tracking-[0.04em]">
                ab {formatChf(Number.isFinite(c.from) ? c.from : null)} <span className="font-sans text-sm text-muted">pro Sitzung</span>
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <BookButton category={c.key} className="btn btn-primary">
                  Buchen
                </BookButton>
                <Link href={c.href} className="btn btn-outline">
                  Mehr erfahren <IconArrow width={16} height={16} />
                </Link>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-sand bg-sand-soft/70 p-6 sm:flex-row sm:items-center md:px-8">
        <p className="text-[0.98rem]">
          <span className="font-serif text-xl tracking-[0.08em] uppercase">Kosmetik</span>
          <span className="block text-muted">Gesichtsbehandlungen, Brauen &amp; Wimpern – von der diplomierten Kosmetikerin.</span>
        </p>
        <BookButton category="kosmetik" className="btn btn-outline">
          Kosmetik buchen
        </BookButton>
      </Reveal>
    </section>
  );
}
