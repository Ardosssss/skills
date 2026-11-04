"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { categoryLabels, contraindications } from "@/lib/catalog";
import { addDaysYmd, formatChf, formatDateLong, formatTime, weekdayOfYmd, zurichParts, zurichToDate } from "@/lib/time";
import type { Blocker, Booking, BookingStatus } from "@/lib/types";
import { IconChevron, IconClose } from "../Icons";

const STATUS: Record<BookingStatus, { label: string; cls: string }> = {
  bestaetigt: { label: "Bestätigt", cls: "bg-forest text-linen border-forest" },
  erledigt: { label: "Erledigt", cls: "bg-sage text-ink border-sage" },
  no_show: { label: "No-Show", cls: "bg-[#E9CFC6] text-alert border-[#E9CFC6]" },
  storniert: { label: "Storniert", cls: "bg-sand text-muted border-sand line-through" },
};

const HOUR_START = 7;
const HOUR_END = 21;
const PX_PER_MIN = 1.1;
const WD = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function mondayOf(ymd: string) {
  return addDaysYmd(ymd, -((weekdayOfYmd(ymd) + 6) % 7));
}

export function AdminBookings() {
  const today = useMemo(() => zurichParts(new Date()).ymd, []);
  const [view, setView] = useState<"woche" | "liste">("woche");
  const [weekStart, setWeekStart] = useState(() => mondayOf(today));
  const [listRange, setListRange] = useState<"kommend" | "vergangen">("kommend");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "alle">("alle");
  const [selected, setSelected] = useState<Booking | null>(null);

  const range = useMemo(() => {
    if (view === "woche") return { from: zurichToDate(weekStart, "00:00").toISOString(), to: zurichToDate(addDaysYmd(weekStart, 7), "00:00").toISOString() };
    const now = new Date();
    return listRange === "kommend"
      ? { from: now.toISOString(), to: new Date(now.getTime() + 180 * 86400_000).toISOString() }
      : { from: new Date(now.getTime() - 180 * 86400_000).toISOString(), to: now.toISOString() };
  }, [view, weekStart, listRange]);

  const load = useCallback(async () => {
    setLoading(true);
    const [b, bl] = await Promise.all([
      fetch(`/api/admin/bookings?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`).then((r) => r.json()),
      fetch(`/api/admin/blockers`).then((r) => r.json()),
    ]);
    setBookings(b.bookings ?? []);
    setBlockers(bl.blockers ?? []);
    setLoading(false);
  }, [range]);
  useEffect(() => {
    load();
  }, [load]);

  const filtered = bookings
    .filter((b) => statusFilter === "alle" || b.status === statusFilter)
    .filter((b) => !query || `${b.firstName} ${b.lastName} ${b.email} ${b.phone}`.toLowerCase().includes(query.toLowerCase()));
  const sorted = listRange === "vergangen" && view === "liste" ? [...filtered].reverse() : filtered;

  const upcoming = bookings.filter((b) => b.status === "bestaetigt").length;
  const flagged = bookings.filter((b) => b.healthFlagged && b.status === "bestaetigt").length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h-display text-2xl md:text-3xl">Buchungen</h1>
          <p className="mt-1 text-sm text-muted">
            {loading ? "Lädt …" : `${upcoming} bestätigt im Zeitraum`}
            {flagged > 0 && <span className="ml-2 rounded-full bg-[#F3E6E1] px-2 py-0.5 text-alert">{flagged} mit Gesundheitshinweis</span>}
          </p>
        </div>
        <div className="flex rounded-full border border-sand bg-cream p-1">
          {(["woche", "liste"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`min-h-10 rounded-full px-5 text-sm transition-colors ${view === v ? "bg-forest text-linen" : "text-muted"}`}>
              {v === "woche" ? "Kalender" : "Liste"}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        {view === "woche" ? (
          <div className="flex items-center gap-2">
            <button className="grid h-10 w-10 place-items-center rounded-full border border-sand bg-cream" onClick={() => setWeekStart(addDaysYmd(weekStart, -7))} aria-label="Vorherige Woche">
              <IconChevron className="rotate-180" width={18} />
            </button>
            <button className="min-h-10 rounded-full border border-sand bg-cream px-4 text-sm" onClick={() => setWeekStart(mondayOf(today))}>Heute</button>
            <button className="grid h-10 w-10 place-items-center rounded-full border border-sand bg-cream" onClick={() => setWeekStart(addDaysYmd(weekStart, 7))} aria-label="Nächste Woche">
              <IconChevron width={18} />
            </button>
            <span className="ml-2 text-sm">
              {formatDateLong(weekStart + "T12:00:00Z").replace(/^\w+, /, "")} – {formatDateLong(addDaysYmd(weekStart, 6) + "T12:00:00Z").replace(/^\w+, /, "")}
            </span>
          </div>
        ) : (
          <>
            <select className="field !min-h-10 w-auto !py-1.5" value={listRange} onChange={(e) => setListRange(e.target.value as typeof listRange)} aria-label="Zeitraum">
              <option value="kommend">Kommende 6 Monate</option>
              <option value="vergangen">Letzte 6 Monate</option>
            </select>
            <select className="field !min-h-10 w-auto !py-1.5" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} aria-label="Status">
              <option value="alle">Alle Status</option>
              {Object.entries(STATUS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <input className="field !min-h-10 max-w-xs !py-1.5" placeholder="Suche Name, E-Mail, Telefon" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Suche" />
          </>
        )}
      </div>

      {view === "woche" ? (
        <WeekGrid weekStart={weekStart} today={today} bookings={bookings} blockers={blockers} onSelect={setSelected} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-sand bg-sand-soft/70 text-xs tracking-[0.1em] text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-normal">Termin</th>
                <th className="px-4 py-3 font-normal">Kunde</th>
                <th className="px-4 py-3 font-normal">Behandlung</th>
                <th className="px-4 py-3 font-normal">Preis</th>
                <th className="px-4 py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((b) => (
                <tr key={b.id} className="cursor-pointer border-b border-sand/70 last:border-0 hover:bg-sand-soft/60" onClick={() => setSelected(b)}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDateLong(b.startAt)}
                    <span className="block text-xs text-muted">{formatTime(b.startAt)}–{formatTime(b.endAt)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-left underline-offset-4 hover:underline" onClick={() => setSelected(b)}>{b.firstName} {b.lastName}</button>
                    {b.healthFlagged && <span className="ml-2 rounded-full bg-[#F3E6E1] px-2 py-0.5 text-[0.7rem] text-alert">Gesundheit</span>}
                    <span className="block text-xs text-muted">{b.phone}</span>
                  </td>
                  <td className="px-4 py-3">
                    {categoryLabels[b.category]}
                    <span className="block text-xs text-muted">{b.items.map((i) => i.name).join(", ")}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatChf(b.priceTotal)}</td>
                  <td className="px-4 py-3"><StatusBadge s={b.status} /></td>
                </tr>
              ))}
              {!loading && sorted.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-muted">Keine Buchungen gefunden.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <BookingDrawer
          booking={selected}
          onClose={() => setSelected(null)}
          onChange={(b) => {
            setSelected(b);
            setBookings((list) => list.map((x) => (x.id === b.id ? b : x)));
          }}
        />
      )}
    </div>
  );
}

function StatusBadge({ s }: { s: BookingStatus }) {
  return <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs ${STATUS[s].cls}`}>{STATUS[s].label}</span>;
}

function WeekGrid({ weekStart, today, bookings, blockers, onSelect }: { weekStart: string; today: string; bookings: Booking[]; blockers: Blocker[]; onSelect: (b: Booking) => void }) {
  const days = Array.from({ length: 7 }, (_, i) => addDaysYmd(weekStart, i));
  const height = (HOUR_END - HOUR_START) * 60 * PX_PER_MIN;
  const minsOf = (iso: string) => {
    const p = zurichParts(new Date(iso));
    return p.hour * 60 + p.minute;
  };
  return (
    <div className="card overflow-x-auto">
      <div className="grid min-w-[860px] grid-cols-[56px_repeat(7,1fr)]">
        <div className="border-b border-sand" />
        {days.map((d, i) => (
          <div key={d} className={`border-b border-l border-sand px-2 py-2 text-center text-sm ${d === today ? "bg-sage/40" : ""}`}>
            <span className="text-xs tracking-[0.12em] text-muted uppercase">{WD[i]}</span> <span className={d === today ? "font-medium" : ""}>{Number(d.slice(8))}.{Number(d.slice(5, 7))}.</span>
          </div>
        ))}
        <div className="relative" style={{ height }}>
          {Array.from({ length: HOUR_END - HOUR_START }, (_, h) => (
            <span key={h} className="absolute right-2 -translate-y-1/2 text-[0.7rem] text-muted" style={{ top: h * 60 * PX_PER_MIN }}>
              {h > 0 ? `${HOUR_START + h}:00` : ""}
            </span>
          ))}
        </div>
        {days.map((d) => {
          const dayStart = zurichToDate(d, "00:00").getTime();
          const dayEnd = zurichToDate(addDaysYmd(d, 1), "00:00").getTime();
          const dayBookings = bookings.filter((b) => b.status !== "storniert" && zurichParts(new Date(b.startAt)).ymd === d);
          const dayBlockers = blockers.filter((bl) => new Date(bl.startAt).getTime() < dayEnd && new Date(bl.endAt).getTime() > dayStart);
          return (
            <div key={d} className="relative border-l border-sand" style={{ height }}>
              {Array.from({ length: HOUR_END - HOUR_START }, (_, h) => (
                <div key={h} className="absolute inset-x-0 border-t border-sand/60" style={{ top: h * 60 * PX_PER_MIN }} />
              ))}
              {dayBlockers.map((bl) => {
                const s = Math.max(new Date(bl.startAt).getTime(), dayStart);
                const e = Math.min(new Date(bl.endAt).getTime(), dayEnd);
                const top = Math.max(0, ((s - dayStart) / 60000 - HOUR_START * 60) * PX_PER_MIN);
                const bottom = Math.min(height, ((e - dayStart) / 60000 - HOUR_START * 60) * PX_PER_MIN);
                if (bottom <= top) return null;
                return (
                  <div key={bl.id} className="absolute inset-x-1 rounded-md border border-dashed border-taupe bg-[repeating-linear-gradient(135deg,#efeae3,#efeae3_6px,#e7e1d8_6px,#e7e1d8_12px)] p-1 text-[0.7rem] text-muted" style={{ top, height: bottom - top }}>
                    {bl.kind === "ferien" ? "Ferien" : "Blocker"}{bl.reason ? `: ${bl.reason}` : ""}
                  </div>
                );
              })}
              {dayBookings.map((b) => {
                const top = (minsOf(b.startAt) - HOUR_START * 60) * PX_PER_MIN;
                const h = Math.max(22, b.durationMin * PX_PER_MIN);
                return (
                  <button
                    key={b.id}
                    onClick={() => onSelect(b)}
                    className={`absolute inset-x-1 overflow-hidden rounded-md border px-1.5 py-1 text-left text-[0.72rem] leading-tight shadow-sm transition-transform active:scale-[0.98] ${STATUS[b.status].cls}`}
                    style={{ top, height: h }}
                  >
                    <span className="font-medium">{formatTime(b.startAt)} {b.firstName} {b.lastName.charAt(0)}.</span>
                    {b.healthFlagged && <span className="ml-1" title="Gesundheitshinweis">⚠︎</span>}
                    <span className="block truncate opacity-80">{b.items.map((i) => i.name).join(", ")}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BookingDrawer({ booking: b, onClose, onChange }: { booking: Booking; onClose: () => void; onChange: (b: Booking) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [note, setNote] = useState("");
  const [noteState, setNoteState] = useState<"idle" | "saving" | "saved">("idle");
  const [history, setHistory] = useState<Booking[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    ref.current?.showModal();
  }, []);
  useEffect(() => {
    setNoteState("idle");
    fetch(`/api/admin/notes?email=${encodeURIComponent(b.email)}`).then((r) => r.json()).then((d) => setNote(d.note?.note ?? ""));
    fetch(`/api/admin/bookings?email=${encodeURIComponent(b.email)}`).then((r) => r.json()).then((d) => setHistory(d.bookings ?? []));
  }, [b.email]);

  async function setStatus(status: BookingStatus) {
    setBusy(true);
    const r = await fetch(`/api/admin/bookings/${b.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const d = await r.json();
    setBusy(false);
    if (r.ok) onChange(d.booking);
  }
  async function saveNote() {
    setNoteState("saving");
    await fetch(`/api/admin/notes`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: b.email, note }) });
    setNoteState("saved");
  }

  const details: [string, string][] = [];
  if (b.details.gender) details.push(["Preisliste", b.details.gender === "frau" ? "Frauen" : "Männer"]);
  if (b.details.package !== undefined) details.push(["Abrechnung", b.details.package ? "Paket 6 Sitzungen" : "Einzelsitzung"]);
  if (b.details.tattooColors) details.push(["Farben", b.details.tattooColors]);
  if (b.details.coverUp) details.push(["Ziel", "Aufhellen für Cover-up"]);
  if (b.details.consultTopic) details.push(["Thema", b.details.consultTopic]);

  return (
    <dialog ref={ref} className="sheet" onClose={onClose} aria-label={`Buchung ${b.firstName} ${b.lastName}`}>
      <div className="flex h-full justify-end" onClick={(e) => e.target === e.currentTarget && ref.current?.close()}>
        <div className="sheet-panel flex h-full w-full max-w-xl flex-col overflow-y-auto bg-linen">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-sand bg-linen px-6 py-4">
            <div>
              <p className="font-serif text-2xl tracking-[0.04em]">{b.firstName} {b.lastName}</p>
              <StatusBadge s={b.status} />
            </div>
            <button className="grid h-11 w-11 place-items-center rounded-full hover:bg-sand" onClick={() => ref.current?.close()} aria-label="Schliessen">
              <IconClose />
            </button>
          </div>
          <div className="space-y-6 px-6 py-6 text-sm">
            <section>
              <p className="eyebrow mb-2">Termin</p>
              <p className="text-base">{formatDateLong(b.startAt)}, {formatTime(b.startAt)}–{formatTime(b.endAt)} Uhr</p>
              <p className="mt-1">{categoryLabels[b.category]}: {b.items.map((i) => i.name).join(", ")}</p>
              <p className="mt-1 text-muted">ca. {b.durationMin} Min. · {formatChf(b.priceTotal)}</p>
              {details.length > 0 && (
                <dl className="mt-3 grid grid-cols-[110px_1fr] gap-y-1">
                  {details.map(([k, v]) => (
                    <div key={k} className="contents"><dt className="text-muted">{k}</dt><dd>{v}</dd></div>
                  ))}
                </dl>
              )}
            </section>

            <section>
              <p className="eyebrow mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(STATUS) as BookingStatus[]).map((s) => (
                  <button key={s} disabled={busy || b.status === s} onClick={() => setStatus(s)} className={`min-h-10 rounded-full border px-4 text-sm transition-colors disabled:cursor-default ${b.status === s ? STATUS[s].cls : "border-sand bg-cream hover:border-forest"}`}>
                    {STATUS[s].label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted">Statusänderungen hier lösen keine E-Mail an die Kundin/den Kunden aus.</p>
            </section>

            <section>
              <p className="eyebrow mb-2">Kontakt</p>
              <p><a className="underline underline-offset-4" href={`mailto:${b.email}`}>{b.email}</a></p>
              <p><a className="underline underline-offset-4" href={`tel:${b.phone.replace(/\s/g, "")}`}>{b.phone}</a></p>
              {b.note && <p className="mt-3 rounded-xl bg-cream p-3 whitespace-pre-wrap">«{b.note}»</p>}
            </section>

            {(b.category === "haar" || b.category === "tattoo") && (
              <section className={`rounded-2xl border p-4 ${b.healthFlagged ? "border-[#E2B9AC] bg-[#F7ECE8]" : "border-sand bg-cream"}`}>
                <p className="eyebrow mb-2">Gesundheitsfragen (vertraulich)</p>
                <ul className="space-y-1">
                  {contraindications.map((c) => (
                    <li key={c.key} className={`flex gap-2 ${b.health[c.key] ? "font-medium text-alert" : "text-muted"}`}>
                      <span className="w-8 shrink-0">{b.health[c.key] ? "Ja" : "Nein"}</span> {c.label}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {b.photoKey && (
              <section>
                <p className="eyebrow mb-2">Tattoo-Foto</p>
                <a href={`/api/admin/photo/${b.photoKey}`} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/api/admin/photo/${b.photoKey}`} alt="Vom Kunden hochgeladenes Tattoo-Foto" className="max-h-72 rounded-xl border border-sand object-contain" />
                </a>
              </section>
            )}

            <section>
              <label className="eyebrow mb-2 block" htmlFor="cust-note">Kunden-Notizen (nur intern)</label>
              <textarea id="cust-note" rows={5} className="field" value={note} onChange={(e) => (setNote(e.target.value), setNoteState("idle"))} placeholder="z. B. Hauttyp, Laser-Einstellungen, Reaktionen, Vorlieben …" />
              <div className="mt-2 flex items-center gap-3">
                <button className="btn btn-primary min-h-10" onClick={saveNote} disabled={noteState === "saving"}>Notiz speichern</button>
                {noteState === "saved" && <span className="text-xs text-muted">Gespeichert</span>}
              </div>
            </section>

            {history.length > 1 && (
              <section>
                <p className="eyebrow mb-2">Verlauf ({history.length} Termine)</p>
                <ul className="divide-y divide-sand rounded-xl border border-sand bg-cream">
                  {[...history].reverse().map((h) => (
                    <li key={h.id} className={`flex items-center justify-between gap-3 px-3 py-2 ${h.id === b.id ? "bg-sage/30" : ""}`}>
                      <span>
                        {formatDateLong(h.startAt).replace(/^\w+, /, "")}
                        <span className="block text-xs text-muted">{h.items.map((i) => i.name).join(", ")}</span>
                      </span>
                      <StatusBadge s={h.status} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
