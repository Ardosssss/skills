# KMU Web Studio – überarbeitetes Design

Statische, überarbeitete Fassung von [kmuwebstudio.ch](https://kmuwebstudio.ch/) als Website mit mehreren Seiten und Anfrageformular. Logo, Schriften, Hero-Video und **alle Farben** stammen unverändert von der bestehenden Seite; die Texte ebenfalls, bis auf die unter «Neue Texte» genannten.

## Seiten

| Datei | Inhalt |
| --- | --- |
| `index.html` | Startseite: Hero, Warum, Angebot in Kürze, drei Referenzen, Manifest, Abschluss |
| `angebot.html` | Website-Paket mit Fixpreis und Leistungen, Konfigurator |
| `ablauf.html` | Vier Schritte, häufige Fragen |
| `referenzen.html` | Drei Referenzen auf Desktop und Smartphone zum Umschalten |
| `kontakt.html` | Anfrageformular, E-Mail-Adresse |
| `impressum.html`, `datenschutz.html` | Rechtliche Seiten |
| `assets/site.css` | Gesamtes Styling, Farbwerte als Variablen in `:root` |
| `assets/site.js` | Menü, Video, Referenz-Auswahl, Konfigurator, FAQ, Anfrageformular |
| `assets/brand/`, `assets/fonts/`, `assets/media/`, `assets/refs/` | Logo, Schriften, Hero-Bild und -Video, Bildschirmfotos der Referenzen |

Keine Build-Tools nötig: Ordner auf einen beliebigen Static-Host legen. Lokal ansehen:

```bash
python3 -m http.server 8000
```

Kopfzeile, Fusszeile und Symbole stehen in jeder HTML-Datei. Wer dort etwas ändert, ändert es in allen sieben Dateien.

## Anfrageformular

Jeder Button «Projekt starten», «Anfrage senden» oder «Unverbindlich anfragen» öffnet das Anfragefenster (am Handy als Blatt von unten). Auf der Kontaktseite steht dasselbe Formular direkt auf der Seite. Der Konfigurator übergibt die Auswahl als Text in die Nachricht.

### Versand per E-Mail einrichten

Eine statische Website kann selbst keine E-Mails verschicken. Das Formular sendet die Angaben deshalb an einen Formular-Dienst, der sie als E-Mail zustellt. Eingerichtet wird das an **einer** Stelle, ganz oben in `assets/site.js`:

```js
var ANFRAGE = {
  endpoint: "",   // z. B. "https://api.web3forms.com/submit"
  accessKey: "",  // Schlüssel des Dienstes
  email: "hallo@kmuwebstudio.ch",
  subject: "Neue Anfrage über kmuwebstudio.ch"
};
```

Mit [Web3Forms](https://web3forms.com/) geht es so:

1. Auf web3forms.com mit `hallo@kmuwebstudio.ch` einen «Access Key» anfordern. Er kommt per E-Mail.
2. `endpoint` auf `https://api.web3forms.com/submit` setzen und den Schlüssel bei `accessKey` eintragen.
3. Eine Testanfrage über die Website senden und prüfen, ob sie im Postfach ankommt.

Das Formular sendet die Felder `name`, `email`, `phone`, `message`, `subject`, `from_name`, `seite` und – falls gesetzt – `access_key` als normales Formular (`multipart/form-data`) und erwartet eine JSON-Antwort. Jeder Dienst, der das annimmt, funktioniert ebenfalls, zum Beispiel Formspree.

**Solange `endpoint` leer ist**, verschickt das Formular nichts selbst: Der Button heisst dann «Anfrage per E-Mail senden» und öffnet das Mailprogramm mit der fertigen Nachricht.

### Verhalten

- Pflichtfelder: Name, E-Mail, Nachricht. Fehler stehen direkt unter dem Feld.
- «Danke für Deine Anfrage» erscheint erst, wenn der Dienst den Versand bestätigt hat. Schlägt er fehl, bleiben die Eingaben erhalten und die E-Mail-Adresse wird als Ausweg genannt.
- Ein unsichtbares Feld fängt einfache Spam-Programme ab.

## Neue Texte

Diese Sätze gab es auf der bisherigen Seite nicht:

- Anfragefenster und Kontaktseite: «Unverbindlich anfragen», «Deine Anfrage», «Erzähl uns kurz von Deinem Projekt. Wir melden uns persönlich bei Dir.», die Feldnamen, Fehlermeldungen und «Danke für Deine Anfrage. Deine Nachricht ist bei uns angekommen. Wir melden uns persönlich bei Dir.»
- Ablauf-Seite: «Noch etwas offen? Schreib uns – wir antworten persönlich.»
- Datenschutz, Abschnitt 4: ein Absatz zum Anfrageformular.
- Links zwischen den Seiten: «Angebot ansehen», «Alle Referenzen ansehen», «Anfrage senden».

## Was sich gegenüber der Live-Seite geändert hat

| Vorher | Nachher | Warum |
| --- | --- | --- |
| Eine lange Seite | Fünf Seiten plus Impressum und Datenschutz | Jede Seite hat ein Thema und eine eigene Adresse |
| Kontakt nur als E-Mail-Link | Anfragefenster auf jeder Seite, Formular auf der Kontaktseite | Anfragen ohne Mailprogramm |
| Ladebildschirm mit 1,45 s künstlicher Wartezeit | Entfernt | Wartezeit ohne Nutzen kostet Besucher |
| Navigation nur ganz oben | Feste Kopfzeile mit «Projekt starten» und grossem Handy-Menü | Der nächste Schritt ist immer erreichbar |
| Beschriftungen in 9–11 px, Fliesstext 13–14 px | Mindestens 12 px für Beschriftungen, 16–19 px für Fliesstext | Lesbarkeit, besonders auf dem Handy |
| Preis im Hero als kleiner, drehender Kreis | Klare Preiskarte, die zum Angebot führt | Der Fixpreis ist das stärkste Argument |
| Karten mit Pfeil, der wie ein Link aussieht, aber nichts tut | Karten mit Symbol | Keine falschen Klickziele |
| Schwebende Module überlagern die Preiskarte | Module als geordnetes Raster | Der Preis ist ungestört lesbar |
| Referenzen: 270 % Bildschirmhöhe mit Scroll-Zwang, nachgebaute Attrappen | Echte Bildschirmfotos im Browser- und Handyrahmen | Schneller, ehrlicher, weniger Scrollen |
| Deko-Leiste, Fortschrittsbalken, magnetische Buttons, «Project Lab» | Entfernt | Weniger Ablenkung |

## Bedienung und Zugänglichkeit

- Buttons reagieren beim Drücken (Skalierung 0.97); Hover-Effekte nur auf Geräten mit Maus.
- Tippflächen sind mindestens 44 px hoch, Eingabefelder haben 16 px Schrift (kein Zoom auf dem iPhone).
- Anfragefenster: Fokus springt ins erste Feld, Escape und Klick neben das Fenster schliessen es, danach liegt der Fokus wieder auf dem auslösenden Button.
- Das Hero-Video lädt erst nach dem Seitenaufbau, pausiert ausserhalb des Sichtfelds und startet bei «Bewegung reduzieren» oder Datensparmodus gar nicht.
- Ohne JavaScript bleiben alle Inhalte lesbar; statt des Formulars steht die E-Mail-Adresse da.
- `prefers-reduced-motion` und `prefers-reduced-transparency` werden berücksichtigt.

## Offene Punkte

- **Versand:** Ohne eingetragenen Formular-Dienst geht keine Anfrage direkt per E-Mail ein (siehe oben).
- **Datenschutz:** Abschnitt 4 nennt den Formular-Dienst noch nicht beim Namen; sobald er feststeht, dort eintragen. Abschnitt 3 nennt ChatGPT Sites als Hosting und muss bei einem Wechsel des Hosts angepasst werden.
- **Live-Seite:** Dieser Ordner ist ein eigenständiger Nachbau. Er ersetzt die Live-Seite erst, wenn er veröffentlicht wird.
- **Referenzbilder:** Momentaufnahmen. Ändert sich eine Referenzseite, die Bilder in `assets/refs/` ersetzen (Desktop 1440 × 900, Smartphone 390 × 844).
