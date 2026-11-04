import { BookingProvider } from "@/components/booking/BookingProvider";
import { CookieNotice } from "@/components/CookieNotice";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileBar } from "@/components/MobileBar";
import { defaultSettings } from "@/lib/catalog";
import { site } from "@/lib/site";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": `${site.url}/#business`,
    name: "RE|SKIN – Tattoo- & Haarentfernung",
    url: site.url,
    image: `${site.url}/og.png`,
    telephone: site.phone,
    email: site.email,
    priceRange: "CHF",
    currenciesAccepted: "CHF",
    paymentAccepted: "TWINT, Kreditkarte, Debitkarte, Bargeld",
    address: {
      "@type": "PostalAddress",
      streetAddress: `${site.address.street}, ${site.address.floor}`,
      postalCode: site.address.zip,
      addressLocality: site.address.city,
      addressRegion: site.address.canton,
      addressCountry: "CH",
    },
    geo: { "@type": "GeoCoordinates", latitude: site.address.lat, longitude: site.address.lng },
    areaServed: ["Ebikon", "Luzern", "Root", "Dierikon", "Buchrain", "Adligenswil", "Emmen"],
    sameAs: [site.instagram],
    openingHoursSpecification: defaultSettings.openingHours.flatMap((ranges, d) =>
      ranges.map((r) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: `https://schema.org/${days[d]}`, opens: r.start, closes: r.end })),
    ),
    makesOffer: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Laser-Haarentfernung mit Diodenlaser" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Laser-Tattooentfernung" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Kosmetik" } },
    ],
    ...(site.googleRating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: site.googleRating.value, reviewCount: site.googleRating.count } } : {}),
  };
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <BookingProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <MobileBar />
      <CookieNotice />
    </BookingProvider>
  );
}
