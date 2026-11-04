import { promises as fs } from "fs";
import path from "path";
import { defaultSettings, defaultTreatments } from "../catalog";
import { SlotTakenError, type Blocker, type Booking, type CustomerNote, type Settings, type Treatment } from "../types";
import { newToken, overlaps, type Store } from "./store";

/**
 * Lokaler JSON-Speicher für Entwicklung und Demo.
 * NICHT für den Produktivbetrieb (keine Verschlüsselung, kein Mehrprozess-Schutz).
 */
type DB = {
  settings: Settings;
  treatments: Treatment[];
  blockers: Blocker[];
  bookings: Booking[];
  notes: CustomerNote[];
};

const DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "db.json");
const UPLOADS = path.join(DIR, "uploads");

let queue: Promise<unknown> = Promise.resolve();
function locked<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

async function load(): Promise<DB> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as DB;
  } catch {
    return {
      settings: defaultSettings,
      treatments: defaultTreatments,
      blockers: [],
      bookings: [],
      notes: [],
    };
  }
}
async function save(db: DB) {
  await fs.mkdir(DIR, { recursive: true });
  const tmp = FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, FILE);
}
const mutate = <T>(fn: (db: DB) => T | Promise<T>) =>
  locked(async () => {
    const db = await load();
    const r = await fn(db);
    await save(db);
    return r;
  });

const active = (b: Booking) => b.status !== "storniert";

export const fileStore: Store = {
  async getSettings() {
    return (await load()).settings;
  },
  async saveSettings(s) {
    await mutate((db) => void (db.settings = s));
  },
  async listTreatments() {
    return (await load()).treatments.sort((a, b) => a.sort - b.sort);
  },
  async upsertTreatment(t) {
    return mutate((db) => {
      const i = db.treatments.findIndex((x) => x.id === t.id);
      if (i >= 0) db.treatments[i] = t;
      else db.treatments.push(t);
      return t;
    });
  },
  async deleteTreatment(id) {
    await mutate((db) => void (db.treatments = db.treatments.filter((t) => t.id !== id)));
  },
  async listBlockers(q) {
    const list = (await load()).blockers;
    return list
      .filter((b) => (!q?.from || b.endAt > q.from) && (!q?.to || b.startAt < q.to))
      .sort((a, b) => a.startAt.localeCompare(b.startAt));
  },
  async addBlocker(b) {
    return mutate((db) => {
      const nb = { ...b, id: crypto.randomUUID() };
      db.blockers.push(nb);
      return nb;
    });
  },
  async deleteBlocker(id) {
    await mutate((db) => void (db.blockers = db.blockers.filter((b) => b.id !== id)));
  },
  async listBookings(q) {
    return (await load()).bookings
      .filter((b) => (q?.includeCancelled || active(b)) && (!q?.from || b.endAt > q.from) && (!q?.to || b.startAt < q.to))
      .sort((a, b) => a.startAt.localeCompare(b.startAt));
  },
  async getBooking(id) {
    return (await load()).bookings.find((b) => b.id === id) ?? null;
  },
  async getBookingByToken(token) {
    return (await load()).bookings.find((b) => b.token === token) ?? null;
  },
  async createBooking(nb) {
    return mutate((db) => {
      if (db.bookings.some((b) => active(b) && overlaps(b.startAt, b.endAt, nb.startAt, nb.endAt))) throw new SlotTakenError();
      const booking: Booking = {
        ...nb,
        id: crypto.randomUUID(),
        token: newToken(),
        status: "bestaetigt",
        reminderSentAt: null,
        createdAt: new Date().toISOString(),
      };
      db.bookings.push(booking);
      return booking;
    });
  },
  async updateBooking(id, patch) {
    return mutate((db) => {
      const b = db.bookings.find((x) => x.id === id);
      if (!b) throw new Error("Buchung nicht gefunden");
      Object.assign(b, patch);
      return b;
    });
  },
  async rescheduleBooking(id, startAt, endAt) {
    return mutate((db) => {
      const b = db.bookings.find((x) => x.id === id);
      if (!b) throw new Error("Buchung nicht gefunden");
      if (db.bookings.some((o) => o.id !== id && active(o) && overlaps(o.startAt, o.endAt, startAt, endAt))) throw new SlotTakenError();
      Object.assign(b, { startAt, endAt, reminderSentAt: null });
      return b;
    });
  },
  async getCustomerNote(email) {
    return (await load()).notes.find((n) => n.email === email.toLowerCase()) ?? null;
  },
  async saveCustomerNote(email, note) {
    return mutate((db) => {
      const e = email.toLowerCase();
      const n = { email: e, note, updatedAt: new Date().toISOString() };
      db.notes = [...db.notes.filter((x) => x.email !== e), n];
      return n;
    });
  },
  async savePhoto(data, mime) {
    await fs.mkdir(UPLOADS, { recursive: true });
    const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
    const key = `${crypto.randomUUID()}.${ext}`;
    await fs.writeFile(path.join(UPLOADS, key), data);
    return key;
  },
  async getPhoto(key) {
    if (!/^[\w-]+\.(png|jpg|webp)$/.test(key)) return null;
    try {
      const data = await fs.readFile(path.join(UPLOADS, key));
      const mime = key.endsWith("png") ? "image/png" : key.endsWith("webp") ? "image/webp" : "image/jpeg";
      return { data, mime };
    } catch {
      return null;
    }
  },
};
