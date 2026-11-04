export function Logo({ light = false, compact = false, className = "" }: { light?: boolean; compact?: boolean; className?: string }) {
  return (
    <span className={`inline-flex flex-col items-center leading-none ${className}`}>
      <span className={`font-serif text-[1.6rem] tracking-[0.22em] md:text-[1.75rem] ${light ? "text-linen" : "text-ink"}`} style={{ fontWeight: 500 }}>
        RE<span className={`mx-[0.08em] font-light ${light ? "text-sage" : "text-taupe"}`}>|</span>SKIN
      </span>
      {!compact && (
        <span className={`mt-1 text-[0.5rem] tracking-[0.38em] uppercase md:text-[0.55rem] ${light ? "text-sage" : "text-muted"}`}>
          Tattoo- &amp; Haarentfernung
        </span>
      )}
      <span className="sr-only">RE|SKIN – Tattoo- und Haarentfernung, Startseite</span>
    </span>
  );
}
