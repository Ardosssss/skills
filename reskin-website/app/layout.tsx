import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost, Oswald } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-cormorant", display: "swap" });
const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-jost", display: "swap" });
const oswald = Oswald({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-oswald", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Laser Haarentfernung & Tattooentfernung Ebikon | RE|SKIN",
    template: "%s | RE|SKIN Ebikon",
  },
  description:
    "Haarentfernung mit Diodenlaser & Laser-Tattooentfernung in Ebikon bei Luzern – zertifiziert nach V-NISSG. Ehrliche Beratung, Wohlfühl-Studio, Termin online buchen.",
  keywords: ["Laser Haarentfernung Luzern", "Laser Haarentfernung Ebikon", "Diodenlaser", "Tattooentfernung Luzern", "Tattooentfernung Ebikon", "V-NISSG", "Kosmetik Ebikon"],
  openGraph: {
    type: "website",
    locale: "de_CH",
    siteName: "RE|SKIN – Tattoo- & Haarentfernung",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "RE|SKIN – Tattoo- & Haarentfernung in Ebikon" }],
  },
  alternates: { canonical: "/" },
  icons: { icon: "/icon.svg" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#F5F2ED",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de-CH" className={`${cormorant.variable} ${jost.variable} ${oswald.variable}`}>
      <body>
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
