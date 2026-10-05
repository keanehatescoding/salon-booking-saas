# Salon / barbershop / spa booking + POS + CRM

- **Concept:** Scheduling, staff/chair management, point-of-sale, deposits, and automated reminders for beauty and grooming businesses, replacing pen-and-paper or plain WhatsApp booking.
- **Origin:** Global — this is one of the most proven SaaS verticals that exists.
- **Examples:** Fresha (130,000+ partner businesses, 1 billion+ appointments booked, $150M Series C, live in 120+ countries), Booksy, Squire (barbershop-specific).
- **Evidence of demand:** Fresha's scale alone shows this category supports platforms processing tens of billions of dollars in bookings; Squire has raised over $180M specifically for the barbershop niche.
- **Kenya landscape:** Searches turned up only generic freelance-built booking apps and global "WhatsApp booking" tools with no Kenya-specific traction — no dominant local player serving Kenyan salons/barbershops at scale.
- **Opportunity:** Kenya's urban beauty/grooming sector (salons, barbershops/"kinyozi", spas) is large and cash/WhatsApp-run; a lightweight, M-Pesa-native booking + POS tool is a natural fit nobody has built yet.
- **Target customers:** Independent salon, barbershop, and spa owners (1–10 chairs) in Nairobi, Mombasa, Kisumu and other urban centers.
- **Revenue model:** Monthly subscription per business, or a small transaction fee on payments processed through the platform.
- **Difficulty:** Low — mostly a booking/CRM CRUD app plus M-Pesa Daraja API integration; no regulatory barrier.
- **Scalability:** High — the same product travels to Uganda, Tanzania, Rwanda with minimal change beyond payment-rail swaps.
- **Risks:** Low willingness-to-pay among very small operators; must prove ROI (fewer no-shows, more repeat bookings) quickly; WhatsApp is a low-friction incumbent habit to displace.
- **MVP:** A booking calendar + WhatsApp reminders + M-Pesa Till payment page, piloted with 10–20 salons in one neighborhood.

## Deep dive

Customers are independent salon and barbershop owners running 1–10 chairs. Price around KSh 1,000–2,500/month per business (well below what a Kenyan SME would pay for a global tool, but real money for a solo operator, so lead with a free tier capped at a small number of monthly bookings). MVP: a booking calendar, automated WhatsApp reminders, and an M-Pesa Till payment page — buildable in a few weeks by one developer. First steps: pick one Nairobi neighborhood with a dense cluster of salons/barbershops, hand-onboard 10–15 of them for free in exchange for feedback, and measure whether no-show rates actually drop before charging anyone.

---

Source: `PROJECTS.md` (Online Business Models: Proven Abroad, Underdeveloped in Kenya).


---

## Stack & dev

Scaffolded as a Next.js 16 + Drizzle (Postgres) app, matching the stack used in `odpc-compliance-saas`. The schema in `src/db/schema.ts` is the current source of truth for the data model; UI, auth and payment integrations are not yet wired up.

```
npm install
# point .env at a Postgres instance, see .env.example
npm run db:generate   # drizzle-kit: emit SQL migrations from the schema
npm run db:migrate    # apply them (migrator script not yet included — copy from odpc-compliance-saas)
npm run dev           # Next.js dev server on :3000
```

What is here:
- `src/db/schema.ts` — Drizzle Postgres schema specific to this domain
- `src/db/index.ts` — pooled `pg` + Drizzle client
- `drizzle.config.ts`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`
- `src/app/globals.css`, `.gitignore`, `.env.example`

What is still a stub:
- `src/app/layout.tsx` + `src/app/page.tsx` — scaffold against the installed Next version (see `node_modules/next/dist/docs/`); the `odpc-compliance-saas` siblings are a working reference.
- Auth (sessions, password reset, email verify) — copy and adapt the `lib/session.ts`, `lib/password.ts`, `lib/email-verification.ts` set from `odpc-compliance-saas`.
- Payments (M-Pesa Daraja / Paystack / card) — stack-specific, add per project.
- `scripts/migrate.ts`, `scripts/seed.ts` — not yet included; the `package.json` scripts expect them.
