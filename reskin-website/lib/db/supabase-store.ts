import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { defaultSettings, defaultTreatments } from "../catalog";
import { SlotTakenError, type Blocker, type Booking, type Settings, type Treatment } from "../types";
import { newToken, type Store } from "./store";

/**
 * Supabase-Speicher. Läuft ausschliesslich serverseitig mit dem Service-Role-Key.
 * Alle Tabellen haben RLS aktiviert und keine öffentlichen Policies –
 * Kundendaten und Gesundheitsangaben sind damit nur über den Server (Admin) erreichbar.
 */
let client: SupabaseClient | null = null;
const sb = () =>
  (client ??= createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  }));

const BUCKET = "tattoo-photos";

type TRow = {
  id: string; category: Treatment["category"]; grp: string | null; name: string; description: string | null;
  duration_min: number; price: number | null; price_package: number | null; active: boolean; sort: number;
};
const tFrom = (r: TRow): Treatment => ({
  id: r.id, category: r.category, group: r.grp, name: r.name, description: r.description,
  durationMin: r.duration_min, price: r.price == null ? null : Number(r.price),
  pricePackage: r.price_package == null ? null : Number(r.price_package), active: r.active, sort: r.sort,
});
const tTo = (t: Treatment): TRow => ({
  id: t.id, category: t.category, grp: t.group, name: t.name, description: t.description,
  duration_min: t.durationMin, price: t.price, price_package: t.pricePackage, active: t.active, sort: t.sort,
});

type BRow = {
  id: string; token: string; status: Booking["status"]; category: Booking["category"]; items: Booking["items"];
  details: Booking["details"]; photo_key: string | null; start_at: string; end_at: string; duration_min: number;
  price_total: number | null; first_name: string; last_name: string; email: string; phone: string; note: string | null;
  health: Booking["health"]; health_flagged: boolean; consent_at: string; reminder_sent_at: string | null; created_at: string;
};
const bFrom = (r: BRow): Booking => ({
  id: r.id, token: r.token, status: r.status, category: r.category, items: r.items, details: r.details ?? {},
  photoKey: r.photo_key, startAt: new Date(r.start_at).toISOString(), endAt: new Date(r.end_at).toISOString(),
  durationMin: r.duration_min, priceTotal: r.price_total == null ? null : Number(r.price_total),
  firstName: r.first_name, lastName: r.last_name, email: r.email, phone: r.phone, note: r.note,
  health: r.health ?? {}, healthFlagged: r.health_flagged, consentAt: r.consent_at,
  reminderSentAt: r.reminder_sent_at, createdAt: r.created_at,
});

type BlRow = { id: string; kind: Blocker["kind"]; start_at: string; end_at: string; reason: string | null };
const blFrom = (r: BlRow): Blocker => ({
  id: r.id, kind: r.kind, startAt: new Date(r.start_at).toISOString(), endAt: new Date(r.end_at).toISOString(), reason: r.reason,
});

function check<T>(res: { data: T; error: { message: string; code?: string } | null }): T {
  if (res.error) {
    // 23P01 = exclusion_violation → Doppelbuchung
    if (res.error.code === "23P01") throw new SlotTakenError();
    throw new Error(res.error.message);
  }
  return res.data;
}

export const supabaseStore: Store = {
  async getSettings() {
    const data = check(await sb().from("settings").select("data").eq("id", 1).maybeSingle());
    return { ...defaultSettings, ...((data?.data as Partial<Settings>) ?? {}) };
  },
  async saveSettings(s) {
    check(await sb().from("settings").upsert({ id: 1, data: s }));
  },
  async listTreatments() {
    const rows = check(await sb().from("treatments").select("*").order("sort")) as TRow[];
    if (!rows.length) {
      check(await sb().from("treatments").insert(defaultTreatments.map(tTo)));
      return defaultTreatments;
    }
    return rows.map(tFrom);
  },
  async upsertTreatment(t) {
    check(await sb().from("treatments").upsert(tTo(t)));
    return t;
  },
  async deleteTreatment(id) {
    check(await sb().from("treatments").delete().eq("id", id));
  },
  async listBlockers(q) {
    let query = sb().from("blockers").select("*").order("start_at");
    if (q?.from) query = query.gt("end_at", q.from);
    if (q?.to) query = query.lt("start_at", q.to);
    return (check(await query) as BlRow[]).map(blFrom);
  },
  async addBlocker(b) {
    const row = check(
      await sb().from("blockers").insert({ kind: b.kind, start_at: b.startAt, end_at: b.endAt, reason: b.reason }).select().single(),
    ) as BlRow;
    return blFrom(row);
  },
  async deleteBlocker(id) {
    check(await sb().from("blockers").delete().eq("id", id));
  },
  async listBookings(q) {
    let query = sb().from("bookings").select("*").order("start_at");
    if (!q?.includeCancelled) query = query.neq("status", "storniert");
    if (q?.from) query = query.gt("end_at", q.from);
    if (q?.to) query = query.lt("start_at", q.to);
    return (check(await query) as BRow[]).map(bFrom);
  },
  async getBooking(id) {
    const r = check(await sb().from("bookings").select("*").eq("id", id).maybeSingle()) as BRow | null;
    return r ? bFrom(r) : null;
  },
  async getBookingByToken(token) {
    const r = check(await sb().from("bookings").select("*").eq("token", token).maybeSingle()) as BRow | null;
    return r ? bFrom(r) : null;
  },
  async createBooking(b) {
    const row = check(
      await sb()
        .from("bookings")
        .insert({
          token: newToken(), status: "bestaetigt", category: b.category, items: b.items, details: b.details,
          photo_key: b.photoKey, start_at: b.startAt, end_at: b.endAt, duration_min: b.durationMin,
          price_total: b.priceTotal, first_name: b.firstName, last_name: b.lastName, email: b.email, phone: b.phone,
          note: b.note, health: b.health, health_flagged: b.healthFlagged, consent_at: b.consentAt,
        })
        .select()
        .single(),
    ) as BRow;
    return bFrom(row);
  },
  async updateBooking(id, patch) {
    const row: Partial<BRow> = {};
    if (patch.status) row.status = patch.status;
    if (patch.reminderSentAt !== undefined) row.reminder_sent_at = patch.reminderSentAt;
    return bFrom(check(await sb().from("bookings").update(row).eq("id", id).select().single()) as BRow);
  },
  async rescheduleBooking(id, startAt, endAt) {
    return bFrom(
      check(
        await sb().from("bookings").update({ start_at: startAt, end_at: endAt, reminder_sent_at: null }).eq("id", id).select().single(),
      ) as BRow,
    );
  },
  async getCustomerNote(email) {
    const r = check(await sb().from("customer_notes").select("*").eq("email", email.toLowerCase()).maybeSingle()) as
      | { email: string; note: string; updated_at: string }
      | null;
    return r ? { email: r.email, note: r.note, updatedAt: r.updated_at } : null;
  },
  async saveCustomerNote(email, note) {
    const updatedAt = new Date().toISOString();
    check(await sb().from("customer_notes").upsert({ email: email.toLowerCase(), note, updated_at: updatedAt }));
    return { email: email.toLowerCase(), note, updatedAt };
  },
  async savePhoto(data, mime) {
    const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
    const key = `${crypto.randomUUID()}.${ext}`;
    check(await sb().storage.from(BUCKET).upload(key, data, { contentType: mime, upsert: false }));
    return key;
  },
  async getPhoto(key) {
    const res = await sb().storage.from(BUCKET).download(key);
    if (res.error || !res.data) return null;
    return { data: Buffer.from(await res.data.arrayBuffer()), mime: res.data.type || "image/jpeg" };
  },
};
