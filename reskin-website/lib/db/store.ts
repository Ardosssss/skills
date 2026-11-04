import type { Blocker, Booking, CustomerNote, NewBooking, Settings, Treatment } from "../types";

export type BookingQuery = { from?: string; to?: string; includeCancelled?: boolean };

export interface Store {
  getSettings(): Promise<Settings>;
  saveSettings(s: Settings): Promise<void>;

  listTreatments(): Promise<Treatment[]>;
  upsertTreatment(t: Treatment): Promise<Treatment>;
  deleteTreatment(id: string): Promise<void>;

  listBlockers(q?: { from?: string; to?: string }): Promise<Blocker[]>;
  addBlocker(b: Omit<Blocker, "id">): Promise<Blocker>;
  deleteBlocker(id: string): Promise<void>;

  listBookings(q?: BookingQuery): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | null>;
  getBookingByToken(token: string): Promise<Booking | null>;
  /** Wirft SlotTakenError, wenn sich der Termin mit einem bestehenden überschneidet. */
  createBooking(b: NewBooking): Promise<Booking>;
  updateBooking(id: string, patch: Partial<Pick<Booking, "status" | "reminderSentAt">>): Promise<Booking>;
  /** Wirft SlotTakenError bei Überschneidung. */
  rescheduleBooking(id: string, startAt: string, endAt: string): Promise<Booking>;

  getCustomerNote(email: string): Promise<CustomerNote | null>;
  saveCustomerNote(email: string, note: string): Promise<CustomerNote>;

  savePhoto(data: Buffer, mime: string): Promise<string>;
  getPhoto(key: string): Promise<{ data: Buffer; mime: string } | null>;
}

export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return new Date(aStart) < new Date(bEnd) && new Date(aEnd) > new Date(bStart);
}

export const newToken = () => {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64url");
};
