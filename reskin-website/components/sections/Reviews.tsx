import { placeholderReviews, reviews } from "@/lib/content";
import { site } from "@/lib/site";
import { IconArrow, IconStar } from "../Icons";
import { Reveal } from "../Reveal";
import { SectionHeading } from "./SectionHeading";

export function Reviews() {
  return (
    <section id="feedback" className="relative overflow-hidden bg-forest py-20 text-linen md:py-28">
      <div className="absolute inset-0 bg-[url('/textures/palm.svg')] bg-cover opacity-[0.06] invert" aria-hidden />
      <div className="container-x relative">
        <SectionHeading light eyebrow="Feedback" title="Was Kundinnen & Kunden sagen" />
        <ul className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 lg:grid-cols-4">
          {reviews.map((r, i) => (
            <Reveal as="li" key={r.name} delay={i * 90} className="w-[82%] shrink-0 snap-center rounded-2xl border border-linen/15 bg-linen/[0.06] p-6 md:w-auto">
              <div className="flex gap-0.5 text-sage" aria-label={`${r.stars} von 5 Sternen`}>
                {Array.from({ length: r.stars }, (_, k) => (
                  <IconStar key={k} width={16} height={16} />
                ))}
              </div>
              <blockquote className="mt-4 text-[0.98rem] leading-relaxed text-linen/90">«{r.text.replace(/^Platzhalter: /, "")}»</blockquote>
              <p className="mt-5 font-serif text-lg tracking-[0.1em] uppercase">{r.name}</p>
              <p className="text-xs tracking-[0.12em] text-sage uppercase">{r.treatment}</p>
            </Reveal>
          ))}
        </ul>
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <a href={site.googleReviews} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light">
            Alle Bewertungen auf Google <IconArrow width={16} height={16} />
          </a>
          {placeholderReviews && <p className="text-xs text-linen/50">Hinweis: Beispieltexte – werden durch echte Google-Bewertungen ersetzt.</p>}
        </div>
      </div>
    </section>
  );
}
