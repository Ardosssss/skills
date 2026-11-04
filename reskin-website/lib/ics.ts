import type { Booking } from "./types";
import { site } from "./site";

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

export function bookingTitle(b: Booking) {
  const what = b.items.map((i) => i.name).join(", ");
  return `RE|SKIN – ${what}`;
}

export function buildIcs(b: Booking) {
  const a = site.address;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RE|SKIN//Termine//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${b.id}@reskin-studio.ch`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(b.startAt)}`,
    `DTEND:${stamp(b.endAt)}`,
    `SUMMARY:${esc(bookingTitle(b))}`,
    `LOCATION:${esc(`RE|SKIN, ${a.street} (${a.floor}), ${a.zip} ${a.city}`)}`,
    `DESCRIPTION:${esc(`Termin verschieben oder stornieren: ${site.url}/termin/${b.token}`)}`,
    `STATUS:${b.status === "storniert" ? "CANCELLED" : "CONFIRMED"}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT24H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Erinnerung: Termin bei RE|SKIN morgen",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}
