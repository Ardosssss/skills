/** Redaktionelle Inhalte (Platzhaltertexte – frei anpassbar). */

export const values = [
  { n: "01", title: "Zertifizierte Ausbildung", text: "Ich arbeite mit Sachkundenachweis nach V-NISSG und bilde mich laufend weiter – für Behandlungen, die sicher und durchdacht sind." },
  { n: "02", title: "Moderne Lasertechnik", text: "Diodenlaser mit Kühlung für die Haarentfernung und ein spezialisierter Laser für Tattoos – sanft zur Haut, wirksam am Ziel." },
  { n: "03", title: "Hygiene ohne Kompromisse", text: "Desinfizierte Flächen, frische Einwegmaterialien und sorgfältige Abläufe sind für mich selbstverständlich." },
  { n: "04", title: "Wohlfühl-Atmosphäre", text: "Helles Licht, Pflanzen, ein weiches Sofa: Mein Studio ist ein Ort zum Ankommen – kein kühles Behandlungszimmer." },
  { n: "05", title: "Du stehst im Mittelpunkt", text: "Ich nehme mir bewusst Zeit für jede Behandlung. Kein Fliessband, keine Hektik – nur du und deine Haut." },
  { n: "06", title: "Ehrliche & transparente Beratung", text: "Ich kläre dich offen über Möglichkeiten und realistische Ergebnisse auf – auch dann, wenn ich dir von etwas abrate." },
];

export const steps = [
  { n: "01", title: "Beratung & Hautanalyse", text: "Wir besprechen deine Wünsche, ich schaue mir Haut, Haar oder Tattoo genau an und erkläre dir ehrlich, was realistisch ist." },
  { n: "02", title: "Testspot", text: "An einer kleinen Stelle teste ich, wie deine Haut reagiert. So stimmen wir die Einstellungen genau auf dich ab." },
  { n: "03", title: "Behandlungsserie", text: "In mehreren Sitzungen – je nach Bereich alle 4–8 Wochen – arbeiten wir Schritt für Schritt auf dein Ziel hin." },
  { n: "04", title: "Nachsorge", text: "Du bekommst klare Pflegetipps mit nach Hause und kannst dich bei Fragen jederzeit per WhatsApp melden." },
];

/**
 * Beispiel-Bewertungen – PLATZHALTER.
 * Bitte durch echte Google-Bewertungen (mit Einverständnis) ersetzen und dann `placeholderReviews` auf false setzen.
 */
export const placeholderReviews = true;
export const reviews = [
  { name: "Laura", treatment: "Haarentfernung Beine", stars: 5, text: "Platzhalter: Ich habe mich vom ersten Moment an wohlgefühlt. Alles wurde mir ruhig erklärt, und die Behandlung war viel angenehmer als gedacht." },
  { name: "Marco", treatment: "Tattooentfernung", stars: 5, text: "Platzhalter: Ehrliche Beratung, keine falschen Versprechen. Nach drei Sitzungen ist mein altes Tattoo schon deutlich heller." },
  { name: "Selina", treatment: "Haarentfernung Achseln", stars: 5, text: "Platzhalter: Wunderschönes Studio, super hygienisch und herzlich. Ich komme jedes Mal gerne wieder." },
  { name: "Nina", treatment: "Aufhellen für Cover-up", stars: 5, text: "Platzhalter: Dank des Aufhellens konnte mein Tätowierer das Cover-up genau so umsetzen, wie ich es wollte." },
];

export type CareCard = { id: string; kicker: string; title: string; items: string[]; tone?: "light" | "green" | "sand" };

export const careCards: CareCard[] = [
  {
    id: "vor-haarlaser",
    kicker: "Prep",
    title: "Was ist vor der Haarlaser-Behandlung zu beachten?",
    items: [
      "Haut unbehandelt lassen – keine Cremes, kein Sonnenschutz, kein Deo, keine Schminke im Behandlungsbereich.",
      "1–2 Tage vorher rasieren – leichte Stoppeln sind ideal.",
      "1 Woche vorher keine Peelings oder Säuren (AHA/BHA).",
      "14 Tage vorher keine Sonne, kein Solarium, kein Selbstbräuner.",
      "4 Wochen vorher nicht wachsen, zupfen oder epilieren.",
    ],
    tone: "light",
  },
  {
    id: "keine-behandlung",
    kicker: "Wichtig",
    title: "Wann darf keine Laserbehandlung durchgeführt werden?",
    items: [
      "Hautkrankheiten im Behandlungsbereich",
      "Lichtempfindlichkeit (z. B. durch Aknemedikamente, Johanniskraut, Antidepressiva)",
      "Akute Infekte (Fieber, Herpes)",
      "Offene Wunden oder Entzündungen",
      "Schwangerschaft & Stillzeit",
      "Frischer Sonnenbrand / starke UV-Exposition",
      "Nach Operationen oder bei nicht vollständig verheilten Narben",
      "Ungeklärte Hautveränderungen",
    ],
    tone: "green",
  },
  {
    id: "nach-tattoo",
    kicker: "Care",
    title: "Nach der Tattoo-Entfernung",
    items: [
      "Platzhalter: Behandelte Stelle 24 Stunden kühlen und trocken halten.",
      "Platzhalter: Bläschen oder leichte Krusten nicht aufstechen oder abkratzen.",
      "Platzhalter: Mehrmals täglich mit der empfohlenen Wundpflege eincremen.",
      "Platzhalter: 2 Wochen kein Schwimmbad, keine Sauna, kein intensiver Sport.",
      "Platzhalter: Stelle konsequent vor Sonne schützen (LSF 50).",
    ],
    tone: "sand",
  },
  {
    id: "nach-haar",
    kicker: "Care",
    title: "Nach der Haarentfernung",
    items: [
      "Platzhalter: Leichte Rötungen sind normal und klingen meist nach wenigen Stunden ab.",
      "Platzhalter: 24–48 Stunden keine Sauna, kein heisses Bad, kein Sport mit starkem Schwitzen.",
      "Platzhalter: Beruhigende, parfumfreie Pflege (z. B. Aloe Vera) verwenden.",
      "Platzhalter: 2 Wochen Sonne meiden und LSF 50 auftragen.",
      "Platzhalter: Zwischen den Sitzungen nur rasieren – nicht wachsen oder epilieren.",
    ],
    tone: "light",
  },
];

export const faqs = [
  { q: "Tut die Behandlung weh?", a: "Die meisten beschreiben das Gefühl als kurzes Zwicken oder wie das Schnalzen eines Gummibands. Der Diodenlaser kühlt die Haut während der Behandlung, bei der Tattooentfernung arbeite ich zusätzlich mit Kühlung. Wir machen jederzeit Pausen, wenn du sie brauchst.", tags: ["haar", "tattoo"] },
  { q: "Wie viele Sitzungen brauche ich?", a: "Bei der Haarentfernung sind meist 6–10 Sitzungen im Abstand von 4–8 Wochen nötig, weil Haare in unterschiedlichen Wachstumsphasen sind. Bei Tattoos hängt es von Farbe, Tiefe, Alter und Hautbild ab – oft 5–10 Sitzungen im Abstand von 6–8 Wochen. In der Beratung bekommst du eine ehrliche Einschätzung. Ergebnisse können individuell variieren.", tags: ["haar", "tattoo"] },
  { q: "Für welche Haut- und Haartypen eignet sich der Diodenlaser?", a: "Der Diodenlaser eignet sich für viele Hauttypen – auch für etwas dunklere Haut. Am besten funktioniert er bei dunklen Haaren. Sehr helle, rote oder graue Haare enthalten kaum Pigment und sprechen meist schlecht an. Das prüfen wir gemeinsam in der Beratung.", tags: ["haar"] },
  { q: "Was bedeutet V-NISSG?", a: "Die Verordnung zum Bundesgesetz über den Schutz vor Gefährdungen durch nichtionisierende Strahlung und Schall (V-NISSG) regelt in der Schweiz kosmetische Laserbehandlungen. Seit dem 1. Juni 2024 braucht es dafür einen Sachkundenachweis. Ich verfüge über diesen Nachweis – du bist also in geschulten Händen.", tags: ["haar", "tattoo"] },
  { q: "Kann jedes Tattoo entfernt werden?", a: "Schwarz und Dunkelblau sprechen am besten an. Rot, Orange und Lila lassen sich meist gut aufhellen. Grün, Türkis, Gelb und sehr helle Farben sind hartnäckiger. Nicht jedes Tattoo verschwindet vollständig – häufig ist aber ein starkes Aufhellen möglich, zum Beispiel für ein Cover-up.", tags: ["tattoo"] },
  { q: "Wie kann ich bezahlen?", a: "Du kannst bequem mit TWINT, Karte oder bar bezahlen. Pakete sind bei der ersten Sitzung fällig.", tags: ["haar", "tattoo"] },
  { q: "Was passiert, wenn ich einen Termin absagen muss?", a: "Termine kannst du bis 24 Stunden vorher kostenlos über den Link in deiner Bestätigungs-E-Mail verschieben oder stornieren. Bei späteren Absagen oder Nichterscheinen kann ich die reservierte Zeit leider in Rechnung stellen (Platzhalter – siehe AGB).", tags: ["haar", "tattoo"] },
];
