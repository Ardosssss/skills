import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-x py-28 text-center">
      <p className="eyebrow">404</p>
      <h1 className="h-display mt-4 text-3xl md:text-4xl">Seite nicht gefunden</h1>
      <p className="mt-4 text-muted">Diese Seite gibt es leider nicht (mehr).</p>
      <Link href="/" className="btn btn-primary mt-8">Zur Startseite</Link>
    </section>
  );
}
