# Grundriss Studio

Ein kostenloser Hausplaner im Browser: Grundriss in 2D zeichnen, einrichten und in 3D anschauen oder begehen. Läuft komplett im Browser, ohne Anmeldung und ohne Abo.

## Funktionen

- **Wände & Räume zeichnen**: Rechteck-Räume aufziehen oder Wände Punkt für Punkt zeichnen. Ecken, Wände, Winkel (45°) und ein 5-cm-Raster rasten ein. Länge eintippen + Enter setzt exakte Masse.
- **Automatische Raumerkennung** mit Nettofläche (m²), Innenmassen an jeder Wand und Gesamtmassen des Gebäudes.
- **Türen & Fenster** (Innentür, Glastür, Doppeltür, Schiebetür, Haustür, Durchgang, Garagentor, ein- bis dreiflüglige Fenster, Fenstertüren, Panoramafenster) per Drag & Drop auf die Wand, mit Abstand zu den Ecken.
- **70 Möbel und Bauteile** (Wohnen, Essen, Küche, Schlafen, Bad, Büro, Licht, Deko, Garten, Treppen, Dächer). Grösse, Drehung, Höhe und Farben sind frei einstellbar. Möbel richten sich auf Wunsch magnetisch an Wänden aus.
- **Böden und Wände gestalten**: 18 Bodenbeläge (Parkett, Fliesen, Marmor, Teppich, Beton, Rasen …), Wandfarben und Wandbeläge pro Raum, Fassadenfarbe.
- **Mehrere Geschosse** (Obergeschoss, Dachgeschoss, Keller). Die Aussenwände lassen sich übernehmen.
- **3D-Ansicht** mit Licht und Schatten, Draufsicht, geöffneten Türen und einem **Rundgang** in der Ego-Perspektive (WASD/Pfeiltasten, auf dem Handy mit Steuerkreuz).
- **Plan-Vorlage**: ein Bild eines bestehenden Grundrisses laden, den Massstab mit zwei Punkten festlegen und die Wände nachzeichnen.
- **Export**: Grundriss als PNG (mit Plankopf und Massstab) oder SVG, 3D-Ansicht als PNG, Projektdatei als JSON (Import ebenfalls möglich).
- **Speichern**: automatisch im Browser. Als Claude-Artifact zusätzlich privat im eigenen Konto, damit Projekte auf allen Geräten verfügbar sind.
- Rückgängig/Wiederholen, Mehrfachauswahl, Tastenkürzel, Dunkelmodus (Blaupause), Handy-Layout.

## Benutzen

- `dist/standalone.html` herunterladen und im Browser öffnen, oder den Ordner `dist/` auf einen beliebigen statischen Webserver legen (z.B. GitHub Pages).
- `dist/index.html` ist dieselbe App ohne `<html>`-Rahmen, für die Veröffentlichung als Claude-Artifact.

Eine Internetverbindung braucht die App nur zum Laden von three.js (jsDelivr) und den Schriften (Google Fonts).

## Entwickeln

Quellcode liegt in `src/` als ES-Module:

| Datei | Inhalt |
| --- | --- |
| `util.js` | Geometrie, Formatierung (de-CH), Farben |
| `model.js` | Projektmodell, Wandgraph (Splitten, Zusammenführen), Raumerkennung, Gehrungen |
| `catalog.js` | Möbel aus einfachen Grundkörpern, Türen und Fenster |
| `textures.js` | Prozedurale Texturen für Böden und Wände |
| `plan2d.js` | SVG-Editor: Werkzeuge, Einrasten, Griffe, Export |
| `view3d.js` | three.js-Szene, Tür-/Fenstermodelle, Rundgang, Vorschaubilder |
| `ui.js` | Werkzeugleiste, Katalog, Eigenschaften, Dialoge |
| `storage.js` | Browser-Speicher, Konto-Speicher, Downloads |
| `sample.js` | Beispielhaus |
| `main.js` | App-Steuerung, Verlauf (Rückgängig), Tastenkürzel |

Bauen (Node 18+):

```bash
node build.mjs
```

Das Skript fügt alle Module und `src/index.template.html` zu `dist/index.html` und `dist/standalone.html` zusammen.
