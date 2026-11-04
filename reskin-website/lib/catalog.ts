import type { Settings, Treatment } from "./types";

/**
 * Standard-Behandlungen inkl. PLATZHALTER-Preisen.
 * Werden beim ersten Start in die Datenbank übernommen und sind danach im Admin bearbeitbar.
 */
const pkg = (single: number) => Math.round((single * 6 * 0.8) / 5) * 5; // 20 % Paketrabatt, auf 5 gerundet

type Z = [id: string, name: string, min: number, price: number];

const hairWomen: Z[] = [
  ["h-f-oberlippe", "Oberlippe", 10, 59],
  ["h-f-kinn", "Kinn", 10, 59],
  ["h-f-gesicht", "Gesicht komplett", 20, 119],
  ["h-f-achseln", "Achseln", 15, 79],
  ["h-f-unterarme", "Unterarme", 20, 119],
  ["h-f-arme", "Arme komplett", 30, 179],
  ["h-f-bikini", "Bikinizone klassisch", 15, 89],
  ["h-f-intim", "Intimbereich komplett", 25, 149],
  ["h-f-bauchlinie", "Bauchlinie", 10, 49],
  ["h-f-po", "Po", 20, 99],
  ["h-f-unterschenkel", "Unterschenkel", 30, 179],
  ["h-f-oberschenkel", "Oberschenkel", 35, 199],
  ["h-f-beine", "Beine komplett", 60, 299],
  ["h-f-ruecken", "Rücken", 30, 149],
];

const hairMen: Z[] = [
  ["h-m-bartkontur", "Bartkontur / Wangen", 15, 79],
  ["h-m-nacken", "Nacken", 15, 69],
  ["h-m-achseln", "Achseln", 15, 89],
  ["h-m-schultern", "Schultern", 20, 109],
  ["h-m-brust", "Brust", 25, 149],
  ["h-m-bauch", "Bauch", 25, 129],
  ["h-m-ruecken", "Rücken komplett", 40, 249],
  ["h-m-arme", "Arme komplett", 35, 199],
  ["h-m-intim", "Intimbereich", 25, 159],
  ["h-m-beine", "Beine komplett", 60, 329],
];

const toHair = (group: "frau" | "mann", list: Z[], offset: number): Treatment[] =>
  list.map(([id, name, min, price], i) => ({
    id,
    category: "haar",
    group,
    name,
    description: null,
    durationMin: min,
    price,
    pricePackage: pkg(price),
    active: true,
    sort: offset + i,
  }));

export const defaultTreatments: Treatment[] = [
  {
    id: "beratung",
    category: "beratung",
    group: null,
    name: "Kostenlose Beratung & Hautanalyse",
    description: "15–20 Minuten, unverbindlich – inkl. Testspot auf Wunsch",
    durationMin: 20,
    price: 0,
    pricePackage: null,
    active: true,
    sort: 0,
  },
  ...toHair("frau", hairWomen, 100),
  ...toHair("mann", hairMen, 200),
  { id: "t-xs", category: "tattoo", group: null, name: "XS", description: "bis ca. 3 × 3 cm (z. B. Symbol, Initialen)", durationMin: 15, price: 79, pricePackage: null, active: true, sort: 300 },
  { id: "t-s", category: "tattoo", group: null, name: "S", description: "bis visitenkartengross (ca. 8.5 × 5.5 cm)", durationMin: 20, price: 119, pricePackage: null, active: true, sort: 301 },
  { id: "t-m", category: "tattoo", group: null, name: "M", description: "bis Postkartengrösse (ca. 10 × 15 cm)", durationMin: 30, price: 179, pricePackage: null, active: true, sort: 302 },
  { id: "t-l", category: "tattoo", group: null, name: "L", description: "bis ca. A5 (15 × 21 cm)", durationMin: 40, price: 249, pricePackage: null, active: true, sort: 303 },
  { id: "t-xl", category: "tattoo", group: null, name: "XL", description: "grösser als A5 – Preis nach Beratung", durationMin: 60, price: null, pricePackage: null, active: true, sort: 304 },
  { id: "k-brauen", category: "kosmetik", group: null, name: "Augenbrauen zupfen & formen", description: null, durationMin: 30, price: 35, pricePackage: null, active: true, sort: 400 },
  { id: "k-faerben", category: "kosmetik", group: null, name: "Wimpern & Brauen färben", description: null, durationMin: 30, price: 45, pricePackage: null, active: true, sort: 401 },
  { id: "k-classic", category: "kosmetik", group: null, name: "Gesichtsbehandlung Classic", description: "Reinigung, Peeling, Maske, Pflege", durationMin: 60, price: 119, pricePackage: null, active: true, sort: 402 },
  { id: "k-deluxe", category: "kosmetik", group: null, name: "Gesichtsbehandlung Deluxe", description: "inkl. Massage & Ampulle", durationMin: 90, price: 159, pricePackage: null, active: true, sort: 403 },
];

/** Öffnungszeiten – PLATZHALTER */
export const defaultSettings: Settings = {
  openingHours: [
    [], // So
    [], // Mo
    [{ start: "09:00", end: "12:00" }, { start: "13:30", end: "19:00" }], // Di
    [{ start: "09:00", end: "12:00" }, { start: "13:30", end: "19:00" }], // Mi
    [{ start: "09:00", end: "12:00" }, { start: "13:30", end: "20:00" }], // Do
    [{ start: "09:00", end: "12:00" }, { start: "13:30", end: "18:00" }], // Fr
    [{ start: "09:00", end: "15:00" }], // Sa
  ],
  slotStepMin: 15,
  bufferMin: 10,
  minLeadHours: 12,
  maxDaysAhead: 90,
  cancelHours: 24,
};

export const weekdayNames = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

/** Gesundheitsfragen = Kontraindikationen */
export const contraindications: { key: string; label: string }[] = [
  { key: "hautkrankheit", label: "Hautkrankheiten im Behandlungsbereich" },
  { key: "lichtempfindlich", label: "Lichtempfindlichkeit, z. B. durch Aknemedikamente, Johanniskraut oder Antidepressiva" },
  { key: "infekt", label: "Akuter Infekt (Fieber, Herpes)" },
  { key: "wunden", label: "Offene Wunden oder Entzündungen" },
  { key: "schwanger", label: "Schwangerschaft oder Stillzeit" },
  { key: "sonnenbrand", label: "Frischer Sonnenbrand oder starke UV-Exposition" },
  { key: "op", label: "Kürzliche Operation oder nicht vollständig verheilte Narben" },
  { key: "hautveraenderung", label: "Ungeklärte Hautveränderungen (z. B. Muttermale, die sich verändern)" },
];

export const categoryLabels: Record<string, string> = {
  beratung: "Kostenlose Beratung",
  haar: "Haarentfernung",
  tattoo: "Tattooentfernung",
  kosmetik: "Kosmetik",
};
