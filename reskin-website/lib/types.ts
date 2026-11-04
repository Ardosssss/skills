export type Category = "beratung" | "haar" | "tattoo" | "kosmetik";

export type Treatment = {
  id: string;
  category: Category;
  /** Für Haarentfernung: "frau" | "mann"; sonst leer */
  group: string | null;
  name: string;
  description: string | null;
  durationMin: number;
  /** Preis pro Sitzung in CHF; null = auf Anfrage */
  price: number | null;
  /** Paketpreis für 6 Sitzungen (nur Haarentfernung) */
  pricePackage: number | null;
  active: boolean;
  sort: number;
};

export type TimeRange = { start: string; end: string }; // "09:00"

export type Settings = {
  /** Index 0 = Sonntag … 6 = Samstag */
  openingHours: TimeRange[][];
  slotStepMin: number;
  bufferMin: number;
  minLeadHours: number;
  maxDaysAhead: number;
  cancelHours: number;
};

export type Blocker = {
  id: string;
  kind: "ferien" | "blocker";
  startAt: string; // ISO
  endAt: string; // ISO
  reason: string | null;
};

export type BookingStatus = "bestaetigt" | "erledigt" | "no_show" | "storniert";

export type BookingItem = { treatmentId: string; name: string; price: number | null; durationMin: number };

export type BookingDetails = {
  gender?: "frau" | "mann";
  package?: boolean;
  tattooColors?: "schwarz" | "farbig" | "beides";
  coverUp?: boolean;
  consultTopic?: string;
};

export type Booking = {
  id: string;
  token: string;
  status: BookingStatus;
  category: Category;
  items: BookingItem[];
  details: BookingDetails;
  photoKey: string | null;
  startAt: string;
  endAt: string;
  durationMin: number;
  priceTotal: number | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  note: string | null;
  health: Record<string, boolean>;
  healthFlagged: boolean;
  consentAt: string;
  reminderSentAt: string | null;
  createdAt: string;
};

export type NewBooking = Omit<Booking, "id" | "token" | "createdAt" | "reminderSentAt" | "status">;

export type CustomerNote = { email: string; note: string; updatedAt: string };

export class SlotTakenError extends Error {
  constructor() {
    super("Dieser Termin ist leider nicht mehr frei.");
  }
}
