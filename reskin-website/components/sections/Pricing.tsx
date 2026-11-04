"use client";
import { useId, useState } from "react";
import { formatChf } from "@/lib/time";
import type { Treatment } from "@/lib/types";
import { BookButton } from "../booking/BookButton";

type Tab = "haar" | "tattoo";

export function Pricing({ treatments, initial = "haar" }: { treatments: Treatment[]; initial?: Tab }) {
  const [tab, setTab] = useState<Tab>(initial);
  const [gender, setGender] = useState<"frau" | "mann">("frau");
  const id = useId();
  const hair = treatments.filter((t) => t.category === "haar" && t.group === gender);
  const tattoo = treatments.filter((t) => t.category === "tattoo");
  const consult = treatments.find((t) => t.category === "beratung");

  return (
    <div>
      <div role="tablist" aria-label="Preislisten" className="mx-auto mb-10 flex w-fit rounded-full border border-sand bg-cream p-1">
        {(
          [
            ["haar", "Haarentfernung"],
            ["tattoo", "Tattooentfernung"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            role="tab"
            id={`${id}-tab-${k}`}
            aria-selected={tab === k}
            aria-controls={`${id}-panel-${k}`}
            onClick={() => setTab(k)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                const next = tab === "haar" ? "tattoo" : "haar";
                setTab(next);
                document.getElementById(`${id}-tab-${next}`)?.focus();
              }
            }}
            tabIndex={tab === k ? 0 : -1}
            className={`min-h-11 rounded-full px-5 text-[0.75rem] tracking-[0.16em] uppercase transition-colors duration-200 sm:px-7 ${tab === k ? "bg-forest text-linen" : "text-muted hover:text-ink"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "haar" && (
        <div role="tabpanel" id={`${id}-panel-haar`} aria-labelledby={`${id}-tab-haar`} className="step-in">
          <div className="mb-6 flex justify-center gap-6" role="radiogroup" aria-label="Preisliste für">
            {(["frau", "mann"] as const).map((g) => (
              <button key={g} role="radio" aria-checked={gender === g} onClick={() => setGender(g)} className={`border-b pb-1 text-sm tracking-[0.14em] uppercase transition-colors ${gender === g ? "border-forest text-forest" : "border-transparent text-muted hover:text-ink"}`}>
                {g === "frau" ? "Frauen" : "Männer"}
              </button>
            ))}
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-left text-[0.95rem]">
              <caption className="sr-only">Preise Haarentfernung {gender === "frau" ? "Frauen" : "Männer"}</caption>
              <thead>
                <tr className="border-b border-sand bg-sand-soft/70 text-[0.7rem] tracking-[0.16em] text-muted uppercase">
                  <th scope="col" className="px-4 py-4 font-normal sm:px-6">Zone</th>
                  <th scope="col" className="px-2 py-4 text-right font-normal">Einzelsitzung</th>
                  <th scope="col" className="relative px-4 py-4 text-right font-normal sm:px-6">
                    <span className="inline-flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
                      <span className="rounded-full bg-forest px-2 py-0.5 text-[0.6rem] tracking-[0.16em] text-linen">Beliebt</span>
                      Paket 6×
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {hair.map((t) => {
                  const save = t.price != null && t.pricePackage != null ? t.price * 6 - t.pricePackage : 0;
                  return (
                    <tr key={t.id} className="border-b border-sand/80 last:border-0">
                      <th scope="row" className="px-4 py-3.5 font-normal sm:px-6">
                        {t.name}
                        <span className="block text-xs text-muted">ca. {t.durationMin} Min.</span>
                      </th>
                      <td className="px-2 py-3.5 text-right whitespace-nowrap">{formatChf(t.price)}</td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap sm:px-6">
                        <span className="text-forest">{formatChf(t.pricePackage)}</span>
                        {save > 0 && <span className="block text-xs text-muted">spare {formatChf(save)}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-sm text-muted">Mehrere Zonen in einer Sitzung? Kein Problem – im Buchungstool summieren sich Dauer und Preis automatisch. Platzhalterpreise.</p>
          <div className="mt-8 text-center">
            <BookButton category="haar">Haarentfernung buchen</BookButton>
          </div>
        </div>
      )}

      {tab === "tattoo" && (
        <div role="tabpanel" id={`${id}-panel-tattoo`} aria-labelledby={`${id}-tab-tattoo`} className="step-in">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {tattoo.map((t) => (
              <div key={t.id} className="card flex flex-col items-center p-6 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full border border-taupe/50 font-serif text-2xl">{t.name}</span>
                <p className="mt-3 min-h-10 text-sm text-muted">{t.description}</p>
                <p className="mt-3 font-serif text-2xl">{formatChf(t.price)}</p>
                <p className="text-xs tracking-[0.1em] text-muted uppercase">pro Sitzung</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-sand bg-sand-soft/70 p-5 text-[0.95rem]">
              <p className="font-serif text-lg tracking-[0.08em] uppercase">Mehrere Sitzungen</p>
              <p className="mt-1 text-muted">Meist braucht es mehrere Sitzungen im Abstand von 6–8 Wochen. Wie viele, besprechen wir ehrlich in der Beratung.</p>
            </div>
            <div className="rounded-2xl border border-sage bg-sage/40 p-5 text-[0.95rem]">
              <p className="font-serif text-lg tracking-[0.08em] uppercase">Aufhellen für Cover-up</p>
              <p className="mt-1 text-muted">Du willst ein neues Tattoo darüber? Oft reichen wenige Sitzungen, um das alte Motiv genug aufzuhellen.</p>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <BookButton category="tattoo">Tattooentfernung buchen</BookButton>
            <BookButton category="beratung" className="btn btn-outline">
              {consult ? "Kostenlose Beratung" : "Beratung"}
            </BookButton>
          </div>
        </div>
      )}
    </div>
  );
}
