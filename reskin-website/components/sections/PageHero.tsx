import type { Img } from "@/lib/images";
import type { Category } from "@/lib/types";
import { BookButton } from "../booking/BookButton";
import { Photo } from "../Photo";

export function PageHero({ eyebrow, title, intro, img, category, cta = true }: { eyebrow: string; title: React.ReactNode; intro: React.ReactNode; img?: Img; category?: Category; cta?: boolean }) {
  return (
    <section className="container-x grid items-center gap-10 pt-8 pb-14 md:grid-cols-[1.1fr_1fr] md:gap-14 md:pt-14 md:pb-20">
      <div>
        <p className="eyebrow mb-5">{eyebrow}</p>
        <h1 className="h-display text-[2rem] leading-[1.1] sm:text-4xl lg:text-[3.2rem]">{title}</h1>
        <div className="mt-6 max-w-xl text-[1.06rem] leading-relaxed text-muted">{intro}</div>
        {cta && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <BookButton category={category} />
            <BookButton category="beratung" className="btn btn-outline">
              Kostenlose Beratung
            </BookButton>
          </div>
        )}
      </div>
      {img && <Photo img={img} priority palm className="aspect-[4/3] rounded-[20px] md:aspect-[4/4.4]" sizes="(min-width: 768px) 45vw, 100vw" />}
    </section>
  );
}
