import { faqs } from "@/lib/content";
import { IconPlus } from "../Icons";

export function Faq({ tag, withSchema = true }: { tag?: "haar" | "tattoo"; withSchema?: boolean }) {
  const list = tag ? faqs.filter((f) => f.tags.includes(tag)) : faqs;
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: list.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <div className="mx-auto max-w-3xl">
      {withSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />}
      {list.map((f) => (
        <details key={f.q} className="faq group border-b border-taupe/40">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 font-serif text-[1.2rem] tracking-[0.04em] md:text-[1.35rem]">
            {f.q}
            <span className="faq-icon grid h-9 w-9 shrink-0 place-items-center rounded-full border border-taupe/50 text-forest">
              <IconPlus width={18} height={18} />
            </span>
          </summary>
          <p className="pr-12 pb-6 text-[0.98rem] leading-relaxed text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
