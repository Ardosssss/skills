# Portfolio – Personal-Brand-Seite

Eine einzelne Seite, die kurz zeigt, was ich mache, und meine Webseiten vorstellt. Der Hero ist ein einziger Block: das Porträt in der Mitte, darum schweben die Projekte, darunter steht der Name. Farben: tiefes Seeblau und ein helleres Blau auf warmem Hellgrau. Jede Projektseite läuft beim Scrollen als ganze Aufnahme durch ein Browser- und ein Handyfenster.

## Struktur

| Datei | Inhalt |
| --- | --- |
| `index.html` | Die ganze Seite in einer Datei (CSS und JavaScript inline): Hero, «Was ich mache», Projekte, Kontakt |
| `assets/` | Pro Projekt WebP-Bilder: Desktop-Aufnahme in 1280 und 1920 px Breite (in doppelter Pixeldichte aufgenommen), Handy-Aufnahme (780 px) und Ausschnitte für die schwebenden Karten im Hero (1080 px, Handys 420 px). Dazu `portrait.webp` |

Keine Build-Tools nötig. Lokal ansehen: im Repo-Ordner `python3 -m http.server` starten und `/portfolio-site/` öffnen.

## Projekte

KMU Web Studio, HKBa Coach, HKBd Coach und QV-Assistent, aufgenommen von den Live-Seiten.

Die Aufnahme von HKBd Coach setzt Startseite und Seite «Leistungsziele» untereinander, weil die Startseite allein zu kurz zum Durchscrollen ist. KMU Web Studio ist mit reduzierter Bewegung aufgenommen, damit alle Abschnitte sichtbar sind.

## Porträt tauschen

Bild im Hochformat 3:4 (am besten 1080 × 1440 px) als `assets/portrait.webp` ablegen. Das aktuelle Porträt ist ein Ausschnitt von 540 × 720 px, mit Real-ESRGAN auf das Doppelte hochgerechnet.

## 3D-Neigung im Hero

Der Block neigt sich zur Maus: Die Ecke gegenüber dem Mauszeiger kommt nach vorn, in der Bildmitte liegt er flach. Die Karten liegen dafür in verschiedenen Tiefen (`translate` mit Z-Wert pro Klasse `f-a` bis `f-f` und beim Porträt). Die Neigung folgt der Maus weich nach, klingt beim Wegscrollen aus und ist ohne Maus sowie bei reduzierter Bewegung aus. Eine Leiste oben gibt es nicht mehr.

## Weitere Bewegung

- Die Karten im Hero sind Links: Ein Klick führt zum jeweiligen Projekt, beim Hover heben sie sich leicht an.
- Unter dem Namen zeigt eine kleine Kapsel mit laufendem Punkt, dass es nach unten weitergeht. Sie blendet beim Scrollen aus.
- Über Design, Umsetzung und Motion läuft je ein kleines Bewegtbild (Flächen ordnen sich um, Zeilen werden geschrieben, ein Punkt fährt eine Kurve ab), nur solange der Abschnitt zu sehen ist.
- Zähler, Titel, Stichworte, Text und Knopf eines Projekts kommen gestaffelt herein.
- Bei «Seite ansehen» wächst die Farbfüllung aus dem Pfeil heraus.

## Handys

Alle Handyrahmen sind im iPhone-Stil gebaut (Titanrahmen, schmaler schwarzer Rand, Dynamic Island, Seitentasten), rein mit CSS und in Anteilen der Gerätebreite, damit sie in jeder Grösse stimmen.

## Weitere Projekte folgen

Nach dem letzten Projekt steht der Abschnitt `#mehr`: Titel mit drei hüpfenden Punkten und ein Fenster, in dem sich vier Szenen ruhig abwechseln, je 7 Sekunden mit weichem Übergang: eine Webseite baut sich auf, Systeme werden verknüpft (Linien zeichnen sich, Punkte laufen darüber), ein Social-Media-Post entsteht samt Like und Statistik, und in einer App wird eine Antwort gewählt. Dauer und Tempo stehen als `--T` und `--D` bei `.soon`. Die Animation läuft nur, solange der Abschnitt zu sehen ist. Kommt ein neues Projekt dazu, wird es davor als `<article class="project">` eingefügt.

## Schwebender Hut

`assets/hat.webp` ist der Hut aus dem Porträt, freigestellt. Ganz oben liegt er deckungsgleich auf dem Kopf im Foto. Beim Scrollen löst er sich, wird etwas grösser und schwebt auf einer Bahn, die der Scroll-Position folgt, durch die ganze Seite. Er liegt über den Farbflächen der Abschnitte und unter Texten und Fenstern. Die Lage des Huts im Porträt gibt `.hat-anchor` im CSS vor (Anteile von Breite und Höhe) und muss angepasst werden, wenn das Porträt getauscht wird. Das Foto selbst zeigt den Hut weiterhin. Sein Farbschimmer passt sich dem Abschnitt an, über dem er schwebt (Farben in `TINTS` im Skript). Ein Klick auf den Hut führt nach oben: Darüber liegt eine unsichtbare Klickfläche, die Klicks an darunterliegende Links weitergibt.

## Mail-Knopf

Der Knopf im Kontakt folgt einem Entwurf von Uiverse.io (barisdogansutcu), in den Farben der Seite: in Ruhe der Kopf neben «E-Mail senden», beim Hover fährt der Kopf gross nach rechts und «Jetzt!» erscheint. Ein Klick oder Tippen zeigt dieselbe Bewegung, öffnet das Mailprogramm und kopiert die Adresse in die Zwischenablage. `assets/head.webp` ist der freigestellte Kopf aus dem Porträt. Die Adresse steht zusätzlich als Text darunter.

## Schwebende Karten im Hero

Jede Karte ist ein `<div class="float">` in der `.scene`. Position und Grösse stehen in den Klassen `f-a` bis `f-f` (eine Anordnung fürs Handy, eine ab 760 px Breite), die Bewegung im `style` in `--ax`/`--ay` (Weg), `--tx`/`--ty` (Dauer) und `--ar` (Drehung). `data-depth` bestimmt, wie stark die Karte beim Scrollen mitzieht.

## Projekt hinzufügen

1. Ganzseitige Aufnahmen der Seite machen: Desktop mit 1280 px Breite in doppelter Pixeldichte, Handy mit 390 px Breite in doppelter Pixeldichte. Als WebP in `assets/` ablegen (`name-desktop-1280.webp`, `name-desktop-1920.webp`, `name-mobile-780.webp`, `name-hero-1080.webp`, `name-phone-420.webp`).
2. In `index.html` einen `<article class="project">` kopieren und Titel, Tags, Text, Link und Bilder anpassen. `width` und `height` der Bilder müssen zur Datei passen.
3. Für die Farbbühne eine Zeile `.project[data-p="name"]{…}` mit den `--p-*`-Farben ergänzen.
4. `--travel` (Desktop) und `--travel-m` (Handy) legen fest, wie lange man durch das Projekt scrollt. Lange Seiten brauchen einen grösseren Wert.
5. Die Zähler `01 / 04` anpassen.

## Motion-Entscheidungen

- Die Aufnahmen sind 1:1 an die Scroll-Position gekoppelt, ohne Easing. Pro Frame wird nur `transform` geschrieben, Grössen werden nur bei Layout-Änderungen gemessen.
- Beim Hereinscrollen fährt die Bühne von 93 % auf 100 % Grösse. Die Karten im Hero schweben über zwei Pendel mit verschiedenen Laufzeiten (reines CSS, pausiert ausserhalb des Sichtfelds) und ziehen beim Scrollen je nach Tiefe unterschiedlich stark mit. Der Satz unter «Was ich mache» wird Wort für Wort dunkel.
- Einblendungen laufen einmalig mit `cubic-bezier(.23,1,.32,1)` und 70 ms Versatz. Buttons skalieren beim Drücken auf 0.97, Hover-Effekte gelten nur für Mausgeräte.
- Mit `prefers-reduced-motion` und ohne JavaScript entfällt die Kopplung. Die Aufnahmen lassen sich dann direkt im Fenster scrollen.

## Offene Punkte

- Ansichten hinter einem Login (z. B. der Assistent im QV-Assistent) sind nicht aufgenommen.
