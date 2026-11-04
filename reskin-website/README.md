# RE|SKIN – Website mit Online-Terminbuchung

Website für **RE|SKIN – Tattoo- & Haarentfernung**, Zentralstrasse 10, 6030 Ebikon.
Next.js 15 (App Router) · Tailwind CSS 4 · Supabase (Datenbank) · Resend (E-Mails).

## Was drin ist

**Website (mobile-first)**
- Startseite mit allen Sektionen: Hero, Highlight-Kreise, Leistungen, Werte 01–06, Ablauf, Vorher/Nachher-Slider, Preise (Tabs), Studio-Galerie, Feedback, Prep & Care, FAQ, Kontakt & Anfahrt
- Unterseiten: `/haarentfernung`, `/tattooentfernung`, `/preise`, `/studio`, `/ratgeber`, `/kontakt`, `/buchen`, `/impressum`, `/datenschutz`, `/agb`
- Sticky Header, Burger-Menü, fixierte Buchungs- und WhatsApp-Leiste auf dem Smartphone
- SEO: Meta-Titel, Open Graph, `BeautySalon`- und `FAQPage`-Daten (JSON-LD), Sitemap, robots.txt
- Barrierefreiheit: Kontraste ≥ 4.5:1 für Fliesstext, Alt-Texte, Tastaturbedienung, Skip-Link, `prefers-reduced-motion`
- Cookie-Hinweis (nur technisch notwendige Cookies), Karte erst nach Klick (OpenStreetMap)

**Online-Buchung** (`/buchen` und als Modal hinter jedem «Termin buchen»-Button)
1. Behandlung: Kostenlose Beratung · Haarentfernung · Tattooentfernung · Kosmetik
2. Details: Körperzonen (Liste + klickbare Silhouette), Einzelsitzung/6er-Paket mit Ersparnis · Tattoo-Grösse, Farben, Cover-up, Foto-Upload
3. Datum & Zeit: nur freie Slots (Öffnungszeiten, Behandlungsdauer, Puffer, Ferien/Blocker)
4. Angaben inkl. Gesundheitsfragen (Hinweis bei «Ja»), AGB/Datenschutz
5. Bestätigung + E-Mail mit .ics-Anhang, Prep-&-Care-Tipps und Link zum Verschieben/Stornieren (bis 24 h vorher), Erinnerung 24 h vorher

Doppelbuchungen werden serverseitig geprüft und zusätzlich per Exclusion-Constraint in der Datenbank verhindert. Preise und Dauer werden immer serverseitig berechnet.

**Admin** (`/admin`)
- Wochenkalender und Liste (Suche, Statusfilter), Detailansicht mit vertraulichen Gesundheitsangaben und Tattoo-Foto
- Status: bestätigt / erledigt / No-Show / storniert, Kunden-Notizen pro Person, Termin-Verlauf
- Öffnungszeiten (mehrere Zeitfenster pro Tag), Buchungsregeln, Ferien & Blocker
- Behandlungen mit Dauer und Preisen bearbeiten, hinzufügen, deaktivieren

## Lokal starten

```bash
cd reskin-website
npm install
cp .env.example .env.local   # Admin-Login und AUTH_SECRET setzen
npm run dev                  # http://localhost:3000
```

Ohne Supabase-Zugang speichert die App lokal in `.data/db.json` (Demo-Modus, nur für Entwicklung).
Ohne Resend-Key werden E-Mails nur in der Konsole ausgegeben.

## Livebetrieb einrichten

1. **Supabase**: Projekt anlegen (Region Zürich oder Frankfurt), `supabase/schema.sql` im SQL-Editor ausführen.
   `SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` setzen. Alle Tabellen haben RLS ohne öffentliche Policies – nur der Server hat Zugriff.
2. **Resend**: Domain verifizieren, `RESEND_API_KEY`, `EMAIL_FROM`, `STUDIO_EMAIL` setzen.
3. **Admin**: `ADMIN_EMAIL`, `ADMIN_PASSWORD_SHA256` (z. B. `echo -n 'passwort' | shasum -a 256`) und ein langes `AUTH_SECRET`.
4. **Erinnerungen**: `/api/cron/reminders` stündlich mit `Authorization: Bearer $CRON_SECRET` aufrufen.
   `vercel.json` enthält einen stündlichen Cron (auf Vercel Hobby nur täglich möglich – dann z. B. Supabase `pg_cron` oder cron-job.org verwenden).
5. Deployment z. B. auf Vercel, `NEXT_PUBLIC_SITE_URL` auf die echte Domain setzen.

## Inhalte ersetzen

| Was | Wo |
| --- | --- |
| Fotos (Instagram/Studio) | nach `public/images/` kopieren, Pfade in `lib/images.ts` anpassen |
| Telefon, E-Mail, UID, Name Inhaberin, Google-Link | `lib/site.ts` (mit `PLATZHALTER` markiert) |
| Preise, Dauer, Behandlungen | im Admin unter «Behandlungen» (Startwerte in `lib/catalog.ts`) |
| Öffnungszeiten | im Admin unter «Öffnungszeiten & Ferien» |
| Werte, Ablauf, FAQ, Pflegetipps, Bewertungen | `lib/content.ts` |
| Impressum, Datenschutz, AGB | `app/(site)/impressum`, `/datenschutz`, `/agb` (Vorlagen – bitte juristisch prüfen) |

Die aktuellen Bilder sind ruhige SVG-Platzhalter im RE|SKIN-Look (Haut, Palmblatt-Schatten, Studio).
Sobald echte Fotos in `lib/images.ts` eingetragen sind, liefert Next.js sie automatisch als WebP/AVIF mit Lazy Loading aus.
Die Bewertungen sind als Beispieltexte gekennzeichnet (`placeholderReviews` in `lib/content.ts`).
