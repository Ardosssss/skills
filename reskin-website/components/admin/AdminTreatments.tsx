"use client";
import { useEffect, useState } from "react";
import { categoryLabels } from "@/lib/catalog";
import type { Category, Treatment } from "@/lib/types";

const CATS: Category[] = ["beratung", "haar", "tattoo", "kosmetik"];

export function AdminTreatments() {
  const [list, setList] = useState<Treatment[] | null>(null);
  const [cat, setCat] = useState<Category>("haar");

  useEffect(() => {
    fetch("/api/admin/treatments").then((r) => r.json()).then((d) => setList(d.treatments));
  }, []);

  if (!list) return <p className="text-muted">Lädt …</p>;
  const rows = list.filter((t) => t.category === cat).sort((a, b) => a.sort - b.sort);

  function addRow() {
    const id = `${cat}-${Date.now().toString(36)}`;
    const maxSort = Math.max(0, ...rows.map((r) => r.sort));
    setList([
      ...list!,
      { id, category: cat, group: cat === "haar" ? "frau" : null, name: "", description: null, durationMin: 30, price: 0, pricePackage: null, active: false, sort: maxSort + 1 },
    ]);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h-display text-2xl md:text-3xl">Behandlungen & Preise</h1>
          <p className="mt-1 text-sm text-muted">Änderungen erscheinen sofort im Buchungstool und nach kurzer Zeit auf der Website.</p>
        </div>
        <button className="btn btn-primary" onClick={addRow}>+ Neue Behandlung</button>
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        {CATS.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`min-h-10 rounded-full border px-4 text-sm ${cat === c ? "border-forest bg-forest text-linen" : "border-sand bg-cream"}`}>
            {categoryLabels[c]}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {rows.map((t) => (
          <Row
            key={t.id}
            t={t}
            onSaved={(n) => setList(list.map((x) => (x.id === n.id ? n : x)))}
            onDeleted={() => setList(list.filter((x) => x.id !== t.id))}
          />
        ))}
      </div>
    </div>
  );
}

function Row({ t, onSaved, onDeleted }: { t: Treatment; onSaved: (t: Treatment) => void; onDeleted: () => void }) {
  const [d, setD] = useState(t);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [err, setErr] = useState("");
  const dirty = JSON.stringify(d) !== JSON.stringify(t);
  const set = <K extends keyof Treatment>(k: K, v: Treatment[K]) => (setD({ ...d, [k]: v }), setState("idle"));
  const money = (v: string) => (v === "" ? null : Number(v));

  async function save() {
    setState("saving");
    const r = await fetch("/api/admin/treatments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
    const res = await r.json();
    if (!r.ok) {
      setState("error");
      setErr(res.error ?? "Fehler");
      return;
    }
    setState("saved");
    onSaved(res.treatment);
  }
  async function del() {
    if (!confirm(`«${t.name || "Neue Behandlung"}» löschen? Bestehende Buchungen bleiben erhalten.`)) return;
    await fetch(`/api/admin/treatments?id=${encodeURIComponent(t.id)}`, { method: "DELETE" });
    onDeleted();
  }

  return (
    <div className={`card grid gap-3 p-4 md:grid-cols-[1.6fr_1.4fr_auto_auto_auto_auto_auto] md:items-end ${d.active ? "" : "opacity-70"}`}>
      <label>
        <span className="label">Name</span>
        <input className="field !min-h-10 !py-1.5" value={d.name} onChange={(e) => set("name", e.target.value)} />
      </label>
      <label>
        <span className="label">Beschreibung</span>
        <input className="field !min-h-10 !py-1.5" value={d.description ?? ""} onChange={(e) => set("description", e.target.value || null)} />
      </label>
      {d.category === "haar" ? (
        <label>
          <span className="label">Gruppe</span>
          <select className="field !min-h-10 !py-1.5" value={d.group ?? "frau"} onChange={(e) => set("group", e.target.value)}>
            <option value="frau">Frauen</option>
            <option value="mann">Männer</option>
          </select>
        </label>
      ) : (
        <span className="hidden md:block" />
      )}
      <label className="md:w-24">
        <span className="label">Dauer (Min.)</span>
        <input type="number" min={5} step={5} className="field !min-h-10 !py-1.5" value={d.durationMin} onChange={(e) => set("durationMin", Number(e.target.value))} />
      </label>
      <label className="md:w-28">
        <span className="label">Preis CHF</span>
        <input type="number" min={0} className="field !min-h-10 !py-1.5" value={d.price ?? ""} placeholder="auf Anfrage" onChange={(e) => set("price", money(e.target.value))} />
      </label>
      {d.category === "haar" ? (
        <label className="md:w-28">
          <span className="label">Paket 6× CHF</span>
          <input type="number" min={0} className="field !min-h-10 !py-1.5" value={d.pricePackage ?? ""} onChange={(e) => set("pricePackage", money(e.target.value))} />
        </label>
      ) : (
        <span className="hidden md:block" />
      )}
      <div className="flex flex-wrap items-center gap-3 md:flex-col md:items-stretch md:gap-1.5">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-forest" checked={d.active} onChange={(e) => set("active", e.target.checked)} /> Aktiv
        </label>
        <div className="flex gap-2">
          <button className="btn btn-primary min-h-9 px-4" disabled={!dirty || state === "saving"} onClick={save}>Speichern</button>
          <button className="btn btn-outline min-h-9 px-3" onClick={del} aria-label="Löschen">✕</button>
        </div>
        {state === "saved" && <span className="text-xs text-forest">Gespeichert</span>}
        {state === "error" && <span className="text-xs text-alert">{err}</span>}
      </div>
    </div>
  );
}
