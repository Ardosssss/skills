# KMU Web Studio – überarbeitetes Design

Statische, überarbeitete Fassung von [kmuwebstudio.ch](https://kmuwebstudio.ch/) als Website mit mehreren Seiten und Anfrageformular. Logo, Schriften, Hero-Video und **alle Farben** stammen unverändert von der bestehenden Seite; die Texte ebenfalls, bis auf die unter «Neue Texte» genannten.

## Seiten

| Datei | Inhalt |
| --- | --- |
| `index.html` | Startseite: Hero, Warum, Angebot in Kürze, Referenzen, Manifest, Abschluss |
| `angebot.html` | Website-Paket mit Fixpreis und Leistungen, Konfigurator |
| `ablauf.html` | Vier Schritte, häufige Fragen |
| `referenzen.html` | Sieben Referenzen auf Desktop und Smartphone zum Umschalten |
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

`assets/site.css` und `assets/site.js` sind mit einer Versionsnummer eingebunden (`site.css?v=…`). Nach einer Änderung an einer der beiden Dateien die Nummer in allen sieben Seiten durch einen neuen Wert ersetzen; sonst zeigen Browser, die die Seite schon kennen, noch die alte Fassung.

## Referenzen auf der Startseite

Die sieben Referenzen erscheinen je nach Gerät auf drei Arten. Es sind immer dieselben Geräte (`.device`), das Skript setzt nur eine Klasse an `<section id="referenzen">`.

| Gerät | Darstellung |
| --- | --- |
| Computer mit Maus, Fenster ab 721 px breit (`.is-board`) | **Fläche:** Alle Referenzen liegen verteilt, unterschiedlich gross und leicht schräg. Fährt man mit der Maus auf eine, richtet sie sich auf, die anderen treten zurück, und «Scrollen» erscheint. Scrollt man jetzt, läuft genau diese Website durch Browser und Handy; die Seite selbst bleibt stehen. Am Ende der Referenz scrollt die Seite normal weiter. Ohne Klick. |
| Handy, Tablet, schmale Fenster (`.is-scrolly`) | **Szene:** Die Bühne bleibt stehen, jede Referenz hat einen Scroll-Abschnitt von einer Bildschirmhöhe; in ihm läuft die Website von oben nach unten durch beide Rahmen. |
| Ohne JavaScript, «Bewegung reduzieren» ohne Maus, Bildschirme unter 600 px Höhe | **Ruhig:** alle Geräte untereinander, jedes mit Name, Bezeichnung und Link. Am grossen Bildschirm bleibt die Liste links stehen. |

| Referenz | Adresse | Bezeichnung |
| --- | --- | --- |
| Swiss Carpoint | swisscarpoint.ch | Fahrzeugservice · Premium, dunkel, präzise |
| Logistikexperte | logistikexperte.ch | Bildung & Beratung · Klar, kompetent, praxisnah |
| Sadri Selimi | selimi.ch | Personal Branding · Editorial, persönlich, klar |
| Ardit Selimi | ardit.ch | Portfolio · Persönlich, lebendig, voller Bewegung |
| HKBa Coach | hkba.live | KI-Lerncoach · Hell, motivierend, interaktiv |
| HKBd Coach | hkbd.live | Lern-App · Ruhig, schlicht, fokussiert |
| QV-Assistent | qv-assistent.ch | QV-Vorbereitung · Warm, farbig, motivierend |

### Fläche

- **Kein Hängenbleiben:** Eine Referenz wird nur gewählt, wenn sich die Maus wirklich bewegt. Schiebt das Scrollen der Seite eine Referenz unter den stehenden Mauszeiger, scrollt die Seite einfach weiter. Fährt die Seite die gewählte Referenz unter dem Zeiger weg, ist sie nicht mehr gewählt und gleitet zurück an den Anfang.
- **Tastatur:** Mit der Tabulatortaste lässt sich jede Referenz wählen; mit den Pfeiltasten, Bild auf/ab, Pos1 und Ende scrollt man durch sie.
- **Anordnung:** Ab 1041 px Breite stehen die Plätze in `assets/site.css` bei `.is-board .device:nth-child(1)` bis `(7)`: Spalten von 12 (`grid-column`), Versatz nach unten (`margin-top`) und Schräglage (`--tilt`). Zwischen 721 und 1040 px liegen die Referenzen in zwei versetzten Spalten, die letzte mittig.
- Bei «Bewegung reduzieren» gibt es keine Schräglage und kein Nachgleiten; das Scrollen durch die Referenz bleibt, weil es direkt an der Hand des Besuchers hängt.

### Szene

- **Grosse Touch-Geräte** (ab 1041 px Breite und 760 px Höhe, z. B. Tablet quer): Links stehen alle Referenzen mit Nummer und Name, jede mit eigenem Fortschrittsbalken; darunter Bezeichnung und Link der aktuellen.
- **Handy, kleinere Tablets und niedrige Bildschirme:** statt der Namen eine Leiste mit sieben Abschnitten, darunter «04 / 07» mit dem Namen der aktuellen Referenz. Jeder Abschnitt lässt sich antippen.

### Bilder und weitere Referenzen

- Die Bilder sind lange Bildschirmfotos: `assets/refs/<name>-desktop-lang.webp` (1200 px breit, aufgenommen mit 1440 px Fensterbreite) und `<name>-mobile-lang.webp` (480 px breit, aufgenommen mit 390 px). Ersetzt man ein Bild, im `<img>` in `index.html` Breite und Höhe anpassen.
- Eine weitere Referenz braucht in `index.html` einen Eintrag in der Liste (`.showcase__item`) und ein Gerät (`.device`, mit Beschriftung `.device__caption`). Dazu die Zahl `--sc-count` am `<section id="referenzen">` und «/ 07» in `.showcase__now` erhöhen, den Satz «Scrolle durch sieben …» anpassen und in `assets/site.css` einen Platz auf der Fläche ergänzen (`.is-board .device:nth-child(8)`). In `referenzen.html` kommen ein Knopf `.ref-tab` und ein `.stage__panel` dazu (Bilder `<name>-desktop.webp` 1440 × 900 und `<name>-mobile.webp` 585 × 1266).
- Die Seite `referenzen.html` zeigt dieselben Referenzen zum direkten Umschalten per Klick; am Handy als Reihe zum Wischen.

### Wie die Aufnahmen entstanden sind

- **ardit.ch** koppelt die Projekte an die Scroll-Position. Für eine ruhige Ganzseitenaufnahme wurde die Seite mit reduzierter Bewegung geladen, einmal ganz durchgescrollt (damit alles eingeblendet ist) und danach die Kopplung abgeschaltet. Der Satz unter «Was ich mache» ist im gelesenen, dunklen Zustand aufgenommen. Desktop und Handy zeigen die ganze Seite bis zum Kontakt.
- **HKBd Coach:** Die Startseite allein ist nur eine Bildschirmhöhe hoch. Darunter folgt deshalb die Seite «Leistungsziele», wie auf ardit.ch.
- **HKBa Coach, QV-Assistent** und die drei älteren Referenzen: Startseite von oben, am Desktop bis 5400 px, am Handy bis 3800 px Höhe gekürzt.

## Feinbewegungen

Angeregt von den Elementen auf [uiverse.io](https://uiverse.io/elements), aber eigener Code und bewusst wenige. Jede Bewegung gibt eine Rückmeldung an einer Stelle, an der etwas passiert; nichts bewegt sich dauerhaft.

| Stelle | Bewegung | Zweck |
| --- | --- | --- |
| Blaue Buttons (Maus darüber) | Ein Lichtschein zieht einmal durch, der Pfeil fliegt hinaus und neu herein | Zeigt: Hier geht es weiter |
| Häkchen in Listen (Angebot, Hero, Abschluss) | Zeichnen sich nacheinander, wenn die Liste erscheint | Lenkt den Blick kurz auf die Leistungen |
| Seitenwahl im Konfigurator | Häkchen zeichnet sich beim Auswählen | Bestätigt die Auswahl |
| Schritte im Ablauf | Jede Nummer sendet einen Ring aus, sobald die Linie sie erreicht | Macht die Reihenfolge sichtbar |
| Preiskarte und Kontaktkarte (Maus darüber) | Ein weicher Lichtpunkt folgt dem Mauszeiger | Hebt die beiden wichtigsten Karten hervor |
| «Kopieren» | Symbol blendet weich zum Häkchen über | Bestätigt das Kopieren |
| Formular | Drehender Ring beim Senden, Fehlerhinweise gleiten ein, Häkchen zeichnet sich beim Erfolg | Zeigt den Zustand |

Bewusst **nicht** übernommen: leuchtende Neon-Buttons und Farbverläufe (verändern die Farben), schwebende Feldbeschriftungen (schlechter lesbar), hochzählende Preiszahl (lenkt beim Lesen ab), kippende 3D-Karten und ein Lade-Bildschirm. Bei «Bewegung reduzieren» entfallen diese Bewegungen oder werden zu einer einfachen Überblendung; Hover-Effekte gibt es nur auf Geräten mit Maus.

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
- Links zwischen den Seiten: «Angebot ansehen», «Anfrage senden».
- Referenzen: die Bezeichnungen der vier neuen Referenzen (z. B. «KI-Lerncoach · Hell, motivierend, interaktiv») und «Scrolle durch sieben echte KWS-Referenzen.» Dazu der Hinweis «Fahre mit der Maus über eine Website und scrolle.» und «Scrollen» auf der gewählten Referenz.

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
| Referenzen: nachgebaute Attrappen einer einzigen Seite | Die echten Websites und Lern-Apps aller sieben Referenzen, von oben bis unten zum Durchscrollen: am Computer verteilt auf einer Fläche (Maus darauf, scrollen), am Handy als Szene | Zeigt die tatsächliche Arbeit |
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
- **Referenzbilder:** Momentaufnahmen (Swiss Carpoint, Logistikexperte, Sadri Selimi vom 16. November 2026; ardit.ch, HKBa Coach, HKBd Coach, QV-Assistent vom 26. November 2026). Ändert sich eine Referenzseite, die Bilder in `assets/refs/` ersetzen.
