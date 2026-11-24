# Selimi’s Reinigung AG – Website

Statische One-Page-Website mit animiertem Intro. Keine Build-Tools: Ordner auf einen Static-Host legen oder `index.html` direkt im Browser öffnen.

## Struktur

| Datei | Inhalt |
| --- | --- |
| `index.html` | Die ganze Seite (CSS und JavaScript inline) |
| `assets/logo.svg` | Logo: «S» als Wischspur mit Glanz-Funkeln, Verlauf Mint → Blau |
| `assets/favicon.svg` | Favicon (gleich wie das Logo) |

## Intro-Animation (Startseite)

1. Ein Staubsauger fährt von links ins Bild.
2. Er rüttelt, der Sack bläht sich auf und färbt sich rot.
3. Der Sack platzt: Staubwolke, Fetzen fliegen, der Staubsauger wird weggeschleudert und der ganze Bildschirm ist dreckig (auch der Firmenname).
4. Sprechblase: «Hoppla – der Sack ist geplatzt! Keine Sorge, Selimi’s räumt auf.»
5. Ein Wischmopp wischt den Bildschirm Bahn für Bahn sauber, mit nasser Spur und Funkeln.
6. Am Schluss glänzt der Name auf.

Dauer rund 9 Sekunden. «Überspringen» (oder Esc) bricht ab, «Nochmal dreckig machen» spielt das Intro erneut. Bei `prefers-reduced-motion` startet das Intro nicht.

Umgesetzt mit Canvas (Dreck, Partikel, Wischspur) und SVG (Staubsauger, Mopp, Besen) ohne externe Bibliotheken.

## Weitere Abschnitte

- Laufband mit den Leistungen
- Leistungen als Karten mit Lichtkegel, der dem Mauszeiger folgt; beim ersten Hinscrollen fliegt ein Besen vorbei
- Vorher/Nachher-Regler (Maus, Touch und Tastatur)
- Ablauf in vier Schritten, Werte
- Team mit vier Anime-Figuren als SVG: Ardit (CEO), Sadri (Verwaltungsratspräsident), Shushka (Putzfee, mit Flügeln und Zauberstab), Arlinda (Marketing, mit Megafon). Sie blinzeln und atmen; mit der Maus darüber lächeln sie breiter.
- Kontaktformular

## Offene Punkte

- **Kontaktdaten sind Platzhalter**: Telefon, E-Mail (`info@ihre-domain.ch`, auch im `data-mail` am `<form>`) und Adresse ersetzen.
- Das Formular öffnet das E-Mail-Programm des Besuchers. Für direkten Versand einen Formular-Dienst (z. B. Formspree) anbinden.
- Texte zu Leistungen, Werten und den Team-Kurztexten prüfen und an das tatsächliche Angebot anpassen.
- Impressum und Datenschutz verlinken.
