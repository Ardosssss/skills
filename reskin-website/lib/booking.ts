import "server-only";
import { contraindications } from "./catalog";
import { getStore } from "./db";
import { computeSlots } from "./slots";
import { isHm, isYmd, zurichToDate } from "./time";
import type { Booking, BookingDetails, BookingItem, Category, NewBooking, Treatment } from "./types";

export type BookingPayload = {
  category: Category;
  treatmentIds: string[];
  details?: BookingDetails;
  date: string;
  time: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  note?: string;
  health?: Record<string, boolean>;
  consent: boolean;
  website?: string; // Honeypot
};

export class ValidationError extends Error {}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Berechnet Positionen, Dauer und Preis serverseitig – Clientwerte werden nie übernommen. */
export function priceBooking(category: Category, ids: string[], treatments: Treatment[], details: BookingDetails) {
  const chosen = ids
    .map((id) => treatments.find((t) => t.id === id && t.active && t.category === category))
    .filter((t): t is Treatment => Boolean(t));
  if (!chosen.length) throw new ValidationError("Bitte wähle mindestens eine Behandlung.");
  if ((category === "tattoo" || category === "beratung") && chosen.length !== 1) throw new ValidationError("Bitte wähle genau eine Option.");
  if (category === "haar" && details.gender && chosen.some((t) => t.group !== details.gender)) throw new ValidationError("Ungültige Zone.");

  const usePackage = category === "haar" && Boolean(details.package);
  const items: BookingItem[] = chosen.map((t) => ({
    treatmentId: t.id,
    name: t.name,
    price: usePackage ? t.pricePackage : t.price,
    durationMin: t.durationMin,
  }));
  const durationMin = Math.max(15, items.reduce((s, i) => s + i.durationMin, 0));
  const priceTotal = items.some((i) => i.price == null) ? null : items.reduce((s, i) => s + (i.price ?? 0), 0);
  return { items, durationMin, priceTotal };
}

export async function isSlotFree(date: string, time: string, durationMin: number, excludeBookingId?: string) {
  const store = getStore();
  const [settings, bookings, blockers] = await Promise.all([
    store.getSettings(),
    store.listBookings({ from: zurichToDate(date, "00:00").toISOString(), to: zurichToDate(date, "23:59").toISOString() }),
    store.listBlockers({ from: zurichToDate(date, "00:00").toISOString(), to: zurichToDate(date, "23:59").toISOString() }),
  ]);
  const slots = computeSlots({
    from: date,
    to: date,
    durationMin,
    settings,
    bookings: bookings.filter((b) => b.id !== excludeBookingId),
    blockers,
  });
  return (slots[date] ?? []).includes(time);
}

export function parsePayload(raw: unknown): BookingPayload {
  const p = (raw ?? {}) as Record<string, unknown>;
  const category = p.category as Category;
  if (!["beratung", "haar", "tattoo", "kosmetik"].includes(category)) throw new ValidationError("Ungültige Behandlung.");
  const treatmentIds = Array.isArray(p.treatmentIds) ? p.treatmentIds.filter((x): x is string => typeof x === "string").slice(0, 30) : [];
  const d = (p.details ?? {}) as Record<string, unknown>;
  const details: BookingDetails = {};
  if (d.gender === "frau" || d.gender === "mann") details.gender = d.gender;
  if (typeof d.package === "boolean") details.package = d.package;
  if (d.tattooColors === "schwarz" || d.tattooColors === "farbig" || d.tattooColors === "beides") details.tattooColors = d.tattooColors;
  if (typeof d.coverUp === "boolean") details.coverUp = d.coverUp;
  const topic = str(d.consultTopic, 60);
  if (topic) details.consultTopic = topic;

  if (!isYmd(p.date) || !isHm(p.time)) throw new ValidationError("Bitte wähle Datum und Uhrzeit.");
  const firstName = str(p.firstName, 80);
  const lastName = str(p.lastName, 80);
  const email = str(p.email, 160).toLowerCase();
  const phone = str(p.phone, 40);
  if (!firstName || !lastName) throw new ValidationError("Bitte gib Vor- und Nachnamen an.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new ValidationError("Bitte gib eine gültige E-Mail-Adresse an.");
  if (!/^[+\d][\d\s/().-]{6,}$/.test(phone)) throw new ValidationError("Bitte gib eine gültige Telefonnummer an.");
  if (p.consent !== true) throw new ValidationError("Bitte bestätige AGB und Datenschutz.");

  const health: Record<string, boolean> = {};
  const h = (p.health ?? {}) as Record<string, unknown>;
  for (const c of contraindications) health[c.key] = h[c.key] === true;

  return {
    category,
    treatmentIds,
    details,
    date: p.date,
    time: p.time,
    firstName,
    lastName,
    email,
    phone,
    note: str(p.note, 1000) || undefined,
    health,
    consent: true,
    website: str(p.website, 200),
  };
}

export async function buildNewBooking(p: BookingPayload, photoKey: string | null): Promise<NewBooking> {
  const treatments = await getStore().listTreatments();
  const { items, durationMin, priceTotal } = priceBooking(p.category, p.treatmentIds, treatments, p.details ?? {});
  const start = zurichToDate(p.date, p.time);
  const end = new Date(start.getTime() + durationMin * 60_000);
  const health = p.health ?? {};
  return {
    category: p.category,
    items,
    details: p.details ?? {},
    photoKey,
    startAt: start.toISOString(),
    endAt: end.toISOString(),
    durationMin,
    priceTotal,
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email,
    phone: p.phone,
    note: p.note ?? null,
    health,
    healthFlagged: Object.values(health).some(Boolean),
    consentAt: new Date().toISOString(),
  };
}

/** Öffentliche Sicht auf eine Buchung (ohne Gesundheitsdaten). */
export function publicBooking(b: Booking) {
  return {
    status: b.status,
    category: b.category,
    items: b.items.map((i) => ({ name: i.name })),
    details: b.details,
    startAt: b.startAt,
    endAt: b.endAt,
    durationMin: b.durationMin,
    priceTotal: b.priceTotal,
    firstName: b.firstName,
    token: b.token,
  };
}
export type PublicBooking = ReturnType<typeof publicBooking>;

export async function canModify(b: Booking) {
  const settings = await getStore().getSettings();
  return b.status === "bestaetigt" && new Date(b.startAt).getTime() - Date.now() >= settings.cancelHours * 3600_000;
}
