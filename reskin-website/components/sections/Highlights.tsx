import Link from "next/link";
import { HlCare, HlFeedback, HlHair, HlPrice, HlStudio, HlTattoo } from "../Icons";

const items = [
  { href: "/haarentfernung", label: "Haar Entf.", icon: HlHair },
  { href: "/studio", label: "Studio", icon: HlStudio },
  { href: "/#feedback", label: "Feedback", icon: HlFeedback },
  { href: "/tattooentfernung", label: "Tattoo", icon: HlTattoo },
  { href: "/preise", label: "Preise", icon: HlPrice },
  { href: "/ratgeber", label: "Prep & Care", icon: HlCare },
];

/** Schnellnavigation im Stil der Instagram-Highlights. */
export function Highlights() {
  return (
    <nav aria-label="Schnellnavigation" className="border-y border-sand bg-sand-soft/60">
      <ul className="no-scrollbar container-x flex snap-x gap-5 overflow-x-auto py-7 md:justify-center md:gap-10">
        {items.map(({ href, label, icon: Icon }) => (
          <li key={label} className="snap-start">
            <Link href={href} className="group flex w-[76px] flex-col items-center gap-2.5 text-center">
              <span className="grid h-[72px] w-[72px] place-items-center rounded-full border border-taupe/60 p-[3px] transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.04] group-active:scale-95">
                <span className="grid h-full w-full place-items-center rounded-full bg-sand text-forest">
                  <Icon width={28} height={28} />
                </span>
              </span>
              <span className="text-[0.7rem] tracking-[0.08em] whitespace-nowrap text-ink">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
