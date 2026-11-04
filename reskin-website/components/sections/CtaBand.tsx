import { site } from "@/lib/site";
import { BookButton } from "../booking/BookButton";
import { IconWhatsApp } from "../Icons";
import { Reveal } from "../Reveal";

export function CtaBand({ title = "Bereit für deine neue Haut?", text = "Starte mit einer kostenlosen Beratung – unverbindlich, ehrlich und in Ruhe." }: { title?: string; text?: string }) {
  return (
    <section className="container-x py-16 md:py-20">
      <Reveal className="relative overflow-hidden rounded-[24px] bg-sage/60 px-6 py-14 text-center md:px-16">
        <div className="palm-overlay !opacity-[0.1]" aria-hidden />
        <h2 className="h-display relative text-[1.6rem] sm:text-3xl md:text-4xl">{title}</h2>
        <p className="relative mx-auto mt-4 max-w-lg text-muted">{text}</p>
        <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <BookButton category="beratung">Kostenlose Beratung buchen</BookButton>
          <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
            <IconWhatsApp width={18} height={18} /> WhatsApp
          </a>
        </div>
      </Reveal>
    </section>
  );
}
