# KMU Web Studio – überarbeitetes Design

Statische, überarbeitete Fassung von [kmuwebstudio.ch](https://kmuwebstudio.ch/). Texte, Logo, Schriften, Hero-Video und **alle Farben** stammen unverändert von der bestehenden Seite. Geändert wurden Layout, Typografie, Abstände, Bedienung und Bewegung.

## Struktur

| Datei | Inhalt |
| --- | --- |
| `index.html` | Startseite: Hero, Warum, Angebot, Ablauf, Referenzen, Konfigurator, Manifest, Fragen, Kontakt |
| `impressum.html`, `datenschutz.html` | Rechtliche Seiten, Text 1:1 übernommen |
| `assets/site.css` | Gesamtes Styling, Farbwerte als Variablen in `:root` |
| `assets/site.js` | Menü, Video-Steuerung, Referenz-Tabs, Konfigurator, FAQ, E-Mail kopieren |
| `assets/brand/`, `assets/fonts/`, `assets/media/` | Logo, Oswald und Inter, Hero-Bild und Hero-Video der bestehenden Seite |
| `assets/refs/` | Bildschirmfotos der drei Referenzen (Desktop und Smartphone) |

Keine Build-Tools nötig: Ordner auf einen beliebigen Static-Host legen. Lokal ansehen:

```bash
python3 -m http.server 8000
```

## Was sich geändert hat

| Vorher | Nachher | Warum |
| --- | --- | --- |
| Ladebildschirm «Dein Webauftritt entsteht» (1,45 s künstliche Wartezeit) | Entfernt, der Hero ist sofort da | Wartezeit ohne Nutzen kostet Besucher |
| Navigation nur ganz oben, auf dem Handy ein kleines Aufklappfeld | Feste Kopfzeile mit «Projekt starten», aktivem Abschnitt und grossem Handy-Menü | Der nächste Schritt ist immer erreichbar |
| Beschriftungen in 9–11 px, Fliesstext 13–14 px | Mindestens 12 px für Beschriftungen, 16–19 px für Fliesstext | Lesbarkeit, besonders auf dem Handy |
| Preis im Hero als kleiner, drehender Kreis | Klare Preiskarte, die zum Angebot führt | Der Fixpreis ist das stärkste Argument |
| Zwei Beschriftungen pro Abschnitt, Überschrift in einer schmalen rechten Spalte | Eine Beschriftung, Überschrift links, Einleitung rechts | Ruhigeres, einheitliches Raster |
| Karten mit Pfeil, der wie ein Link aussieht, aber nichts tut | Karten mit Symbol und Nummer | Keine falschen Klickziele |
| Angebot: schwebende Module überlagern die Preiskarte | Module als geordnetes Raster, Preiskarte frei | Der Preis ist ungestört lesbar |
| Referenzen: 270 % Bildschirmhöhe mit Scroll-Zwang, nachgebaute Attrappen, zusätzliches «Project Lab» | Ein Abschnitt mit echten Bildschirmfotos im Browser- und Handyrahmen, Auswahl per Klick oder Pfeiltasten | Schneller, ehrlicher, weniger Scrollen |
| Kontakt nur als Textlink | Kontaktkarte mit Button, Adresse und «Kopieren» | Klarer Abschluss |
| Deko-Leiste «Digital Experience», Fortschrittsbalken, magnetische Buttons | Entfernt | Weniger Ablenkung |
| Einblendungen verschieben Inhalte stark und lassen Lücken | Kurze, gestaffelte Einblendungen (nur `opacity` und `transform`) | Kein leerer Bildschirm beim Scrollen |

## Bedienung und Zugänglichkeit

- Buttons reagieren beim Drücken (Skalierung 0.97); Hover-Effekte nur auf Geräten mit Maus.
- Tippflächen sind mindestens 44 px hoch.
- Referenz-Auswahl und FAQ sind mit der Tastatur bedienbar, Fokus ist sichtbar.
- Das Hero-Video lädt erst nach dem Seitenaufbau, pausiert ausserhalb des Sichtfelds und startet bei «Bewegung reduzieren» oder Datensparmodus gar nicht.
- Ohne JavaScript bleibt alles lesbar: Inhalte sind sichtbar, FAQ-Antworten offen.
- `prefers-reduced-motion` und `prefers-reduced-transparency` werden berücksichtigt.

## Offene Punkte

- Die Live-Seite läuft auf ChatGPT Sites. Dieser Ordner ist ein eigenständiger, statischer Nachbau; er ersetzt die Live-Seite erst, wenn er dort oder auf einem anderen Host veröffentlicht wird.
- Bei einem Wechsel des Hosts muss Abschnitt 3 («Hosting und Empfänger») in `datenschutz.html` angepasst werden.
- Die Referenzbilder sind Momentaufnahmen. Ändert sich eine Referenzseite, die Bilder in `assets/refs/` ersetzen (Desktop 1440 × 900, Smartphone 390 × 844).
- Neu ist nur ein Satz im FAQ-Abschnitt: «Noch etwas offen? Schreib uns – wir antworten persönlich.»
- Kontakt läuft weiterhin über `mailto:`. Ein Formular braucht einen Formular-Dienst.
