import { Reveal } from "../Reveal";

export function SectionHeading({ eyebrow, title, intro, align = "center", light = false, as: H = "h2" }: { eyebrow?: string; title: React.ReactNode; intro?: React.ReactNode; align?: "center" | "left"; light?: boolean; as?: "h1" | "h2" }) {
  return (
    <Reveal className={`mb-12 md:mb-16 ${align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}`}>
      {eyebrow && <p className={`eyebrow mb-4 ${light ? "!text-sage" : ""}`}>{eyebrow}</p>}
      <H className={`h-display text-[1.7rem] sm:text-3xl md:text-[2.5rem] ${light ? "text-linen" : ""}`}>{title}</H>
      {intro && <div className={`mt-5 text-[1.02rem] leading-relaxed ${light ? "text-linen/80" : "text-muted"}`}>{intro}</div>}
    </Reveal>
  );
}
