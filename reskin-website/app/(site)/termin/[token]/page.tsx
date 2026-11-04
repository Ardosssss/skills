import type { Metadata } from "next";
import { ManageBooking } from "@/components/booking/ManageBooking";

export const metadata: Metadata = { title: "Termin verwalten", robots: { index: false, follow: false } };

export default async function TerminPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <section className="container-x pt-10 pb-20 md:pt-16">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow mb-3">Mein Termin</p>
        <h1 className="h-display mb-8 text-3xl md:text-4xl">Termin verwalten</h1>
        <ManageBooking token={token} />
      </div>
    </section>
  );
}
