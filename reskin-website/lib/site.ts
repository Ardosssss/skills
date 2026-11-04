/**
 * Zentrale Stammdaten von RE|SKIN.
 * Alles, was mit "PLATZHALTER" markiert ist, bitte durch echte Angaben ersetzen.
 */
export const site = {
  name: "RE|SKIN",
  legalName: "RE|SKIN – Tattoo- & Haarentfernung",
  tagline: "Tattoo- & Haarentfernung",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.reskin-studio.ch",
  address: {
    street: "Zentralstrasse 10",
    floor: "1. Stock",
    zip: "6030",
    city: "Ebikon",
    canton: "LU",
    country: "CH",
    // Ungefähre Koordinaten Zentralstrasse, Ebikon – bei Bedarf präzisieren
    lat: 47.0806,
    lng: 8.3415,
  },
  phone: "+41 79 000 00 00", // PLATZHALTER
  phoneHref: "tel:+41790000000", // PLATZHALTER
  email: "info@reskin-studio.ch", // PLATZHALTER
  instagram: "https://www.instagram.com/reskin.studio/",
  instagramHandle: "@reskin.studio",
  whatsapp: "https://wa.me/message/VYAOAUXTYIVYP1", // geprüft: führt zum WhatsApp-Kontakt «RE|SKIN»
  googleReviews: "https://www.google.com/maps/search/?api=1&query=RE%7CSKIN+Zentralstrasse+10+6030+Ebikon", // PLATZHALTER: direkten Bewertungs-Link einsetzen
  googleRating: null as null | { value: number; count: number }, // z. B. { value: 5.0, count: 48 } – erst mit echten Zahlen füllen
  mapsDirections: "https://www.google.com/maps/dir/?api=1&destination=Zentralstrasse+10%2C+6030+Ebikon",
  owner: "Inhaberin RE|SKIN", // PLATZHALTER: Name der Inhaberin fürs Impressum
  uid: "CHE-000.000.000", // PLATZHALTER
};

export const nav = [
  { href: "/haarentfernung", label: "Haarentfernung" },
  { href: "/tattooentfernung", label: "Tattooentfernung" },
  { href: "/preise", label: "Preise" },
  { href: "/studio", label: "Studio" },
  { href: "/ratgeber", label: "Ratgeber" },
  { href: "/kontakt", label: "Kontakt" },
];

/** Anfahrt – PLATZHALTER, bitte vor Ort prüfen */
export const directions = {
  oev: "Bus bis Haltestelle «Ebikon, Zentrum» bzw. S-Bahn bis Bahnhof Ebikon – von dort wenige Gehminuten.",
  parking: "Öffentliche Parkplätze in der Umgebung (z. B. Parkhaus Zentrum Ebikon). Bitte Parkuhr beachten.",
  access: "Das Studio befindet sich im 1. Stock.",
};
