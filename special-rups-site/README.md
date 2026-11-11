# Special Rups – Website im Apple-Design

Statischer Neuentwurf der Startseite von [special-rups.jimdosite.com](https://special-rups.jimdosite.com/) nach den Regeln aus `skills/apple-design`. Texte, Logo und Fotos stammen von der bestehenden Seite.

## Struktur

| Datei | Inhalt |
| --- | --- |
| `index.html` | Die ganze Seite in einer Datei (CSS und JavaScript inline): Hero, Aussage, Shop, Über uns, Kontakt, Warenkorb |
| `assets/` | Logo, Wortmarke und die vier Fotos als WebP in zwei Grössen |

Keine Build-Tools nötig: Ordner auf einen beliebigen Static-Host legen oder `index.html` direkt im Browser öffnen.

## Produkte pflegen

Jedes Produkt ist ein `<article class="product">` im Abschnitt `#shop`:

```html
<article class="product" data-id="mojito-sirup" data-name="Mojito-Sirup" data-price="" data-thumb="assets/foto-2-minze-800.webp">
```

- `data-price` ist der Preis in CHF, z. B. `"9.50"`. Leer bedeutet «Preis auf Anfrage».
- Für ein weiteres Produkt den ganzen Block kopieren und `data-id`, `data-name`, Bilder und Texte anpassen.

## Design-Entscheidungen

- Ein fester, heller Look mit schwarzem Hero; kein automatischer Dunkelmodus.
- Systemschrift (San Francisco auf Apple-Geräten), grosse Titel eng gesetzt, Fliesstext normal.
- Leiste oben als durchscheinende Ebene, der Inhalt scrollt darunter durch.
- Buttons reagieren beim Drücken (Skalierung 0.97), nicht erst beim Loslassen.
- Warenkorb als Sheet: am Desktop von rechts, am Handy von unten. Am Handy lässt er sich am Kopf nach unten ziehen; er folgt dem Finger 1:1, federt beim Hochziehen und schliesst je nach Wurfgeschwindigkeit.
- Öffnen, Schliessen und erneutes Öffnen können sich jederzeit unterbrechen.
- Die Seite ist ohne Scrollen vollständig sichtbar; Einblendungen und der Wort-für-Wort-Effekt der Aussage starten erst beim ersten Scrollen.
- `prefers-reduced-motion`, `prefers-reduced-transparency` und `prefers-contrast` werden berücksichtigt.

## Offene Punkte

- Der Preis des Mojito-Sirups und weitere Produkte fehlen (die Shop-Seite war nicht abrufbar).
- Das Kontaktformular ist nicht angebunden: `data-endpoint` am `<form>` ist leer. Mit der Adresse eines Formular-Dienstes (z. B. Formspree) sendet es Nachrichten und Bestellanfragen.
- «Bestellung anfragen» schreibt den Warenkorb in die Nachricht des Kontaktformulars. Eine Bezahlung gibt es nicht.
- Impressum, Datenschutz, AGB, Lieferbedingungen, Widerrufsbelehrung und Gewährleistung verlinken auf die bestehenden Jimdo-Seiten.
