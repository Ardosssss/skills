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

Keine Build-Tools nötig: Ordner auf einen beliebigen Static-Host legen (siehe «Hochladen per FTP»). Lokal ansehen:

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

- **Startseite ab 1041 px Breite:** zwölf Spalten, versetzt und leicht schräg. Swiss Carpoint und Logistikexperte stehen gross nebeneinander am Anfang (je sechs Spalten), die übrigen fünf sind gleich gross (je vier Spalten). Die Plätze stehen in `assets/site.css` bei `.showcase__board > .device:nth-child(1)` bis `(7)`: Spalten (`grid-column`), Versatz nach unten (`margin-top`) und Schräglage (`--tilt`).
- **Startseite 721 bis 1040 px:** Swiss Carpoint und Logistikexperte je in einer eigenen Zeile über zehn Spalten, die übrigen in zwei versetzten Spalten, die letzte mittig.
- **Startseite am Handy:** eine Spalte. Swiss Carpoint und Logistikexperte über die ganze Breite, die übrigen etwas schmaler, abwechselnd links und rechts versetzt.
- **Seite Referenzen ab 721 px:** zwei Spalten. Links «Websites» (Swiss Carpoint, Logistikexperte, Sadri Selimi, Ardit Selimi), rechts «Lern-Apps» (HKBa Coach, HKBd Coach, QV-Assistent). Alle sind gleich gross; die drei rechts verteilen sich gleichmässig auf die Höhe der vier links. Schmaler: eine Spalte.

### Bilder und weitere Referenzen

- Die Bilder sind lange Bildschirmfotos: `assets/refs/<name>-desktop-lang.webp` (1200 px breit, aufgenommen mit 1440 px Fensterbreite) und `<name>-mobile-lang.webp` (480 px breit, aufgenommen mit 390 px). Ersetzt man ein Bild, in beiden Seiten im `<img>` Breite und Höhe anpassen.
- Eine weitere Referenz braucht ein Gerät (`.device`, am einfachsten ein bestehendes kopieren) in `index.html` in `.showcase__board` und in `referenzen.html` in der passenden Spalte, den angepassten Satz «Sieben echte KWS-Referenzen …» und auf der Startseite einen Platz für grosse Bildschirme (`.showcase__board > .device:nth-child(8)` in `assets/site.css`).

### Wie die Aufnahmen entstanden sind

- **ardit.ch** koppelt die Projekte an die Scroll-Position. Für eine ruhige Ganzseitenaufnahme wurde die Seite mit reduzierter Bewegung geladen, einmal ganz durchgescrollt (damit alles eingeblendet ist) und danach die Kopplung abgeschaltet. Der Satz unter «Was ich mache» ist im gelesenen, dunklen Zustand aufgenommen. Desktop und Handy zeigen die ganze Seite bis zum Kontakt.
- **HKBd Coach:** Die Startseite allein ist nur eine Bildschirmhöhe hoch. Darunter folgt deshalb die Seite «Leistungsziele», wie auf ardit.ch.
- **HKBa Coach, QV-Assistent** und die drei älteren Referenzen: Startseite von oben, am Desktop bis 5400 px, am Handy bis 3800 px Höhe gekürzt.

## Bewegung

Angeregt von [uiverse.io](https://uiverse.io/elements) (Buttons, Tooltips, Karten, Eingaben), vom letzten Button auf [ardit.ch](https://ardit.ch/) (KWS-Button), [prompt-motion.com](https://prompt-motion.com/) (bewegte Typografie) und den Produktseiten von Apple (Geräte, Zoom, Überschriften, die Wort für Wort aufsteigen). Eigener Code, ohne Bibliotheken; animiert werden nur `transform`, `opacity` und Strichlängen. [refs.gallery](https://refs.gallery/category/motion) liess sich nicht laden: Die Seite blockiert automatische Browser mit einer Prüfung.

| Stelle | Bewegung |
| --- | --- |
| Wechsel zwischen den Seiten | Weiche Überblendung (View Transitions; Browser ohne Unterstützung wechseln wie gewohnt) |
| Grosse Überschriften | Die Wörter steigen nacheinander auf, wenn die Überschrift ins Bild kommt |
| Kopfzeile | Ein dünner Balken zeigt, wie weit man gescrollt hat |
| Hero der Startseite | Das Bild sinkt beim Scrollen langsamer, der Text hebt sich und blendet aus, die Preiskarte schwebt mit |
| Buttons (Maus) | Ziehen leicht zur Maus; bei den blauen zieht ein Lichtschein durch, und der Pfeil fliegt hinaus und neu herein |
| Karten (Maus) | Neigen sich zur Maus, mit einem Glanz an der Stelle des Zeigers |
| Preiskarte | Ein Lichtrand läuft um die Karte, solange die Maus darauf ist oder der Fokus darin liegt; ein weicher Lichtpunkt folgt der Maus |
| Referenzen | Fliegen gestaffelt ein, die gewählte wird gross, ein Lichtschein folgt der Maus über die Fläche |
| Angebot, «Im Paket» | Vier kleine Filme: eine Farbe wird gewählt, vier Seiten fächern auf, eine Seite passt sich von Desktop über Tablet zum Smartphone an, eine Anfrage wird gesendet. Sie laufen nur, solange sie zu sehen sind; der Knopf «Animationen anhalten» hält sie an |
| Abschluss der Startseite | Runder Button «Anfrage senden», der zur Maus zieht; der Text-Ring dreht sich, solange die Maus darauf ist |
| Häkchen in Listen, Konfigurator | Zeichnen sich nacheinander, wenn die Liste erscheint oder etwas gewählt wird |
| Schritte im Ablauf | Jede Nummer sendet einen Ring aus, sobald die Linie sie erreicht |
| «Kopieren», Formular | Symbol blendet zum Häkchen über; drehender Ring beim Senden, Fehlerhinweise gleiten ein, Häkchen beim Erfolg |
| «Projekt starten» (Kopfzeile, Startseite, Referenzen) | Nach dem letzten Button auf ardit.ch: Der Text gleitet hinaus, das KWS-Zeichen fährt herein, dazu «Los geht’s!» (in der Kopfzeile nur das Zeichen) |
| «Frage stellen» (Ablauf) | Aus dem Pfeil wird eine Chat-Blase mit drei tippenden Punkten |
| Anfrage-Buttons («Unverbindlich anfragen», «Idee an KWS senden», Formular) | Ein Papierflieger hebt ab und kommt wieder |
| Tooltips | «Angebot ansehen»: «CHF 500.– Fixpreis»; «So arbeiten wir»: «In 4 Schritten online»; Referenz-Links: «Öffnet in neuem Tab»; «Kopieren»: «In die Zwischenablage» |
| Navigation in der Kopfzeile | Eine Kapsel gleitet zum Link unter der Maus und zurück zur aktuellen Seite |
| «Das ist dabei» (Startseite) | Ein Lichtrand läuft um den Glas-Button |
| Häufige Fragen, Konfigurator, Fusszeile | Das Plus dreht sich; das Branchen-Symbol hüpft; unter Fusszeilen-Links wächst ein Strich |

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
- Datenschutz: Kurzfassung «Das Wichtigste in Kürze», Inhaltsverzeichnis, die Abschnitte 2 (Welches Recht gilt), 7 (Links), 11 (Beschwerde) und 12 (Keine automatisierten Entscheidungen), die Rechtsgrundlagen nach DSGVO, das Widerspruchsrecht sowie Ergänzungen in den Abschnitten 5, 6, 8, 9 und 10.
- Hinweis unter dem Formular: «Wir verwenden Deine Angaben, um Deine Anfrage zu beantworten. Mehr dazu in der Datenschutzerklärung.»
- Angebot: «Animationen anhalten» / «Animationen abspielen». Externe Links: «(öffnet in neuem Tab)» für Screenreader.
- Buttons und Tooltips: «Los geht’s!», «CHF 500.– Fixpreis», «In 4 Schritten online», «Öffnet in neuem Tab», «In die Zwischenablage».
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

## Datenschutz (DSGVO und Schweizer DSG)

Geprüft am 27. November 2026 anhand der DSGVO auf [dsgvo-gesetz.de](https://dsgvo-gesetz.de/) (Art. 3, 5, 6, 7, 12, 13, 15–21, 25, 27, 28, 30, 32, 44–46, 77 und § 25 TDDDG) und des Schweizer DSG. Keine Rechtsberatung; vor der Veröffentlichung von einer Fachperson prüfen lassen.

**Technik, gemessen auf allen Seiten (Computer und Handy):**

- Die Website lädt nichts von fremden Servern: Schriften, Bilder und Video liegen im Ordner `assets/`. Keine Google Fonts, kein YouTube, keine Karten, kein Tracking, keine eingebetteten Fremdinhalte.
- Keine Cookies, nichts in `localStorage`, `sessionStorage` oder IndexedDB, kein Service Worker. Deshalb braucht es kein Cookie-Banner (§ 25 TDDDG, Art. 6 und 7 DSGVO).
- Links zu den Referenzen öffnen fremde Websites erst beim Klick.
- Das Formular fragt nur, was für eine Antwort nötig ist (Telefon freiwillig), hat nichts vorausgewählt (Art. 25 DSGVO) und fängt Spam mit einem unsichtbaren Feld statt mit reCAPTCHA ab. Solange kein Formular-Dienst eingetragen ist, öffnet es das E-Mail-Programm; es geht also nichts an Dritte.

**Datenschutzerklärung (`datenschutz.html`):** Sie enthält jetzt alle Angaben nach Art. 13 DSGVO und Art. 19 DSG, in einfacher Sprache (Art. 12 DSGVO): Kurzfassung, Inhaltsverzeichnis, verantwortliche Stelle, anwendbares Recht, Zwecke mit Rechtsgrundlagen und berechtigten Interessen, Empfänger und Hosting mit Hinweis auf den Angemessenheitsbeschluss für die Schweiz, Pflichtangaben im Formular, Speicherdauer mit Kriterien, Rechte (Auskunft, Berichtigung, Löschung, Einschränkung, Herausgabe, Widerspruch), ein vom übrigen Text abgehobenes Widerspruchsrecht (Art. 21 Abs. 4 DSGVO), das Beschwerderecht beim EDÖB und bei den EU-Aufsichtsbehörden (Art. 77 DSGVO) sowie keine automatisierten Entscheidungen. Die Adresse ist unverändert übernommen. Abschnitt 4 nennt den Hosting-Anbieter allgemein als Auftragsbearbeiter, weil die Website per FTP zu einem neuen Anbieter umzieht.

**Was KMU Web Studio selbst einhalten muss,** weil es in der Erklärung steht: Anfragen ohne Auftrag löschen, sobald sie erledigt sind; Buchungsbelege zehn Jahre aufbewahren (Art. 958f OR); Auskunftsgesuche kostenlos und in der Regel innerhalb von 30 Tagen beantworten; die Website nur über HTTPS ausliefern.

**Wenn ein Formular-Dienst eingetragen wird** (zum Beispiel Web3Forms), gehen die Angaben an diesen Dienst. Dann in `datenschutz.html`, Abschnitt 5, den Absatz «Das Formular verschickt nichts selbst …» ersetzen, etwa durch:

> Sendest Du das Formular ab, übermittelt es Deine Angaben verschlüsselt an [Name des Dienstes, Sitz], der sie uns als E-Mail zustellt. Der Dienst bearbeitet die Angaben in unserem Auftrag. [Falls der Dienst ausserhalb der Schweiz und der EU sitzt: Für die Übermittlung gelten Standardvertragsklauseln.]

Vorher prüfen, wo der Dienst seinen Sitz hat und wo er die Daten bearbeitet, und mit ihm einen Vertrag zur Auftragsverarbeitung abschliessen (Art. 28 DSGVO, Art. 9 DSG).

**Hosting:** In Abschnitt 4 (Hosting und Empfänger) Name und Sitz des Hosting-Anbieters ergänzen. Liegen dessen Server ausserhalb der Schweiz und der EU, gehört ein Hinweis auf die Garantien dazu (zum Beispiel Standardvertragsklauseln).

**Weitere Punkte zum Prüfen:**

- **Impressum:** Ist KMU Web Studio im Handelsregister eingetragen oder mehrwertsteuerpflichtig, gehören die UID beziehungsweise die MWST-Nummer ins Impressum.
- **EU-Vertreter (Art. 27 DSGVO):** Richtet sich das Angebot gezielt an Kundschaft in der EU, ist ein Vertreter in der EU nötig, ausser die Bearbeitung erfolgt nur gelegentlich und ohne nennenswertes Risiko. Bei einzelnen Anfragen aus der EU ist das in der Regel nicht der Fall.
- **Verzeichnis der Bearbeitungstätigkeiten:** Nach DSG sind Unternehmen mit weniger als 250 Mitarbeitenden befreit, wenn ihre Datenbearbeitung nur ein geringes Risiko mit sich bringt (Art. 12 Abs. 5 DSG, Einzelheiten in der Datenschutzverordnung). Nach DSGVO (Art. 30 Abs. 5) gilt die Ausnahme nur bei gelegentlicher Bearbeitung; regelmässige Kundenanfragen fallen nicht darunter. Ein kurzes Verzeichnis (Anfragen, Kundendaten, Buchhaltung) schadet nicht.

## Bedienung und Zugänglichkeit

- Geprüft mit axe-core 4.10 nach WCAG 2.2 Stufe A und AA sowie Best Practices, auf allen sieben Seiten am Computer und am Handy: keine Verstösse. Dazu ein Tastaturtest: Jeder Tabulator-Stopp hat einen sichtbaren Fokusrahmen und ist im Bild.
- «Zum Inhalt springen» setzt den Fokus auf den Hauptinhalt (`<main id="inhalt" tabindex="-1">`).
- Bewegung, die länger als fünf Sekunden läuft, lässt sich anhalten (WCAG 2.2.2): Hero-Video mit Pause-Knopf, Erklärbilder im Angebot mit «Animationen anhalten». Lichtrand der Preiskarte und Text-Ring laufen nur bei Maus oder Fokus.
- Kontraste: Auf blauem Grund ist das betonte Wort weiss mit einem Cyan-Strich darunter statt cyanfarben (Cyan auf Blau erreicht nur 2,9 : 1). Einleitungstexte auf hellgrauem Grund sind etwas dunkler, Überzeilen auf Blau weiss. Die Farbwerte selbst sind unverändert.
- Der Preis «CHF 500.–» wird von Screenreadern vorgelesen; Links, die einen neuen Tab öffnen, sagen das an.
- Der Pause-Knopf des Videos nennt im Namen, was ein Klick tut («pausieren» oder «abspielen»).
- Buttons reagieren beim Drücken (Skalierung 0.97); Hover-Effekte nur auf Geräten mit Maus.
- Tippflächen sind mindestens 44 px hoch, Eingabefelder haben 16 px Schrift (kein Zoom auf dem iPhone).
- Anfragefenster: Fokus springt ins erste Feld, Escape und Klick neben das Fenster schliessen es, danach liegt der Fokus wieder auf dem auslösenden Button.
- Das Hero-Video lädt erst nach dem Seitenaufbau, pausiert ausserhalb des Sichtfelds und startet bei «Bewegung reduzieren» oder Datensparmodus gar nicht.
- Ohne JavaScript bleiben alle Inhalte lesbar; statt des Formulars steht die E-Mail-Adresse da.
- `prefers-reduced-motion` und `prefers-reduced-transparency` werden berücksichtigt.

## Offene Punkte

- **Versand:** Ohne eingetragenen Formular-Dienst geht keine Anfrage direkt per E-Mail ein (siehe oben).
- **Datenschutz:** Wird ein Formular-Dienst eingetragen oder wechselt das Hosting, die Datenschutzerklärung anpassen (siehe «Datenschutz (DSGVO und Schweizer DSG)»). UID oder MWST-Nummer ins Impressum, falls vorhanden.
- **Live-Seite:** Dieser Ordner ist ein eigenständiger Nachbau. Er ersetzt die Live-Seite erst, wenn er veröffentlicht wird.

## Hochladen per FTP

Alles in diesem Ordner gehört auf den Server, ausser `README.md`:

- die sieben Seiten (`index.html`, `angebot.html`, `ablauf.html`, `referenzen.html`, `kontakt.html`, `impressum.html`, `datenschutz.html`),
- der Ordner `assets/` mit Stil, Skript, Schriften, Logo, Bildern und Video,
- `.htaccess`, `robots.txt` und `sitemap.xml`.

Die Dateien kommen direkt in das Hauptverzeichnis der Domain (je nach Anbieter `public_html`, `httpdocs`, `www` oder `web`), so dass `index.html` dort ganz oben liegt. `.htaccess` beginnt mit einem Punkt und ist deshalb in vielen Programmen versteckt; im FTP-Programm versteckte Dateien einblenden und sie mit hochladen.

`.htaccess` (nur auf Apache-Servern wirksam, andere ignorieren sie) leitet auf HTTPS um, leitet die alten Adressen `/impressum` und `/datenschutz` auf die neuen Seiten weiter, setzt die Dateitypen für Schriften, Bilder und Video und lässt Browser Bilder, Schriften, Stil und Skript zwischenspeichern. Nach dem Hochladen prüfen: `http://kmuwebstudio.ch` muss auf `https://` wechseln, und ein SSL-Zertifikat muss beim Anbieter aktiv sein.

`sitemap.xml` listet die sieben Seiten für Suchmaschinen; sie lässt sich in der Google Search Console einreichen. Jede Seite nennt ihre eigene Adresse als Canonical (`https://kmuwebstudio.ch/angebot.html` usw.).
- **Referenzbilder:** Momentaufnahmen (Swiss Carpoint, Logistikexperte, Sadri Selimi vom 16. November 2026; ardit.ch, HKBa Coach, HKBd Coach, QV-Assistent vom 26. November 2026). Ändert sich eine Referenzseite, die Bilder in `assets/refs/` ersetzen.
