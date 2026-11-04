import { steps } from "@/lib/content";
import { BookButton } from "../booking/BookButton";
import { Reveal } from "../Reveal";
import { SectionHeading } from "./SectionHeading";

export function Process() {
  return (
    <section className="container-x py-20 md:py-28">
      <SectionHeading eyebrow="Ablauf" title="In vier Schritten zu deinem Ziel" />
      <ol className="relative grid gap-8 md:grid-cols-4 md:gap-6">
        <span className="absolute top-7 right-[12%] left-[12%] hidden h-px bg-taupe/40 md:block" aria-hidden />
        {steps.map((s, i) => (
          <Reveal as="li" key={s.n} delay={i * 110} className="relative flex gap-5 md:flex-col md:items-center md:text-center">
            <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full border border-taupe/50 bg-linen font-serif text-xl text-forest">{s.n}</span>
            <div>
              <h3 className="font-serif text-xl tracking-[0.1em] uppercase">{s.title}</h3>
              <p className="mt-2 text-[0.96rem] text-muted">{s.text}</p>
            </div>
          </Reveal>
        ))}
      </ol>
      <Reveal className="mt-12 text-center">
        <BookButton category="beratung">Mit der Beratung starten</BookButton>
      </Reveal>
    </section>
  );
}
