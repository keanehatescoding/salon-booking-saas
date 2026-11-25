export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-medium text-stone-500">Scaffold · Next.js + Drizzle</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Salon / barbershop / spa booking + POS + CRM</h1>
      <p className="mt-4 text-lg text-stone-600">Scheduling, staff/chair management, point-of-sale, deposits, and automated reminders for beauty and grooming businesses, replacing pen-and-paper or plain WhatsApp booking.</p>
      <p className="mt-8 text-sm text-stone-500">
        The data model lives in <code>src/db/schema.ts</code>. Product UI, authentication and payment
        integrations are not wired up yet.
      </p>
    </main>
  );
}
