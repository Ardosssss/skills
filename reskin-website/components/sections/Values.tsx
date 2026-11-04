import { values } from "@/lib/content";
import { Reveal } from "../Reveal";
import { SectionHeading } from "./SectionHeading";

export function Values() {
  return (
    <section className="relative overflow-hidden bg-sand-soft/70 py-20 md:py-28">
      <div className="palm-overlay !opacity-[0.07]" aria-hidden />
      <div className="container-x relative">
        <SectionHeading eyebrow="Warum RE|SKIN" title={<>Qualität hat ihren Grund.<br className="hidden sm:block" /> Aber welchen?</>} />
        <ol className="grid gap-x-12 gap-y-2 md:grid-cols-2">
          {values.map((v, i) => (
            <Reveal as="li" key={v.n} delay={(i % 2) * 100} className="border-t border-taupe/40 py-7">
              <h3 className="flex items-baseline gap-4 font-serif text-[1.35rem] tracking-[0.1em] uppercase md:text-2xl">
                <span className="text-taupe">{v.n}</span>
                <span className="text-taupe/70" aria-hidden>|</span>
                <span>{v.title}</span>
              </h3>
              <p className="mt-3 pl-0 text-[0.98rem] text-muted md:pl-[4.2rem]">{v.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
