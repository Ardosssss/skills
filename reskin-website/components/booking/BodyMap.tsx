"use client";

type Region = { zone: string; label: string; shape: React.ReactElement };

const limb = (x1: number, y1: number, x2: number, y2: number, w: number) => <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={w} strokeLinecap="round" />;
const mirror = (el: React.ReactElement) => <g transform="translate(200 0) scale(-1 1)">{el}</g>;
const both = (el: React.ReactElement) => (
  <>
    {el}
    {mirror(el)}
  </>
);

const women: Region[] = [
  { zone: "h-f-gesicht", label: "Gesicht", shape: <ellipse cx="100" cy="47" rx="13" ry="11" /> },
  { zone: "h-f-achseln", label: "Achseln", shape: both(<ellipse cx="66" cy="100" rx="6" ry="9" />) },
  { zone: "h-f-arme", label: "Oberarme", shape: both(limb(58, 92, 47, 148, 15)) },
  { zone: "h-f-unterarme", label: "Unterarme", shape: both(limb(46, 154, 38, 212, 13)) },
  { zone: "h-f-bauchlinie", label: "Bauchlinie", shape: <rect x="96" y="140" width="8" height="44" rx="4" /> },
  { zone: "h-f-bikini", label: "Bikinizone", shape: <path d="M80 196 L120 196 L100 222 Z" strokeLinejoin="round" strokeWidth="4" /> },
  { zone: "h-f-oberschenkel", label: "Oberschenkel", shape: both(limb(86, 214, 84, 298, 26)) },
  { zone: "h-f-unterschenkel", label: "Unterschenkel", shape: both(limb(84, 312, 86, 404, 20)) },
];
const men: Region[] = [
  { zone: "h-m-bartkontur", label: "Bartkontur", shape: <ellipse cx="100" cy="50" rx="15" ry="11" /> },
  { zone: "h-m-schultern", label: "Schultern", shape: both(<ellipse cx="66" cy="84" rx="12" ry="7" />) },
  { zone: "h-m-achseln", label: "Achseln", shape: both(<ellipse cx="66" cy="102" rx="6" ry="9" />) },
  { zone: "h-m-arme", label: "Arme", shape: both(<>{limb(58, 96, 47, 148, 15)}{limb(46, 154, 38, 212, 13)}</>) },
  { zone: "h-m-brust", label: "Brust", shape: <ellipse cx="100" cy="114" rx="27" ry="14" /> },
  { zone: "h-m-bauch", label: "Bauch", shape: <ellipse cx="100" cy="160" rx="22" ry="20" /> },
  { zone: "h-m-intim", label: "Intimbereich", shape: <path d="M82 198 L118 198 L100 222 Z" strokeLinejoin="round" strokeWidth="4" /> },
  { zone: "h-m-beine", label: "Beine", shape: both(<>{limb(86, 214, 84, 298, 26)}{limb(84, 312, 86, 404, 20)}</>) },
];

/** Klickbare Körper-Silhouette (Vorderseite). Ergänzt die zugängliche Checkbox-Liste. */
export function BodyMap({ gender, selected, onToggle, available }: { gender: "frau" | "mann"; selected: Set<string>; onToggle: (zone: string) => void; available: Set<string> }) {
  const regions = (gender === "frau" ? women : men).filter((r) => available.has(r.zone));
  return (
    <svg viewBox="0 0 200 440" className="mx-auto h-[340px] w-auto select-none md:h-[400px]" aria-hidden>
      {/* Silhouette */}
      <g fill="#E7E1D8" stroke="#E7E1D8">
        <ellipse cx="100" cy="40" rx="20" ry="25" />
        <rect x="92" y="60" width="16" height="16" />
        <path d="M62 80 Q100 70 138 80 L146 98 L140 150 Q136 176 142 206 L58 206 Q64 176 60 150 L54 98 Z" />
        {both(limb(58, 92, 47, 148, 15))}
        {both(limb(46, 154, 38, 212, 13))}
        {both(limb(86, 214, 84, 298, 26))}
        {both(limb(84, 312, 86, 404, 20))}
        {both(<ellipse cx="88" cy="414" rx="12" ry="6" />)}
      </g>
      {regions.map((r) => {
        const on = selected.has(r.zone);
        return (
          <g
            key={r.zone}
            onClick={() => onToggle(r.zone)}
            className="cursor-pointer transition-[fill,stroke,opacity] duration-200"
            fill={on ? "#3E4D42" : "#C9D1C4"}
            stroke={on ? "#3E4D42" : "#C9D1C4"}
            opacity={on ? 0.9 : 0.55}
          >
            <title>{r.label}</title>
            {r.shape}
          </g>
        );
      })}
    </svg>
  );
}
