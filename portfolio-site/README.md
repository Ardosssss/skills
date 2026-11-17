# Portfolio – Personal-Brand-Seite

Eine einzelne Seite, die kurz zeigt, was ich mache, und meine Webseiten vorstellt. Im Hero steht das Porträt, dahinter schweben die Projekte. Jede Projektseite läuft beim Scrollen als ganze Aufnahme durch ein Browser- und ein Handyfenster.

## Struktur

| Datei | Inhalt |
| --- | --- |
| `index.html` | Die ganze Seite in einer Datei (CSS und JavaScript inline): Hero, «Was ich mache», Projekte, Mitgewirkt, Kontakt |
| `assets/` | Pro Projekt WebP-Bilder: Desktop-Aufnahme in 800 und 1280 px Breite, Handy-Aufnahme (480 px) und kleine Ausschnitte für die schwebenden Karten im Hero. Dazu `portrait-placeholder.svg` |

Keine Build-Tools nötig. Lokal ansehen: im Repo-Ordner `python3 -m http.server` starten und `/portfolio-site/` öffnen.

## Porträt einsetzen

Bild im Hochformat 4:5 (mindestens 800 × 1000 px) in `assets/` ablegen und in `index.html` beim `<figure class="float portrait">` den Pfad `assets/portrait-placeholder.svg` ersetzen. Ein ruhiger, einfarbiger Hintergrund passt am besten zu den Karten dahinter.

## Schwebende Karten im Hero

Jede Karte ist ein `<div class="float">` in der `.scene`. Position und Grösse stehen als `left`, `top` und `width` im `style`, die Bewegung in `--ax`/`--ay` (Weg), `--tx`/`--ty` (Dauer) und `--ar` (Drehung). `data-depth` bestimmt, wie stark die Karte beim Scrollen mitzieht.

## Mitgewirkt

Die drei Karten im Abschnitt `#mitgewirkt` sind Platzhalter. Zum Eintragen `slot--empty` entfernen, ein Bild in `.slot__img` setzen und Status, Titel, Text und Link anpassen.

## Projekt hinzufügen

1. Ganzseitige Aufnahmen der Seite machen: Desktop mit 1280 px Breite, Handy mit 390 px Breite. Als WebP in `assets/` ablegen (`name-desktop-800.webp`, `name-desktop-1280.webp`, `name-mobile-480.webp`, `name-hero-720.webp`).
2. In `index.html` einen `<article class="project">` kopieren und Titel, Tags, Text, Link und Bilder anpassen. `width` und `height` der Bilder müssen zur Datei passen.
3. Für die Farbbühne eine Zeile `.project[data-p="name"]{…}` mit den `--p-*`-Farben ergänzen.
4. `--travel` (Desktop) und `--travel-m` (Handy) legen fest, wie lange man durch das Projekt scrollt. Lange Seiten brauchen einen grösseren Wert.
5. Die Zähler `01 / 03` anpassen.

## Motion-Entscheidungen

- Die Aufnahmen sind 1:1 an die Scroll-Position gekoppelt, ohne Easing. Pro Frame wird nur `transform` geschrieben, Grössen werden nur bei Layout-Änderungen gemessen.
- Beim Hereinscrollen fährt die Bühne von 93 % auf 100 % Grösse. Die Karten im Hero schweben über zwei Pendel mit verschiedenen Laufzeiten (reines CSS, pausiert ausserhalb des Sichtfelds) und ziehen beim Scrollen je nach Tiefe unterschiedlich stark mit. Der Satz unter «Was ich mache» wird Wort für Wort dunkel.
- Einblendungen laufen einmalig mit `cubic-bezier(.23,1,.32,1)` und 70 ms Versatz. Buttons skalieren beim Drücken auf 0.97, Hover-Effekte gelten nur für Mausgeräte.
- Mit `prefers-reduced-motion` und ohne JavaScript entfällt die Kopplung. Die Aufnahmen lassen sich dann direkt im Fenster scrollen.

## Offene Punkte

- Name («Ardit») und Texte sind ein erster Vorschlag.
- Das Porträt und die Projekte unter «Mitgewirkt» sind Platzhalter.
- Die Kontaktadresse ist ein Platzhalter (`hallo@deine-domain.ch`).
- Die Links «Seite ansehen» zeigen auf die Ordner in diesem Repo. Sobald die Seiten online sind, die echten Adressen eintragen.
