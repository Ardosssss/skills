"use client";
import { useEffect, useState } from "react";
import { weekdayNames } from "@/lib/catalog";
import { addDaysYmd, formatDateLong, formatTime, zurichToDate } from "@/lib/time";
import type { Blocker, Settings } from "@/lib/types";
import { IconClose, IconPlus } from "../Icons";

const ORDER = [1, 2, 3, 4, 5, 6, 0];

export function AdminSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [blockers, setBlockers] = useState<Blocker[]>([]);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((d) => setSettings(d.settings));
    loadBlockers();
  }, []);
  const loadBlockers = () => fetch("/api/admin/blockers").then((r) => r.json()).then((d) => setBlockers(d.blockers ?? []));

  async function save() {
    if (!settings) return;
    setMsg(null);
    const r = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    const d = await r.json();
    setMsg(r.ok ? { ok: true, text: "Gespeichert." } : { ok: false, text: d.error ?? "Fehler beim Speichern" });
  }

  if (!settings) return <p className="text-muted">Lädt …</p>;

  const setDay = (d: number, ranges: Settings["openingHours"][number]) => {
    const oh = settings.openingHours.map((r, i) => (i === d ? ranges : r));
    setSettings({ ...settings, openingHours: oh });
  };
  const num = (k: keyof Omit<Settings, "openingHours">, label: string, hint: string) => (
    <label className="block">
      <span className="label">{label}</span>
      <input type="number" className="field" value={settings[k]} onChange={(e) => setSettings({ ...settings, [k]: Number(e.target.value) })} />
      <span className="mt-1 block text-xs text-muted">{hint}</span>
    </label>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <section>
        <h1 className="h-display mb-6 text-2xl md:text-3xl">Öffnungszeiten</h1>
        <div className="card divide-y divide-sand">
          {ORDER.map((d) => {
            const ranges = settings.openingHours[d];
            return (
              <div key={d} className="flex flex-wrap items-start gap-4 px-5 py-4">
                <div className="w-28 pt-2.5">
                  <p>{weekdayNames[d]}</p>
                  {!ranges.length && <p className="text-xs text-muted">geschlossen</p>}
                </div>
                <div className="flex-1 space-y-2">
                  {ranges.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="time" step={900} className="field !min-h-10 w-32 !py-1.5" value={r.start} onChange={(e) => setDay(d, ranges.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))} aria-label={`${weekdayNames[d]} von`} />
                      <span className="text-muted">–</span>
                      <input type="time" step={900} className="field !min-h-10 w-32 !py-1.5" value={r.end} onChange={(e) => setDay(d, ranges.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)))} aria-label={`${weekdayNames[d]} bis`} />
                      <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-sand" onClick={() => setDay(d, ranges.filter((_, j) => j !== i))} aria-label="Zeitfenster entfernen">
                        <IconClose width={18} />
                      </button>
                    </div>
                  ))}
                  <button className="inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-sm text-forest hover:bg-sand" onClick={() => setDay(d, [...ranges, { start: ranges.at(-1)?.end ?? "09:00", end: "18:00" }])}>
                    <IconPlus width={16} /> Zeitfenster
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="h-display mt-10 mb-4 text-xl">Buchungsregeln</h2>
        <div className="card grid gap-5 p-5 sm:grid-cols-2">
          {num("slotStepMin", "Raster (Minuten)", "Abstand der angebotenen Startzeiten")}
          {num("bufferMin", "Puffer (Minuten)", "Zwischen zwei Terminen, z. B. für Reinigung")}
          {num("minLeadHours", "Vorlaufzeit (Stunden)", "Frühestmögliche Buchung ab jetzt")}
          {num("maxDaysAhead", "Buchbar im Voraus (Tage)", "Wie weit in die Zukunft")}
          {num("cancelHours", "Storno-Frist (Stunden)", "Online verschieben/stornieren bis …")}
        </div>
        <div className="mt-6 flex items-center gap-4">
          <button className="btn btn-primary" onClick={save}>Speichern</button>
          {msg && <span className={`text-sm ${msg.ok ? "text-forest" : "text-alert"}`}>{msg.text}</span>}
        </div>
      </section>

      <BlockerPanel blockers={blockers} reload={loadBlockers} />
    </div>
  );
}

function BlockerPanel({ blockers, reload }: { blockers: Blocker[]; reload: () => void }) {
  const [kind, setKind] = useState<"ferien" | "blocker">("ferien");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("12:00");
  const [end, setEnd] = useState("13:00");
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    let startAt: string, endAt: string;
    if (kind === "ferien") {
      if (!from || !to || to < from) return setErr("Bitte gültigen Zeitraum wählen.");
      startAt = zurichToDate(from, "00:00").toISOString();
      endAt = zurichToDate(addDaysYmd(to, 1), "00:00").toISOString();
    } else {
      if (!date || end <= start) return setErr("Bitte Datum und gültige Zeiten wählen.");
      startAt = zurichToDate(date, start).toISOString();
      endAt = zurichToDate(date, end).toISOString();
    }
    const r = await fetch("/api/admin/blockers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, startAt, endAt, reason }) });
    if (!r.ok) return setErr((await r.json()).error ?? "Fehler");
    setReason("");
    reload();
  }
  async function remove(id: string) {
    if (!confirm("Eintrag löschen?")) return;
    await fetch(`/api/admin/blockers?id=${id}`, { method: "DELETE" });
    reload();
  }

  return (
    <section>
      <h2 className="h-display mb-6 text-2xl md:text-3xl">Ferien & Blocker</h2>
      <form onSubmit={add} className="card grid gap-4 p-5">
        <div className="flex rounded-full border border-sand bg-linen p-1">
          {(["ferien", "blocker"] as const).map((k) => (
            <button type="button" key={k} onClick={() => setKind(k)} className={`min-h-10 flex-1 rounded-full text-sm ${kind === k ? "bg-forest text-linen" : "text-muted"}`}>
              {k === "ferien" ? "Ferien (ganze Tage)" : "Blocker (Zeitfenster)"}
            </button>
          ))}
        </div>
        {kind === "ferien" ? (
          <div className="grid grid-cols-2 gap-3">
            <label><span className="label">Von</span><input type="date" className="field" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
            <label><span className="label">Bis und mit</span><input type="date" className="field" value={to} onChange={(e) => setTo(e.target.value)} /></label>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <label className="col-span-3 sm:col-span-1"><span className="label">Datum</span><input type="date" className="field" value={date} onChange={(e) => setDate(e.target.value)} /></label>
            <label><span className="label">Von</span><input type="time" step={900} className="field" value={start} onChange={(e) => setStart(e.target.value)} /></label>
            <label><span className="label">Bis</span><input type="time" step={900} className="field" value={end} onChange={(e) => setEnd(e.target.value)} /></label>
          </div>
        )}
        <label><span className="label">Notiz (optional)</span><input className="field" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="z. B. Weiterbildung, Arzttermin" /></label>
        {err && <p className="text-sm text-alert">{err}</p>}
        <button className="btn btn-primary justify-self-start">Hinzufügen</button>
      </form>

      <ul className="mt-6 space-y-2">
        {blockers.map((b) => (
          <li key={b.id} className="card flex items-center justify-between gap-3 px-4 py-3 text-sm">
            <span>
              <span className="mr-2 rounded-full bg-sand px-2 py-0.5 text-xs">{b.kind === "ferien" ? "Ferien" : "Blocker"}</span>
              {b.kind === "ferien"
                ? `${formatDateLong(b.startAt)} – ${formatDateLong(new Date(new Date(b.endAt).getTime() - 1))}`
                : `${formatDateLong(b.startAt)}, ${formatTime(b.startAt)}–${formatTime(b.endAt)}`}
              {b.reason && <span className="block text-xs text-muted">{b.reason}</span>}
            </span>
            <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-sand" onClick={() => remove(b.id)} aria-label="Löschen">
              <IconClose width={18} />
            </button>
          </li>
        ))}
        {!blockers.length && <li className="text-sm text-muted">Keine Ferien oder Blocker eingetragen.</li>}
      </ul>
    </section>
  );
}
