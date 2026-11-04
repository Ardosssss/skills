"use client";
import { useRef, useState } from "react";
import { images, usesPlaceholders, type Img } from "@/lib/images";
import { SectionHeading } from "./SectionHeading";

function Compare({ before, after, label }: { before: Img; after: Img; label: string }) {
  const [pos, setPos] = useState(50);
  const [focus, setFocus] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const update = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <figure>
      <div
        ref={box}
        className="relative aspect-[4/5] cursor-ew-resize touch-pan-y overflow-hidden rounded-[18px] bg-sand select-none"
        onPointerDown={(e) => {
          dragging.current = true;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          update(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && update(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={after.src} alt={after.alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" draggable={false} />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={before.src} alt={before.alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" draggable={false} />
        </div>
        <span className="absolute top-4 left-4 rounded-full bg-cream/90 px-3 py-1 text-[0.68rem] tracking-[0.2em] uppercase">Vorher</span>
        <span className="absolute top-4 right-4 rounded-full bg-cream/90 px-3 py-1 text-[0.68rem] tracking-[0.2em] uppercase">Nachher</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(pos)}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label={`${label}: Vorher-Nachher-Regler`}
          className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
          onFocus={(e) => setFocus(e.currentTarget.matches(":focus-visible"))}
          onBlur={() => setFocus(false)}
        />
        <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }} aria-hidden>
          <div className="absolute inset-y-0 -left-px w-[2px] bg-cream" />
          <div className={`absolute top-1/2 -left-6 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-sand bg-cream text-forest shadow-[var(--shadow-soft)] ${focus ? "outline-2 outline-offset-2 outline-forest" : ""}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
            </svg>
          </div>
        </div>
      </div>
      <figcaption className="mt-4 text-center font-serif text-lg tracking-[0.1em] uppercase">{label}</figcaption>
    </figure>
  );
}

export function BeforeAfter() {
  return (
    <section className="container-x py-20 md:py-28" id="vorher-nachher">
      <SectionHeading eyebrow="Vorher / Nachher" title="Ergebnisse, die man sieht" intro="Ziehe den Regler, um den Unterschied zu sehen." />
      <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-2">
        <Compare before={images.tattooBefore} after={images.tattooAfter} label="Tattooentfernung" />
        <Compare before={images.hairBefore} after={images.hairAfter} label="Haarentfernung" />
      </div>
      <p className="mx-auto mt-8 max-w-xl text-center text-sm text-muted">
        Ergebnisse sind individuell und hängen u. a. von Hauttyp, Haarfarbe, Tattoo-Farben und Anzahl Sitzungen ab.
        {usesPlaceholders && " Abbildungen: Beispielillustrationen – echte Kundenfotos folgen (nur mit Einwilligung)."}
      </p>
    </section>
  );
}
