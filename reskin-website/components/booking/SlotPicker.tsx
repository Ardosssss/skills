"use client";
import { useEffect, useMemo, useState } from "react";
import { addDaysYmd, weekdayOfYmd, zurichParts } from "@/lib/time";
import { IconChevron } from "../Icons";

type Value = { date: string | null; time: string | null };
const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const WD = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function monthStart(ymd: string) {
  return ymd.slice(0, 8) + "01";
}
function monthEnd(ymd: string) {
  const [y, m] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}
function shiftMonth(ymd: string, d: number) {
  const [y, m] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + d, 1)).toISOString().slice(0, 10);
}

export function SlotPicker({ durationMin, value, onChange, token, refreshKey = 0 }: { durationMin: number; value: Value; onChange: (v: Value) => void; token?: string; refreshKey?: number }) {
  const today = useMemo(() => zurichParts(new Date()).ymd, []);
  const [month, setMonth] = useState(() => monthStart(value.date ?? today));
  const [slots, setSlots] = useState<Record<string, string[]> | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSlots(null);
    setErr(null);
    const from = month < today ? today : month;
    const to = monthEnd(month);
    const qs = new URLSearchParams({ from, to, duration: String(durationMin) });
    if (token) qs.set("token", token);
    fetch(`/api/slots?${qs}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.error) setErr(d.error);
        else setSlots(d.slots);
      })
      .catch(() => !cancelled && setErr("Termine konnten nicht geladen werden."));
    return () => {
      cancelled = true;
    };
  }, [month, durationMin, token, today, refreshKey]);

  const days = useMemo(() => {
    const first = month;
    const lead = (weekdayOfYmd(first) + 6) % 7;
    const list: (string | null)[] = Array(lead).fill(null);
    for (let d = first; d <= monthEnd(month); d = addDaysYmd(d, 1)) list.push(d);
    return list;
  }, [month]);

  const [y, m] = month.split("-").map(Number);
  const canPrev = month > monthStart(today);
  const times = value.date && slots ? slots[value.date] ?? [] : [];
  const morning = times.filter((t) => t < "12:00");
  const afternoon = times.filter((t) => t >= "12:00");
  const nothingThisMonth = slots && Object.keys(slots).length === 0;

  return (
    <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <button type="button" className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-sand disabled:opacity-30" disabled={!canPrev} onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Vorheriger Monat">
            <IconChevron className="rotate-180" />
          </button>
          <p className="font-serif text-xl tracking-[0.12em] uppercase" aria-live="polite">
            {MONTHS[m - 1]} {y}
          </p>
          <button type="button" className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-sand" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Nächster Monat">
            <IconChevron />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center" role="grid" aria-label="Kalender">
          {WD.map((d) => (
            <div key={d} className="pb-1 text-[0.7rem] tracking-[0.15em] text-muted uppercase" role="columnheader">
              {d}
            </div>
          ))}
          {days.map((d, i) => {
            if (!d) return <div key={`e${i}`} />;
            const available = Boolean(slots?.[d]?.length);
            const selected = value.date === d;
            return (
              <button
                key={d}
                type="button"
                disabled={!available}
                onClick={() => onChange({ date: d, time: null })}
                aria-pressed={selected}
                aria-label={`${Number(d.slice(8))}. ${MONTHS[m - 1]}${available ? ", freie Termine" : ", ausgebucht oder geschlossen"}`}
                className={`relative aspect-square rounded-full text-[0.95rem] transition-[background-color,color,transform] duration-200 active:scale-95 ${
                  selected
                    ? "bg-forest text-linen"
                    : available
                      ? "bg-cream text-ink hover:bg-sage/60"
                      : "cursor-default text-[#bdb4a9]"
                } ${d === today ? "font-medium" : ""}`}
              >
                {Number(d.slice(8))}
                {available && !selected && <span className="absolute bottom-[18%] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-forest/60" aria-hidden />}
              </button>
            );
          })}
        </div>
        {!slots && !err && <p className="mt-3 text-sm text-muted">Freie Termine werden geladen …</p>}
        {err && <p className="mt-3 text-sm text-alert">{err}</p>}
        {nothingThisMonth && (
          <p className="mt-3 text-sm text-muted">
            In diesem Monat ist leider nichts mehr frei.{" "}
            <button type="button" className="underline underline-offset-4" onClick={() => setMonth(shiftMonth(month, 1))}>
              Nächsten Monat ansehen
            </button>
          </p>
        )}
      </div>

      <div>
        <p className="eyebrow mb-3">Uhrzeit</p>
        {!value.date ? (
          <p className="rounded-xl border border-dashed border-taupe/50 p-5 text-sm text-muted">Wähle zuerst einen Tag – markierte Tage haben freie Termine.</p>
        ) : (
          <div className="space-y-4">
            {[
              ["Vormittag", morning],
              ["Nachmittag & Abend", afternoon],
            ].map(([label, list]) =>
              (list as string[]).length ? (
                <div key={label as string}>
                  <p className="mb-2 text-xs tracking-[0.12em] text-muted uppercase">{label}</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {(list as string[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => onChange({ date: value.date, time: t })}
                        aria-pressed={value.time === t}
                        className={`min-h-11 rounded-full border text-sm transition-[background-color,color,border-color,transform] duration-200 active:scale-95 ${
                          value.time === t ? "border-forest bg-forest text-linen" : "border-sand bg-cream hover:border-forest"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null,
            )}
          </div>
        )}
      </div>
    </div>
  );
}
