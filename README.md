# GasLink Surulere

A marketplace app connecting cooking gas (LPG) buyers with local gas sellers,
starting in **Surulere, Lagos, Nigeria**. Buyers browse verified sellers near
them, compare prices, and place an order that's handed off to the seller via
WhatsApp or phone. Sellers list their business for free and manage incoming
orders from a simple dashboard.

## Features

- **Marketplace home** (`/`) — browse gas sellers seeded across Surulere
  neighbourhoods (Aguda, Ogunlana Drive, Bode Thomas, Adeniran Ogunsanya,
  Ojuelegba, Coker, Lawanson, Itire), with filters for area, cylinder size,
  and delivery availability.
- **Seller detail page** (`/sellers/[id]`) — prices per cylinder size,
  delivery/accessories info, and one-tap WhatsApp/call/order actions.
- **Order flow** (`/order`) — buyers submit a gas request (cylinder size,
  quantity, address); on success they get a reference number and a
  pre-filled WhatsApp message to confirm with the seller directly.
- **Seller onboarding** (`/sell`) — free registration for gas businesses;
  returns a unique dashboard access code.
- **Seller dashboard** (`/dashboard`) — sellers log in with their access
  code to see incoming orders and update order status (pending / confirmed
  / delivered / cancelled).

## Tech stack

- [Next.js](https://nextjs.org) (App Router, TypeScript) + Tailwind CSS
- SQLite via `better-sqlite3` for storage (file at `data/gaslink.db`,
  auto-created and seeded on first run — gitignored)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The database is
created automatically and seeded with sample Surulere gas sellers the first
time the app runs.

Other useful commands:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # lint the codebase
```

## Notes

- Seller "login" uses a per-seller access code (shown once at signup) rather
  than a full auth system — enough for an MVP, not meant for production use
  with sensitive data.
- The marketplace currently seeds sellers for Surulere only, but the schema
  (`city`/`state`/`area` fields) is ready to expand to other Lagos areas or
  cities later.
