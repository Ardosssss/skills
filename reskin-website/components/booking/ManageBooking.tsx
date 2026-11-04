"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { categoryLabels } from "@/lib/catalog";
import { site } from "@/lib/site";
import { formatChf, formatDateLong, formatTime } from "@/lib/time";
import { IconCalendar, IconWhatsApp } from "../Icons";
import { SlotPicker } from "./SlotPicker";

type PB = {
  status: string;
  category: string;
  items: { name: string }[];
  startAt: string;
  endAt: string;
  durationMin: number;
  priceTotal: number | null;
  firstName: string;
  token: string;
};

export function ManageBooking({ token }: { token: string }) {
  const [booking, setBooking] = useState<PB | null>(null);
  const [canModify, setCanModify] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [mode, setMode] = useState<"view" | "reschedule" | "cancel">("view");
  const [slot, setSlot] = useState<{ date: string | null; time: string | null }>({ date: null, time: null });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = () =>
    fetch(`/api/booking/${token}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setBooking(d.booking);
        setCanModify(d.canModify);
      })
      .catch(() => setNotFound(true));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function act(path: "cancel" | "reschedule") {
    setBusy(true);
    setMsg(null);
    const res = await fetch(`/api/booking/${token}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: path === "reschedule" ? JSON.stringify(slot) : "{}",
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setMsg({ ok: false, text: d.error ?? "Das hat nicht geklappt." });
    setBooking(d.booking);
    setMode("view");
    setMsg({ ok: true, text: path === "cancel" ? "Dein Termin wurde storniert. Du erhältst eine Bestätigung per E-Mail." : "Dein Termin wurde verschoben. Die neue Bestätigung ist per E-Mail unterwegs." });
    load();
  }

  if (notFound)
    return (
      <div className="card p-8">
        <p>Dieser Termin wurde nicht gefunden. Bitte prüfe den Link aus deiner Bestätigungs-E-Mail.</p>
        <Link href="/buchen" className="btn btn-primary mt-6">Neuen Termin buchen</Link>
      </div>
    );
  if (!booking) return <p className="text-muted">Termin wird geladen …</p>;

  const cancelled = booking.status === "storniert";
  return (
    <div className="space-y-6">
      {msg && (
        <p role="status" className={`rounded-xl px-4 py-3 text-sm ${msg.ok ? "bg-sage/50" : "bg-[#F3E6E1] text-alert"}`}>
          {msg.text}
        </p>
      )}
      <div className="card p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-serif text-2xl tracking-[0.06em]">Hallo {booking.firstName}</p>
          <span className={`rounded-full px-3 py-1 text-xs tracking-[0.14em] uppercase ${cancelled ? "bg-[#F3E6E1] text-alert" : "bg-sage/60 text-forest"}`}>
            {cancelled ? "Storniert" : booking.status === "bestaetigt" ? "Bestätigt" : booking.status === "erledigt" ? "Erledigt" : "Nicht erschienen"}
          </span>
        </div>
        <dl className="mt-5 grid grid-cols-[110px_1fr] gap-y-2 text-[0.95rem]">
          <dt className="text-muted">Behandlung</dt>
          <dd>{categoryLabels[booking.category]}: {booking.items.map((i) => i.name).join(", ")}</dd>
          <dt className="text-muted">Datum</dt>
          <dd>{formatDateLong(booking.startAt)}</dd>
          <dt className="text-muted">Uhrzeit</dt>
          <dd>{formatTime(booking.startAt)} – {formatTime(booking.endAt)} Uhr</dd>
          <dt className="text-muted">Preis</dt>
          <dd>{formatChf(booking.priceTotal)}</dd>
          <dt className="text-muted">Ort</dt>
          <dd>{site.address.street}, {site.address.floor}, {site.address.zip} {site.address.city}</dd>
        </dl>
        {!cancelled && (
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`/api/ics/${token}`} className="btn btn-outline"><IconCalendar width={18} height={18} /> Kalender (.ics)</a>
            {canModify && mode === "view" && (
              <>
                <button type="button" className="btn btn-primary" onClick={() => setMode("reschedule")}>Verschieben</button>
                <button type="button" className="btn btn-outline" onClick={() => setMode("cancel")}>Stornieren</button>
              </>
            )}
          </div>
        )}
        {!cancelled && !canModify && booking.status === "bestaetigt" && (
          <p className="mt-5 text-sm text-muted">
            Online-Änderungen sind nur bis 24 Stunden vor dem Termin möglich. Bitte melde dich direkt bei mir:{" "}
            <a href={site.whatsapp} className="inline-flex items-center gap-1 underline underline-offset-4"><IconWhatsApp width={16} height={16} /> WhatsApp</a> oder{" "}
            <a href={site.phoneHref} className="underline underline-offset-4">{site.phone}</a>.
          </p>
        )}
      </div>

      {mode === "cancel" && (
        <div className="card step-in p-6 md:p-8">
          <p className="font-serif text-xl tracking-[0.06em] uppercase">Termin wirklich stornieren?</p>
          <p className="mt-2 text-muted">Der Termin wird freigegeben. Du kannst jederzeit einen neuen buchen.</p>
          <div className="mt-5 flex gap-3">
            <button type="button" className="btn btn-primary" disabled={busy} onClick={() => act("cancel")}>{busy ? "…" : "Ja, stornieren"}</button>
            <button type="button" className="btn btn-outline" onClick={() => setMode("view")}>Abbrechen</button>
          </div>
        </div>
      )}

      {mode === "reschedule" && (
        <div className="card step-in p-6 md:p-8">
          <p className="mb-5 font-serif text-xl tracking-[0.06em] uppercase">Neuen Termin wählen</p>
          <SlotPicker durationMin={booking.durationMin} value={slot} onChange={setSlot} token={token} />
          <div className="mt-6 flex gap-3">
            <button type="button" className="btn btn-primary" disabled={busy || !slot.date || !slot.time} onClick={() => act("reschedule")}>
              {busy ? "…" : "Termin verschieben"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setMode("view")}>Abbrechen</button>
          </div>
        </div>
      )}
      {cancelled && <Link href="/buchen" className="btn btn-primary">Neuen Termin buchen</Link>}
    </div>
  );
}
