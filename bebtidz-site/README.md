# bebtidz. – Website-Neuaufbau

Statischer Neuaufbau von [bebtidz.com](https://bebtidz.com/) mit Animationen nach den Regeln aus `emil-design-eng`, `animate` und `apple-design`.

## Struktur

| Datei | Inhalt |
| --- | --- |
| `index.html` | Startseite: Hero, Marquee, Bestseller, Promo, Trust, Qualität, Ablauf, Versand/COA, FAQ, CTA |
| `shop.html` | Alle Produkte mit Kategorie-Tabs (`?k=Peptide`) |
| `produkt.html?p=<slug>` | Produktdetail mit Galerie, Varianten, Menge, «Ebenfalls beliebt» |
| `kontakt.html` | Kontaktkarten und Formular (öffnet das Mailprogramm) |
| `agb.html`, `datenschutz.html`, `impressum.html` | Rechtstexte (Platzhalter wie im Original markiert) |
| `assets/data.js` | Produktkatalog (Slug, Preise, Varianten, Reinheit) |
| `assets/site.js` | Header, Mobile-Menü, Warenkorb-Drawer, Toasts, Scroll-Reveal, Shop-Filter, Produktseite |
| `assets/site.css` | Design-System, Light/Dark, Motion-Tokens |
| `assets/img/` | Hero, Vial, HPLC-Labor, Versand/COA (generiert) sowie das Original-Vial |

Keine Build-Tools nötig: Ordner auf einen beliebigen Static-Host legen oder lokal mit `python3 -m http.server` öffnen.

## Motion-Entscheidungen

- Enter/Exit mit `cubic-bezier(0.23, 1, 0.32, 1)`, Bewegung auf dem Bildschirm mit `cubic-bezier(0.77, 0, 0.175, 1)`, Drawer mit der iOS-Kurve `cubic-bezier(0.32, 0.72, 0, 1)`.
- UI-Animationen bleiben unter 300 ms (Buttons 140 ms, Tabs 240 ms, Toasts 320 ms ein / 200 ms aus). Nur Marketing-Reveals sind länger.
- Es werden ausschliesslich `transform`, `opacity` und `clip-path` animiert.
- Buttons skalieren beim Drücken auf 0.97, der «In den Warenkorb»-Button morpht per Blur-Crossfade zu «Hinzugefügt».
- Hero-Elemente kommen über `@starting-style` ohne JavaScript herein, Karten und Abschnitte per `IntersectionObserver` einmalig mit 60 ms Stagger.
- Shop-Tabs nutzen die Clip-Path-Technik für einen nahtlosen Farbwechsel des aktiven Tabs.
- Hover-Effekte sind hinter `(hover: hover) and (pointer: fine)` gekapselt, `prefers-reduced-motion` reduziert auf Opacity-Übergänge.

## Offene Punkte

- Checkout («Zur Kasse») ist nicht angebunden; der Warenkorb liegt im `localStorage`.
- AGB, Datenschutz und Impressum enthalten dieselben Platzhalter wie die Live-Seite.
