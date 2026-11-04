/**
 * Bild-Manifest. Echte Studio- und Instagram-Fotos nach /public/images/ kopieren
 * (am besten als .jpg/.webp, ca. 2000 px lange Seite) und hier `src` ersetzen.
 * Next.js optimiert sie automatisch (WebP/AVIF, Lazy Loading, responsive Grössen).
 */
export type Img = { src: string; alt: string; w: number; h: number };

const ph = (name: string) => `/images/placeholders/${name}.svg`;

export const images = {
  hero: { src: ph("skin-legs"), alt: "Glatte Beine in warmem Tageslicht mit Palmblatt-Schatten", w: 1200, h: 1500 },
  haar: { src: ph("skin-arm"), alt: "Glatte Haut am Arm nach der Laser-Haarentfernung", w: 1200, h: 1500 },
  tattoo: { src: ph("tattoo-before"), alt: "Laser-Tattooentfernung: Behandlung mit weissen Handschuhen", w: 1200, h: 1500 },
  shoulder: { src: ph("skin-shoulder"), alt: "Schulter mit weichem Licht und Palmblatt-Schatten", w: 1200, h: 1500 },
  back: { src: ph("skin-back"), alt: "Rücken in warmem Tageslicht", w: 1200, h: 1500 },
  studioLounge: { src: ph("studio-lounge"), alt: "Studio mit grüner Wand, weissem Bouclé-Rundsofa, rundem Tisch und Wandbild «What if it all works out»", w: 1200, h: 1500 },
  studioRoom: { src: ph("studio-room"), alt: "Heller, weisser Behandlungsraum mit Pflanze und Holzboden", w: 1200, h: 1500 },
  tattooBefore: { src: ph("tattoo-before"), alt: "Tattoo vor der Laserbehandlung (Beispiel)", w: 1200, h: 1500 },
  tattooAfter: { src: ph("tattoo-after"), alt: "Tattoo nach mehreren Laserbehandlungen deutlich aufgehellt (Beispiel)", w: 1200, h: 1500 },
  hairBefore: { src: ph("hair-before"), alt: "Bein mit Haaren vor der Laser-Haarentfernung (Beispiel)", w: 1200, h: 1500 },
  hairAfter: { src: ph("hair-after"), alt: "Glattes Bein nach der Behandlungsserie (Beispiel)", w: 1200, h: 1500 },
} satisfies Record<string, Img>;

/** Galerie (Masonry) – Reihenfolge = Anzeige. */
export const gallery: (Img & { tall?: boolean })[] = [
  { ...images.studioLounge, tall: true },
  images.shoulder,
  images.studioRoom,
  { ...images.hero, tall: true },
  images.back,
  images.haar,
];

/** true, solange noch Platzhalter-Illustrationen verwendet werden */
export const usesPlaceholders = Object.values(images).some((i) => i.src.includes("/placeholders/"));
