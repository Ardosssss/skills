import { careCards, type CareCard } from "@/lib/content";
import { Reveal } from "../Reveal";

const tones = {
  light: "bg-cream text-ink border-sand",
  sand: "bg-sand text-ink border-sand",
  green: "bg-forest text-linen border-forest",
};

export function CareCardView({ card, index = 0 }: { card: CareCard; index?: number }) {
  const tone = card.tone ?? "light";
  return (
    <Reveal as="article" delay={(index % 4) * 90} className={`relative flex min-h-[420px] flex-col overflow-hidden rounded-[18px] border p-6 shadow-[var(--shadow-soft)] md:p-7 ${tones[tone]}`} >
      <div className={`palm-overlay ${tone === "green" ? "!opacity-[0.08] invert !mix-blend-screen" : "!opacity-[0.09]"}`} aria-hidden />
      <p className={`relative text-[0.66rem] tracking-[0.34em] uppercase ${tone === "green" ? "text-sage" : "text-muted"}`}>RE|SKIN · {card.kicker}</p>
      <h3 id={card.id} className="h-condensed relative mt-4 text-[1.55rem] md:text-[1.7rem]">{card.title}</h3>
      <ul className="relative mt-5 space-y-3">
        {card.items.map((it) => (
          <li key={it} className="flex gap-3 text-[0.93rem] leading-snug">
            <span className={`mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full ${tone === "green" ? "bg-sage" : "bg-forest"}`} aria-hidden />
            <span className={tone === "green" ? "text-linen/90" : ""}>{it}</span>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

export function Care({ ids }: { ids?: string[] }) {
  const cards = ids ? careCards.filter((c) => ids.includes(c.id)) : careCards;
  return (
    <div className={`grid gap-5 sm:grid-cols-2 ${cards.length >= 4 ? "lg:grid-cols-4" : cards.length === 3 ? "lg:grid-cols-3" : ""}`}>
      {cards.map((c, i) => (
        <CareCardView key={c.id} card={c} index={i} />
      ))}
    </div>
  );
}
