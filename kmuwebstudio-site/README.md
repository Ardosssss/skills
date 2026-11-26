# KMU Web Studio – überarbeitetes Design

Statische, überarbeitete Fassung von [kmuwebstudio.ch](https://kmuwebstudio.ch/) als Website mit mehreren Seiten und Anfrageformular. Logo, Schriften, Hero-Video und **alle Farben** stammen unverändert von der bestehenden Seite; die Texte ebenfalls, bis auf die unter «Neue Texte» genannten.

## Seiten

| Datei | Inhalt |
| --- | --- |
| `index.html` | Startseite: Hero, Warum, Angebot in Kürze, Referenzen auf MacBook und iPhone, Manifest, Abschluss mit rundem Anfrage-Button |
| `angebot.html` | Website-Paket mit Fixpreis, «Im Paket» mit vier bewegten Erklärbildern, Konfigurator |
| `ablauf.html` | Vier Schritte, häufige Fragen |
| `referenzen.html` | Sieben Referenzen in zwei Spalten: links vier Websites, rechts drei Lern-Apps, alle gleich gross |
| `kontakt.html` | Anfrageformular, E-Mail-Adresse |
| `impressum.html`, `datenschutz.html` | Rechtliche Seiten |
| `assets/site.css` | Gesamtes Styling, Farbwerte als Variablen in `:root` |
| `assets/site.js` | Menü, Video, Referenzen, Konfigurator, FAQ, Anfrageformular, Bewegungen |
| `assets/brand/`, `assets/fonts/`, `assets/media/`, `assets/refs/` | Logo, Schriften, Hero-Bild und -Video, Bildschirmfotos der Referenzen |

Keine Build-Tools nötig: Ordner auf einen beliebigen Static-Host legen. Lokal ansehen:

```bash
python3 -m http.server 8000
```

Kopfzeile, Fusszeile und Symbole stehen in jeder HTML-Datei. Wer dort etwas ändert, ändert es in allen sieben Dateien.

`assets/site.css` und `assets/site.js` sind mit einer Versionsnummer eingebunden (`site.css?v=…`). Nach einer Änderung an einer der beiden Dateien die Nummer in allen sieben Seiten durch einen neuen Wert ersetzen; sonst zeigen Browser, die die Seite schon kennen, noch die alte Fassung.

## Referenzen: MacBook und iPhone

Jede Referenz steht als MacBook mit einem iPhone daneben da, gebaut nur mit CSS: das MacBook mit schmalem schwarzem Rand, Notch, Menüleiste, Safari-Leiste mit den drei Punkten und der Adresse und einem Unterteil aus Aluminium; das iPhone mit Titanrahmen, Dynamic Island und Seitentasten. In beiden Geräten steckt ein langes Bildschirmfoto der echten Website.

Startseite und Seite Referenzen verhalten sich gleich. Wie man durch eine Website scrollt, hängt vom Gerät ab; das Skript setzt dafür eine Klasse an die Section mit `data-showcase`.

| Gerät | Verhalten |
| --- | --- |
| Computer mit Maus oder Trackpad (`.is-mouse`) | Fährt man mit der Maus auf eine Referenz, wird sie gross: Sie zoomt um die Stelle unter der Maus, liegt auf einer dunklen Karte, und die anderen treten zurück. «Scrollen» erscheint. Scrollt man jetzt, läuft genau diese Website durch MacBook und iPhone, im selben Tempo wie die Seite; die Seite selbst bleibt stehen. Am Ende der Referenz scrollt die Seite normal weiter. Ohne Klick. |
| Handy und Tablet (`.is-touch`) | Jede Website läuft beim Vorbeiscrollen von oben nach unten durch: oben, wenn die Referenz unten ganz hereingekommen ist, am Ende, wenn sie oben ankommt. |
| «Bewegung reduzieren» auf Handy und Tablet, ohne JavaScript | Die Referenzen stehen ruhig; jede zeigt den Anfang ihrer Website. |

| Referenz | Adresse | Bezeichnung |
| --- | --- | --- |
| Swiss Carpoint | swisscarpoint.ch | Fahrzeugservice · Premium, dunkel, präzise |
| Logistikexperte | logistikexperte.ch | Bildung & Beratung · Klar, kompetent, praxisnah |
| Sadri Selimi | selimi.ch | Personal Branding · Editorial, persönlich, klar |
| Ardit Selimi | ardit.ch | Portfolio · Persönlich, lebendig, voller Bewegung |
| HKBa Coach | hkba.live | KI-Lerncoach · Hell, motivierend, interaktiv |
| HKBd Coach | hkbd.live | Lern-App · Ruhig, schlicht, fokussiert |
| QV-Assistent | qv-assistent.ch | QV-Vorbereitung · Warm, farbig, motivierend |

Auf der Startseite stehen die Kategorie und der Name; die Seite `referenzen.html` zeigt zusätzlich die Bezeichnung mit dem Stil.

### Mit Maus

- **Gross zeigen:** Kleine Referenzen werden stärker vergrössert als grosse (höchstens 1,8-fach). Die grosse Referenz bleibt immer innerhalb der Fläche und zwischen Kopfzeile und unterem Bildschirmrand; die Stelle unter der Maus bleibt dabei bedeckt.
- **Kein Hängenbleiben:** Eine Referenz wird nur gewählt, wenn sich die Maus wirklich bewegt. Schiebt das Scrollen der Seite eine Referenz unter den stehenden Mauszeiger, scrollt die Seite einfach weiter. Fährt die Seite die gewählte Referenz unter dem Zeiger weg, ist sie nicht mehr gewählt und gleitet zurück an den Anfang.
- **Tastatur:** Mit der Tabulatortaste lässt sich jede Referenz wählen; mit den Pfeiltasten, Bild auf/ab, Pos1 und Ende scrollt man durch sie.
- Bei «Bewegung reduzieren» gibt es keinen Zoom, keine Schräglage und kein Nachgleiten; das Scrollen durch die Referenz bleibt, weil es direkt an der Hand des Besuchers hängt.

### Anordnung

- **Startseite ab 1041 px Breite:** zwölf Spalten, unterschiedlich gross, versetzt und leicht schräg. Die Plätze stehen in `assets/site.css` bei `.showcase__board > .device:nth-child(1)` bis `(7)`: Spalten (`grid-column`), Versatz nach unten (`margin-top`) und Schräglage (`--tilt`).
- **Startseite 721 bis 1040 px:** zwei versetzte Spalten, die letzte Referenz mittig.
- **Startseite am Handy:** eine Spalte, abwechselnd links und rechts versetzt.
- **Seite Referenzen ab 721 px:** zwei Spalten. Links «Websites» (Swiss Carpoint, Logistikexperte, Sadri Selimi, Ardit Selimi), rechts «Lern-Apps» (HKBa Coach, HKBd Coach, QV-Assistent). Alle sind gleich gross; die drei rechts verteilen sich gleichmässig auf die Höhe der vier links. Schmaler: eine Spalte.

### Bilder und weitere Referenzen

- Die Bilder sind lange Bildschirmfotos: `assets/refs/<name>-desktop-lang.webp` (1200 px breit, aufgenommen mit 1440 px Fensterbreite) und `<name>-mobile-lang.webp` (480 px breit, aufgenommen mit 390 px). Ersetzt man ein Bild, in beiden Seiten im `<img>` Breite und Höhe anpassen.
- Eine weitere Referenz braucht ein Gerät (`.device`, am einfachsten ein bestehendes kopieren) in `index.html` in `.showcase__board` und in `referenzen.html` in der passenden Spalte, den angepassten Satz «Sieben echte KWS-Referenzen …» und auf der Startseite einen Platz für grosse Bildschirme (`.showcase__board > .device:nth-child(8)` in `assets/site.css`).

### Wie die Aufnahmen entstanden sind

- **ardit.ch** koppelt die Projekte an die Scroll-Position. Für eine ruhige Ganzseitenaufnahme wurde die Seite mit reduzierter Bewegung geladen, einmal ganz durchgescrollt (damit alles eingeblendet ist) und danach die Kopplung abgeschaltet. Der Satz unter «Was ich mache» ist im gelesenen, dunklen Zustand aufgenommen. Desktop und Handy zeigen die ganze Seite bis zum Kontakt.
- **HKBd Coach:** Die Startseite allein ist nur eine Bildschirmhöhe hoch. Darunter folgt deshalb die Seite «Leistungsziele», wie auf ardit.ch.
- **HKBa Coach, QV-Assistent** und die drei älteren Referenzen: Startseite von oben, am Desktop bis 5400 px, am Handy bis 3800 px Höhe gekürzt.

## Bewegung

Angeregt von [uiverse.io](https://uiverse.io/elements) (Buttons, Karten, Eingaben), [prompt-motion.com](https://prompt-motion.com/) (bewegte Typografie) und den Produktseiten von Apple (Geräte, Zoom, Überschriften, die Wort für Wort aufsteigen). Eigener Code, ohne Bibliotheken; animiert werden nur `transform`, `opacity` und Strichlängen. [refs.gallery](https://refs.gallery/category/motion) liess sich nicht laden: Die Seite blockiert automatische Browser mit einer Prüfung.

| Stelle | Bewegung |
| --- | --- |
| Wechsel zwischen den Seiten | Weiche Überblendung (View Transitions; Browser ohne Unterstützung wechseln wie gewohnt) |
| Grosse Überschriften | Die Wörter steigen nacheinander auf, wenn die Überschrift ins Bild kommt |
| Kopfzeile | Ein dünner Balken zeigt, wie weit man gescrollt hat |
| Hero der Startseite | Das Bild sinkt beim Scrollen langsamer, der Text hebt sich und blendet aus, die Preiskarte schwebt mit |
| Buttons (Maus) | Ziehen leicht zur Maus; bei den blauen zieht ein Lichtschein durch, und der Pfeil fliegt hinaus und neu herein |
| Karten (Maus) | Neigen sich zur Maus, mit einem Glanz an der Stelle des Zeigers |
| Preiskarte | Ein Lichtrand läuft langsam um die Karte; ein weicher Lichtpunkt folgt der Maus |
| Referenzen | Fliegen gestaffelt ein, die gewählte wird gross, ein Lichtschein folgt der Maus über die Fläche |
| Angebot, «Im Paket» | Vier kleine Filme: eine Farbe wird gewählt, vier Seiten fächern auf, eine Seite passt sich von Desktop über Tablet zum Smartphone an, eine Anfrage wird gesendet. Sie laufen nur, solange sie zu sehen sind |
| Abschluss der Startseite | Runder Button «Anfrage senden» mit drehendem Text-Ring, der zur Maus zieht |
| Häkchen in Listen, Konfigurator | Zeichnen sich nacheinander, wenn die Liste erscheint oder etwas gewählt wird |
| Schritte im Ablauf | Jede Nummer sendet einen Ring aus, sobald die Linie sie erreicht |
| «Kopieren», Formular | Symbol blendet zum Häkchen über; drehender Ring beim Senden, Fehlerhinweise gleiten ein, Häkchen beim Erfolg |

Bei «Bewegung reduzieren» entfallen diese Bewegungen: Überschriften, Bilder und Karten stehen sofort da, der Ring steht still. Effekte mit der Maus gibt es nur auf Geräten mit Maus. Ohne JavaScript ist alles sichtbar.

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
- Kontaktseite: «Kontakt» und «Deine neue Website beginnt hier.» (statt «Bereit für Deinen neuen Auftritt? Lass uns Deine Website starten.»)
- Abschluss der Startseite: «Dein Projekt», «Und jetzt: Deine Website.», «Erzähl uns in ein paar Sätzen, was Dein KMU braucht. Wir melden uns persönlich bei Dir.», «Lieber direkt?» und der Ring «Projekt starten · CHF 500.– Fixpreis · Persönlich».
- Angebot, «Im Paket»: «Das steckt im Fixpreis.», «Jede KWS-Website bringt diese vier Dinge mit.», die Titel «Eigenes Design», «Bis 4 Seiten», «Jedes Gerät», «Klarer Kontakt» und die Sätze darunter (der Satz bei «Jedes Gerät» stammt von der bisherigen Seite).
- Referenzen-Seite: «Sieben echte KWS-Referenzen, vier Websites und drei Lern-Apps, jede auf MacBook und iPhone.», die Spaltentitel «Websites» und «Lern-Apps», «Deine Website als nächste Referenz?»
- Referenzen allgemein: die Bezeichnungen der vier neuen Referenzen (z. B. «KI-Lerncoach · Hell, motivierend, interaktiv»), «Sieben echte KWS-Referenzen, jede zum Durchscrollen.», die Hinweise «Fahre mit der Maus auf eine Website und scrolle durch sie.» (Computer) und «Beim Scrollen läuft jede Website von oben nach unten durch.» (Handy) sowie «Scrollen» auf der gewählten Referenz.
- Ablauf-Seite: «Noch etwas offen? Schreib uns – wir antworten persönlich.»
- Datenschutz, Abschnitt 4: ein Absatz zum Anfrageformular.
- Links zwischen den Seiten: «Angebot ansehen», «Anfrage senden».

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
| Schwebende Module (Design, Seiten, Mobil, Kontakt) überlagern die Preiskarte | Eigener Abschnitt «Im Paket» auf der Angebotsseite: vier Karten mit kleinen bewegten Erklärbildern | Der Preis ist ungestört lesbar, die Leistungen werden anschaulich |
| Referenzen: nachgebaute Attrappen einer einzigen Seite | Die echten Websites und Lern-Apps aller sieben Referenzen auf MacBook und iPhone, von oben bis unten zum Durchscrollen (am Computer: Maus darauf, sie wird gross, dann scrollen) | Zeigt die tatsächliche Arbeit |
| Kontaktbereich «Bereit für Deinen neuen Auftritt?» | Jede Seite endet eigen: Startseite mit rundem Anfrage-Button, Referenzen mit «Deine Website als nächste Referenz?», Angebot mit dem Konfigurator, Ablauf mit den Fragen | Derselbe Abschluss auf jeder Seite nutzt sich ab |
| Deko-Leiste, «Project Lab» | Entfernt | Weniger Ablenkung |

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
