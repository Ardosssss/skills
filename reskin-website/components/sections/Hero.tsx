import { images } from "@/lib/images";
import { site } from "@/lib/site";
import { BookButton } from "../booking/BookButton";
import { IconDiploma, IconShield, IconStar } from "../Icons";
import { Photo } from "../Photo";

export function Hero() {
  return (
    <section className="relative">
      <div className="container-x grid items-center gap-10 pt-6 pb-14 md:grid-cols-[1.05fr_1fr] md:gap-14 md:pt-10 md:pb-24">
        <div>
          <p className="eyebrow mb-5">Laser-Studio in Ebikon · Luzern</p>
          <h1 className="h-display text-[2.3rem] leading-[1.06] sm:text-5xl lg:text-[4.1rem]">
            Glatte Haut.
            <br />
            <span className="text-forest">Neue Freiheit.</span>
          </h1>
          <p className="mt-6 max-w-lg text-[1.08rem] leading-relaxed text-muted">
            Haarentfernung mit Diodenlaser &amp; Laser-Tattooentfernung in Ebikon – zertifiziert nach V-NISSG. Mit Zeit, Ruhe und einer ehrlichen Beratung.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <BookButton />
            <BookButton category="beratung" className="btn btn-outline">
              Kostenlose Beratung
            </BookButton>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-sand pt-6 text-[0.8rem] tracking-[0.06em] text-muted" aria-label="Vertrauen">
            <li className="flex items-center gap-2">
              <IconShield width={18} height={18} className="text-forest" /> V-NISSG-zertifiziert
            </li>
            <li className="flex items-center gap-2">
              <IconDiploma width={18} height={18} className="text-forest" /> Kosmetikerin mit Diplom
            </li>
            <li>
              <a href={site.googleReviews} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline-offset-4 hover:underline">
                <span className="flex text-forest" aria-hidden>
                  {Array.from({ length: 5 }, (_, i) => (
                    <IconStar key={i} width={14} height={14} />
                  ))}
                </span>
                {site.googleRating ? `${site.googleRating.value.toFixed(1)} auf Google (${site.googleRating.count})` : "Google-Bewertungen"}
              </a>
            </li>
          </ul>
        </div>
        <div className="relative">
          <Photo img={images.hero} priority palm className="aspect-[4/3.4] rounded-[18px] md:aspect-[4/5] md:rounded-[24px]" sizes="(min-width: 768px) 45vw, 100vw" />
          <div className="absolute -bottom-5 left-5 hidden rounded-2xl border border-sand bg-cream/95 px-5 py-4 shadow-[var(--shadow-soft)] backdrop-blur sm:block">
            <p className="font-serif text-lg tracking-[0.1em] uppercase">Deine Haut.</p>
            <p className="font-serif text-lg tracking-[0.1em] text-forest uppercase">Neu gedacht.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
