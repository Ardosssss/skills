# RE | SKIN – Website

Statische One-Page-Website für das Studio «RE | SKIN – Tattoo- & Haarentfernung». Keine Build-Tools nötig: Ordner auf einen beliebigen Static-Host legen (Netlify, Cloudflare Pages, Hostpoint …) oder lokal mit `python3 -m http.server` öffnen.

## Aufbau

| Bereich | Inhalt |
| --- | --- |
| Hero | Logo als Schriftzug, ein Laserstrahl fährt beim Laden darüber und legt ihn frei. Palmenschatten wie auf Instagram |
| Behandlungen | Haarentfernung (ab 29.–) und Tattooentfernung (ab 149.–), Direktlink in die Buchung |
| Studio | «Qualität hat ihren Grund» und vier Werte |
| Ablauf | Vier Schritte und eine interaktive Erklärung: «Warum reicht eine Sitzung nicht?» (Haarzyklus zum Durchklicken) |
| Prep & Care | Vorher und nachher |
| Preise | Umschalter Haar / Tattoo, Angebote (Neukunden, Treue, Gutschein) |
| Termin buchen | 4 Schritte: Behandlung → Zonen/Grösse → Tag und Uhrzeit → Kontakt. Danach Versand per WhatsApp oder E-Mail (vorausgefüllt) und Kalenderdatei (.ics) |
| FAQ | 9 Fragen als Akkordeon |
| Kontakt | Adresse, Öffnungszeiten, Telefon, E-Mail, Instagram |

## Vor dem Livegang anpassen

Alles Wichtige steht oben in `assets/site.js`:

- `CONFIG` – Telefon, WhatsApp-Nummer, E-Mail, Instagram, Adresse, Öffnungszeiten (**zurzeit Platzhalter**)
- `SERVICES` – Zonen und Preise. Gesichert sind nur «ab 29.–», «ab 149.–» und «Achseln 1. Behandlung 35.–», der Rest sind Platzhalter
- `FAQ` – Fragen und Antworten
- `CONFIG.formEndpoint` – optional, z. B. eine Formspree-URL. Dann landen Anfragen direkt im Postfach statt über WhatsApp oder E-Mail
- Impressum und Datenschutz im Footer verlinken noch auf `#`

## Technik

- `index.html`, `assets/site.css`, `assets/site.js`, `assets/favicon.svg`
- Schriften: Cormorant Garamond (Titel, wie das Logo) und Arial (Text)
- Animationen nur mit `transform`, `opacity` und `clip-path`, Hover nur auf Geräten mit Maus, `prefers-reduced-motion` wird beachtet
