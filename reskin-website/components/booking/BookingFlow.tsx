"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { categoryLabels, contraindications } from "@/lib/catalog";
import { site } from "@/lib/site";
import { formatChf, formatDateLong } from "@/lib/time";
import type { Category, Treatment } from "@/lib/types";
import { HlCare, HlHair, HlTattoo, IconArrow, IconCalendar, IconCheck, IconUpload, IconWhatsApp } from "../Icons";
import { BodyMap } from "./BodyMap";
import { SlotPicker } from "./SlotPicker";

type Result = { token: string; startAt: string; endAt: string; items: { name: string }[]; priceTotal: number | null; category: Category; firstName: string };

const STEPS = ["Behandlung", "Details", "Termin", "Angaben"];

const CATEGORY_CARDS: { id: Category; title: string; text: string; icon: React.ReactNode }[] = [
  { id: "beratung", title: "Kostenlose Beratung", text: "15–20 Min. · Hautanalyse & ehrliche Einschätzung", icon: <span className="font-serif text-2xl">?</span> },
  { id: "haar", title: "Haarentfernung", text: "Diodenlaser · Zonen frei kombinierbar", icon: <HlHair /> },
  { id: "tattoo", title: "Tattooentfernung", text: "Laser · Preis nach Grösse", icon: <HlTattoo /> },
  { id: "kosmetik", title: "Kosmetik", text: "Gesichtsbehandlungen, Brauen & Wimpern", icon: <HlCare /> },
];

const COLORS = [
  { id: "schwarz", label: "Schwarz / dunkel" },
  { id: "farbig", label: "Farbig" },
  { id: "beides", label: "Schwarz & farbig" },
] as const;

const TOPICS = ["Haarentfernung", "Tattooentfernung", "Aufhellen für Cover-up", "Kosmetik", "Noch unsicher"];

export function BookingFlow({ initialCategory }: { initialCategory?: Category }) {
  const [treatments, setTreatments] = useState<Treatment[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [step, setStep] = useState(initialCategory ? 1 : 0);
  const [category, setCategory] = useState<Category | null>(initialCategory ?? null);

  // Details
  const [gender, setGender] = useState<"frau" | "mann">("frau");
  const [zones, setZones] = useState<Set<string>>(new Set());
  const [usePackage, setUsePackage] = useState(false);
  const [tattooSize, setTattooSize] = useState<string | null>(null);
  const [colors, setColors] = useState<(typeof COLORS)[number]["id"] | null>(null);
  const [coverUp, setCoverUp] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [cosmetic, setCosmetic] = useState<Set<string>>(new Set());
  const [topic, setTopic] = useState<string | null>(null);

  // Termin
  const [slot, setSlot] = useState<{ date: string | null; time: string | null }>({ date: null, time: null });
  const [slotRefresh, setSlotRefresh] = useState(0);

  // Angaben
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", note: "", website: "" });
  const [health, setHealth] = useState<Record<string, boolean>>({});
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    fetch("/api/treatments")
      .then((r) => r.json())
      .then((d) => setTreatments(d.treatments))
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: false });
  }, [step, result]);

  const byCat = (c: Category) => (treatments ?? []).filter((t) => t.category === c);
  const hairZones = useMemo(() => (treatments ?? []).filter((t) => t.category === "haar" && t.group === gender), [treatments, gender]);

  const selectedIds: string[] = useMemo(() => {
    if (!category || !treatments) return [];
    if (category === "haar") return [...zones];
    if (category === "tattoo") return tattooSize ? [tattooSize] : [];
    if (category === "kosmetik") return [...cosmetic];
    return byCat("beratung").slice(0, 1).map((t) => t.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, zones, tattooSize, cosmetic, treatments]);

  const selected = selectedIds.map((id) => treatments?.find((t) => t.id === id)).filter(Boolean) as Treatment[];
  const duration = Math.max(15, selected.reduce((s, t) => s + t.durationMin, 0));
  const priceOf = (t: Treatment) => (category === "haar" && usePackage ? t.pricePackage : t.price);
  const total = selected.some((t) => priceOf(t) == null) ? null : selected.reduce((s, t) => s + (priceOf(t) ?? 0), 0);
  const singleTotal = selected.reduce((s, t) => s + (t.price ?? 0), 0);
  const saving = category === "haar" && usePackage && total != null ? singleTotal * 6 - total : 0;

  const needsHealth = category === "haar" || category === "tattoo";
  const healthFlagged = needsHealth && Object.values(health).some(Boolean);

  const detailsValid =
    category === "beratung" ||
    (category === "haar" && zones.size > 0) ||
    (category === "tattoo" && Boolean(tattooSize && colors)) ||
    (category === "kosmetik" && cosmetic.size > 0);
  const contactValid =
    form.firstName.trim() && form.lastName.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()) && form.phone.trim().length >= 7 && consent;

  const canNext = [Boolean(category), detailsValid, Boolean(slot.date && slot.time), Boolean(contactValid)][step];

  function chooseCategory(c: Category) {
    if (c !== category) {
      setSlot({ date: null, time: null });
    }
    setCategory(c);
    setStep(1);
  }

  function toggle(set: Set<string>, id: string, update: (s: Set<string>) => void) {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    update(next);
    setSlot((s) => ({ ...s, time: null })); // Dauer kann sich ändern
  }

  async function submit() {
    if (!category || !slot.date || !slot.time) return;
    setSubmitting(true);
    setError(null);
    const payload = {
      category,
      treatmentIds: selectedIds,
      details: {
        ...(category === "haar" ? { gender, package: usePackage } : {}),
        ...(category === "tattoo" ? { tattooColors: colors, coverUp } : {}),
        ...(category === "beratung" && topic ? { consultTopic: topic } : {}),
      },
      date: slot.date,
      time: slot.time,
      ...form,
      health: needsHealth ? health : {},
      consent,
    };
    const fd = new FormData();
    fd.set("payload", JSON.stringify(payload));
    if (photo && category === "tattoo") fd.set("photo", photo);
    try {
      const res = await fetch("/api/bookings", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Die Buchung hat nicht geklappt.");
        if (res.status === 409) {
          setSlot({ date: slot.date, time: null });
          setSlotRefresh((n) => n + 1);
          setStep(2);
        }
        return;
      }
      setResult(data.booking);
    } catch {
      setError("Keine Verbindung. Bitte prüfe dein Internet und versuche es nochmals.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <p className="text-sm text-alert">
        Die Buchung konnte nicht geladen werden. Bitte versuche es später nochmals oder schreib mir per{" "}
        <a className="underline" href={site.whatsapp}>
          WhatsApp
        </a>
        .
      </p>
    );
  }

  if (result) return <Confirmation result={result} headingRef={headingRef} flagged={healthFlagged} />;

  return (
    <div>
      {/* Fortschritt */}
      <ol className="mb-6 grid grid-cols-4 gap-2" aria-label="Fortschritt">
        {STEPS.map((s, i) => (
          <li key={s} className="min-w-0">
            <button
              type="button"
              disabled={i > step}
              onClick={() => i < step && setStep(i)}
              className="group w-full text-left disabled:cursor-default"
              aria-current={i === step ? "step" : undefined}
            >
              <span className={`block h-[3px] rounded-full transition-colors duration-300 ${i <= step ? "bg-forest" : "bg-sand"}`} />
              <span className={`mt-2 block truncate text-[0.68rem] tracking-[0.12em] uppercase ${i === step ? "text-ink" : "text-muted"}`}>
                <span className="hidden sm:inline">{String(i + 1).padStart(2, "0")} · </span>
                {s}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div key={step} className="step-in">
        {step === 0 && (
          <section>
            <StepHeading refEl={headingRef}>Was möchtest du buchen?</StepHeading>
            <div className="grid gap-3 sm:grid-cols-2">
              {CATEGORY_CARDS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => chooseCategory(c.id)}
                  aria-pressed={category === c.id}
                  className={`flex items-start gap-4 rounded-2xl border p-5 text-left transition-[border-color,background-color,transform,box-shadow] duration-200 active:scale-[0.98] ${
                    category === c.id ? "border-forest bg-cream shadow-[var(--shadow-soft)]" : "border-sand bg-cream/60 hover:border-taupe"
                  }`}
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-sand bg-linen text-forest">{c.icon}</span>
                  <span>
                    <span className="block font-serif text-xl tracking-[0.06em]">{c.title}</span>
                    <span className="mt-1 block text-sm text-muted">{c.text}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-5 text-sm text-muted">
              Unsicher? Starte mit der kostenlosen Beratung – wir finden gemeinsam heraus, was für dich passt.
            </p>
          </section>
        )}

        {step === 1 && category && (
          <section>
            <StepHeading refEl={headingRef}>{categoryLabels[category]}</StepHeading>
            {!treatments && <p className="text-sm text-muted">Behandlungen werden geladen …</p>}

            {treatments && category === "beratung" && (
              <div>
                <p className="mb-4 text-[0.95rem]">
                  In 15–20 Minuten schauen wir uns deine Haut, deine Haare oder dein Tattoo an. Du bekommst eine ehrliche Einschätzung, wie viele Sitzungen realistisch sind – auf Wunsch mit Testspot. Unverbindlich und kostenlos.
                </p>
                <p className="label">Worum geht es? (optional)</p>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <Chip key={t} active={topic === t} onClick={() => setTopic(topic === t ? null : t)}>
                      {t}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {treatments && category === "haar" && (
              <div>
                <div className="mb-5 inline-flex rounded-full border border-sand bg-cream p-1" role="radiogroup" aria-label="Preisliste">
                  {(["frau", "mann"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      role="radio"
                      aria-checked={gender === g}
                      onClick={() => {
                        if (g !== gender) {
                          setGender(g);
                          setZones(new Set());
                        }
                      }}
                      className={`min-h-10 rounded-full px-5 text-sm tracking-[0.1em] uppercase transition-colors duration-200 ${gender === g ? "bg-forest text-linen" : "text-muted"}`}
                    >
                      {g === "frau" ? "Frauen" : "Männer"}
                    </button>
                  ))}
                </div>
                <div className="grid gap-6 md:grid-cols-[200px_1fr]">
                  <div className="hidden md:block">
                    <BodyMap gender={gender} selected={zones} onToggle={(z) => toggle(zones, z, setZones)} available={new Set(hairZones.map((z) => z.id))} />
                    <p className="text-center text-xs text-muted">Tippe auf eine Zone</p>
                  </div>
                  <fieldset>
                    <legend className="label">Körperzonen (Mehrfachauswahl)</legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {hairZones.map((z) => (
                        <label
                          key={z.id}
                          className={`flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-2.5 transition-colors duration-200 ${
                            zones.has(z.id) ? "border-forest bg-cream" : "border-sand bg-cream/60 hover:border-taupe"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <input type="checkbox" className="sr-only" checked={zones.has(z.id)} onChange={() => toggle(zones, z.id, setZones)} />
                            <CheckBox on={zones.has(z.id)} />
                            <span className="text-[0.95rem]">{z.name}</span>
                          </span>
                          <span className="text-right text-xs whitespace-nowrap text-muted">
                            {z.durationMin} Min.
                            <br />
                            {formatChf(usePackage ? z.pricePackage : z.price)}
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-5 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Abrechnung">
                      {[
                        { v: false, title: "Einzelsitzung", text: "Pro Sitzung bezahlen" },
                        { v: true, title: "Paket 6 Sitzungen", text: "ca. 20 % günstiger", badge: "Beliebt" },
                      ].map((o) => (
                        <button
                          key={o.title}
                          type="button"
                          role="radio"
                          aria-checked={usePackage === o.v}
                          onClick={() => setUsePackage(o.v)}
                          className={`relative rounded-xl border px-4 py-3 text-left transition-colors duration-200 ${usePackage === o.v ? "border-forest bg-cream" : "border-sand bg-cream/60 hover:border-taupe"}`}
                        >
                          {o.badge && <span className="absolute -top-2.5 right-3 rounded-full bg-forest px-2.5 py-0.5 text-[0.62rem] tracking-[0.18em] text-linen uppercase">{o.badge}</span>}
                          <span className="block text-[0.95rem]">{o.title}</span>
                          <span className="block text-xs text-muted">{o.text}</span>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </div>
            )}

            {treatments && category === "tattoo" && (
              <div className="space-y-6">
                <fieldset>
                  <legend className="label">Grösse des Tattoos</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {byCat("tattoo").map((t) => (
                      <label
                        key={t.id}
                        className={`flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors duration-200 ${
                          tattooSize === t.id ? "border-forest bg-cream" : "border-sand bg-cream/60 hover:border-taupe"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <input type="radio" name="tattoo-size" className="sr-only" checked={tattooSize === t.id} onChange={() => (setTattooSize(t.id), setSlot((s) => ({ ...s, time: null })))} />
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-sand bg-linen font-serif text-lg">{t.name}</span>
                          <span className="text-sm">{t.description}</span>
                        </span>
                        <span className="text-xs whitespace-nowrap text-muted">{formatChf(t.price)}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="label">Farben</legend>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((c) => (
                      <Chip key={c.id} active={colors === c.id} onClick={() => setColors(c.id)}>
                        {c.label}
                      </Chip>
                    ))}
                  </div>
                </fieldset>
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" className="sr-only" checked={coverUp} onChange={(e) => setCoverUp(e.target.checked)} />
                  <CheckBox on={coverUp} />
                  <span className="text-[0.95rem]">
                    Ziel: <strong>Aufhellen für ein Cover-up</strong>
                    <span className="block text-xs text-muted">Oft reichen dafür weniger Sitzungen.</span>
                  </span>
                </label>
                <div>
                  <p className="label">Foto des Tattoos (optional)</p>
                  <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-taupe/60 bg-cream/60 p-4 transition-colors hover:border-forest">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        if (f && f.size > 6 * 1024 * 1024) {
                          setError("Das Foto ist zu gross (max. 6 MB).");
                          return;
                        }
                        setError(null);
                        setPhoto(f);
                      }}
                    />
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={URL.createObjectURL(photo)} alt="Vorschau des hochgeladenen Tattoos" className="h-16 w-16 rounded-lg object-cover" />
                    ) : (
                      <span className="grid h-16 w-16 place-items-center rounded-lg bg-sand text-forest">
                        <IconUpload />
                      </span>
                    )}
                    <span className="text-sm">
                      {photo ? photo.name : "Foto auswählen"}
                      <span className="block text-xs text-muted">JPG, PNG oder WebP, max. 6 MB – hilft mir bei der Vorbereitung.</span>
                    </span>
                  </label>
                  {error && <p className="mt-2 text-sm text-alert">{error}</p>}
                </div>
              </div>
            )}

            {treatments && category === "kosmetik" && (
              <fieldset>
                <legend className="label">Behandlung(en)</legend>
                <div className="grid gap-2">
                  {byCat("kosmetik").map((t) => (
                    <label
                      key={t.id}
                      className={`flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors duration-200 ${
                        cosmetic.has(t.id) ? "border-forest bg-cream" : "border-sand bg-cream/60 hover:border-taupe"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <input type="checkbox" className="sr-only" checked={cosmetic.has(t.id)} onChange={() => toggle(cosmetic, t.id, setCosmetic)} />
                        <CheckBox on={cosmetic.has(t.id)} />
                        <span>
                          <span className="block text-[0.95rem]">{t.name}</span>
                          {t.description && <span className="block text-xs text-muted">{t.description}</span>}
                        </span>
                      </span>
                      <span className="text-right text-xs whitespace-nowrap text-muted">
                        {t.durationMin} Min.
                        <br />
                        {formatChf(t.price)}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </section>
        )}

        {step === 2 && (
          <section>
            <StepHeading refEl={headingRef}>Wann passt es dir?</StepHeading>
            <p className="-mt-2 mb-5 text-sm text-muted">Angezeigt werden nur freie Zeiten für deine Behandlungsdauer von ca. {duration} Minuten.</p>
            {error && <p className="mb-4 rounded-xl bg-[#F3E6E1] px-4 py-3 text-sm text-alert" role="alert">{error}</p>}
            <SlotPicker durationMin={duration} value={slot} onChange={(v) => (setSlot(v), setError(null))} refreshKey={slotRefresh} />
          </section>
        )}

        {step === 3 && (
          <section>
            <StepHeading refEl={headingRef}>Deine Angaben</StepHeading>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Vorname" autoComplete="given-name" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
              <Field label="Name" autoComplete="family-name" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
              <Field label="E-Mail" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              <Field label="Telefon" type="tel" autoComplete="tel" inputMode="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <div className="sm:col-span-2">
                <label className="label" htmlFor="bk-note">
                  Bemerkung (optional)
                </label>
                <textarea id="bk-note" rows={3} className="field resize-y" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} maxLength={1000} />
              </div>
              {/* Honeypot */}
              <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </div>

            {needsHealth && (
              <fieldset className="mt-6 rounded-2xl border border-sand bg-cream p-5">
                <legend className="px-1 font-condensed text-sm tracking-[0.06em] uppercase">Gesundheitsfragen</legend>
                <p className="mb-3 text-sm text-muted">Trifft aktuell etwas davon auf dich zu? Bitte ankreuzen. Deine Angaben werden vertraulich behandelt.</p>
                <div className="grid gap-2">
                  {contraindications.map((c) => (
                    <label key={c.key} className="flex cursor-pointer items-start gap-3 py-1">
                      <input type="checkbox" className="sr-only" checked={Boolean(health[c.key])} onChange={(e) => setHealth({ ...health, [c.key]: e.target.checked })} />
                      <CheckBox on={Boolean(health[c.key])} />
                      <span className="text-[0.92rem]">{c.label}</span>
                    </label>
                  ))}
                </div>
                {healthFlagged && (
                  <div className="mt-4 rounded-xl border-l-[3px] border-forest bg-sage/40 px-4 py-3 text-sm" role="status">
                    Danke für deine Offenheit. Bitte nimm <strong>vor dem Termin</strong> kurz Kontakt mit mir auf, damit wir abklären können, ob die Behandlung möglich ist – oder buche zuerst die{" "}
                    <button type="button" className="underline underline-offset-4" onClick={() => (setCategory("beratung"), setStep(1))}>
                      kostenlose Beratung
                    </button>
                    .{" "}
                    <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline underline-offset-4">
                      WhatsApp öffnen
                    </a>
                  </div>
                )}
              </fieldset>
            )}

            <label className="mt-6 flex cursor-pointer items-start gap-3">
              <input type="checkbox" className="sr-only" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <CheckBox on={consent} />
              <span className="text-sm">
                Ich akzeptiere die{" "}
                <Link href="/agb" target="_blank" className="underline underline-offset-4">
                  AGB
                </Link>{" "}
                und habe die{" "}
                <Link href="/datenschutz" target="_blank" className="underline underline-offset-4">
                  Datenschutzerklärung
                </Link>{" "}
                gelesen. Ich bin einverstanden, dass meine Angaben (inkl. Gesundheitsangaben) zur Terminplanung und Behandlung gespeichert werden.
              </span>
            </label>
            {error && (
              <p className="mt-4 rounded-xl bg-[#F3E6E1] px-4 py-3 text-sm text-alert" role="alert">
                {error}
              </p>
            )}
          </section>
        )}
      </div>

      {/* Zusammenfassung + Navigation */}
      <div className="sticky bottom-0 -mx-5 mt-8 border-t border-sand bg-linen/95 px-5 pt-4 pb-safe backdrop-blur md:-mx-8 md:px-8">
        {step >= 1 && selected.length > 0 && (
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
            <span className="min-w-0 truncate text-muted">
              {selected.map((s) => s.name).join(", ")}
              {slot.date && slot.time && ` · ${formatDateLong(slot.date + "T12:00:00Z").replace(/^\w+, /, "")} ${slot.time}`}
            </span>
            <span className="whitespace-nowrap">
              ca. {duration} Min. · <strong>{formatChf(total)}</strong>
              {saving > 0 && <span className="ml-2 rounded-full bg-sage px-2 py-0.5 text-xs">Du sparst {formatChf(saving)}</span>}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          {step > 0 ? (
            <button type="button" className="btn btn-outline" onClick={() => (setError(null), setStep(step - 1))}>
              Zurück
            </button>
          ) : (
            <span />
          )}
          {step < 3 ? (
            <button type="button" className="btn btn-primary" disabled={!canNext} onClick={() => (setError(null), setStep(step + 1))}>
              Weiter <IconArrow width={18} height={18} />
            </button>
          ) : (
            <button type="button" className="btn btn-primary" disabled={!canNext || submitting} onClick={submit}>
              {submitting ? "Wird gebucht …" : "Verbindlich buchen"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepHeading({ children, refEl }: { children: React.ReactNode; refEl: React.RefObject<HTMLHeadingElement | null> }) {
  return (
    <h2 ref={refEl} tabIndex={-1} className="h-display mb-5 text-2xl outline-none md:text-[1.75rem]">
      {children}
    </h2>
  );
}

function CheckBox({ on }: { on: boolean }) {
  return (
    <span aria-hidden className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border transition-colors duration-150 ${on ? "border-forest bg-forest text-linen" : "border-taupe bg-cream"}`}>
      {on && <IconCheck width={14} height={14} strokeWidth={2} />}
    </span>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-11 rounded-full border px-4 text-sm transition-[background-color,color,border-color,transform] duration-200 active:scale-95 ${
        active ? "border-forest bg-forest text-linen" : "border-sand bg-cream hover:border-forest"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, value, onChange, type = "text", autoComplete, inputMode }: { label: string; value: string; onChange: (v: string) => void; type?: string; autoComplete?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"] }) {
  const id = `bk-${label.toLowerCase().replace(/\W/g, "")}`;
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label} *
      </label>
      <input id={id} type={type} required autoComplete={autoComplete} inputMode={inputMode} className="field" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Confirmation({ result, headingRef, flagged }: { result: Result; headingRef: React.RefObject<HTMLHeadingElement | null>; flagged: boolean }) {
  const date = formatDateLong(result.startAt);
  const time = new Intl.DateTimeFormat("de-CH", { timeZone: "Europe/Zurich", hour: "2-digit", minute: "2-digit" }).format(new Date(result.startAt));
  return (
    <div className="step-in text-center">
      <span className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-forest text-linen">
        <IconCheck width={30} height={30} strokeWidth={1.6} />
      </span>
      <h2 ref={headingRef} tabIndex={-1} className="h-display text-2xl outline-none md:text-3xl">
        Danke, {result.firstName}!
      </h2>
      <p className="mx-auto mt-3 max-w-md text-muted">Dein Termin ist gebucht. Eine Bestätigung mit allen Infos und Prep-&-Care-Tipps ist per E-Mail unterwegs.</p>
      <div className="card mx-auto mt-6 max-w-md p-5 text-left text-sm">
        <dl className="grid grid-cols-[110px_1fr] gap-y-2">
          <dt className="text-muted">Behandlung</dt>
          <dd>{result.items.map((i) => i.name).join(", ")}</dd>
          <dt className="text-muted">Datum</dt>
          <dd>{date}</dd>
          <dt className="text-muted">Uhrzeit</dt>
          <dd>{time} Uhr</dd>
          <dt className="text-muted">Preis</dt>
          <dd>{formatChf(result.priceTotal)}</dd>
          <dt className="text-muted">Ort</dt>
          <dd>
            {site.address.street}, {site.address.floor}
            <br />
            {site.address.zip} {site.address.city}
          </dd>
        </dl>
      </div>
      {flagged && (
        <p className="mx-auto mt-4 max-w-md rounded-xl border-l-[3px] border-forest bg-sage/40 px-4 py-3 text-left text-sm">
          Du hast bei den Gesundheitsfragen etwas angekreuzt – bitte melde dich vor dem Termin kurz bei mir.
        </p>
      )}
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a className="btn btn-primary" href={`/api/ics/${result.token}`}>
          <IconCalendar width={18} height={18} /> Zum Kalender hinzufügen
        </a>
        <a className="btn btn-outline" href={`/termin/${result.token}`}>
          Verschieben / stornieren
        </a>
      </div>
      <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm text-muted underline-offset-4 hover:underline">
        <IconWhatsApp width={18} height={18} /> Fragen? Schreib mir per WhatsApp
      </a>
    </div>
  );
}
