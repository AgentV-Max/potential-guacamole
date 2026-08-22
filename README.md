# GasLink Surulere

A marketplace app connecting cooking gas (LPG) buyers with local gas sellers,
starting in **Surulere, Lagos, Nigeria**. Buyers browse verified sellers near
them, estimate their gas usage, and pay through an escrow flow that only
releases funds once delivery is confirmed. Sellers list their business for
free and manage incoming orders and payouts from a simple dashboard.

## Features

- **Marketplace home** (`/`) — browse gas sellers seeded across Surulere
  neighbourhoods (Aguda, Ogunlana Drive, Bode Thomas, Adeniran Ogunsanya,
  Ojuelegba, Coker, Lawanson, Itire), with filters for area, cylinder size,
  and delivery availability.
- **Gas usage calculator** (`/calculator`) — estimate net gas weight, burn
  duration, and days of supply left from cylinder size, current fill level,
  household size, and cooking style, with a suggested refill date.
- **Seller detail page** (`/sellers/[id]`) — prices per cylinder size,
  delivery/accessories info, and one-tap WhatsApp/call/order actions.
- **Order + escrow payment flow** (`/order`, `/orders/[id]`) — buyers submit
  a gas request for a priced cylinder size, see a live total, and pay
  through escrow: funds are held until the buyer confirms their gas arrived
  at the correct weight, with a built-in dispute option if it didn't.
- **Seller onboarding** (`/sell`) — free registration for gas businesses,
  including optional payout bank details; returns a unique dashboard access
  code.
- **Seller dashboard** (`/dashboard`) — sellers log in with their access
  code to see incoming orders, update order status, and track payment/payout
  state per order (awaiting payment / held in escrow / paid out / disputed).

## Escrow payment lifecycle

1. Buyer places an order for a cylinder size the seller has priced; the
   server computes the total (never trusts a client-sent amount).
2. Buyer pays — funds are held, not sent to the seller yet
   (`payment_status: paid_held`).
3. Seller marks the order **delivered** from their dashboard.
4. Buyer confirms receipt and the correct weight, which releases the payout
   to the seller (`payment_status: released`) — or reports a problem, which
   flags it for manual resolution (`payment_status: disputed`) and keeps
   funds held.

A 5% platform commission (`PLATFORM_COMMISSION_RATE` in `src/lib/types.ts`)
is deducted from the payout shown to sellers.

## Payments: test mode vs. live Paystack

Payment processing goes through [Paystack](https://paystack.com) via
`src/lib/payments.ts`, with two modes:

- **Test mode (default)** — with no `PAYSTACK_SECRET_KEY` set, "Pay Now"
  opens an in-app **mock checkout** clearly labelled as test mode, so the
  full escrow flow (pay → hold → deliver → release/dispute) can be exercised
  without a Paystack account. The mock-completion endpoint is hard-disabled
  the moment a real key is configured, so it can never be used to fake a
  payment on a live deployment.
- **Live mode** — set `PAYSTACK_SECRET_KEY` (get one free at
  [paystack.com](https://paystack.com)) in `.env.local` and restart the
  app. Buyers are redirected to real Paystack checkout (card, bank transfer,
  USSD); on release, the app creates a Paystack transfer recipient from the
  seller's bank details and pays them out automatically. If a seller hasn't
  added bank details yet, buyer confirmation still succeeds and the order is
  flagged for a manual payout instead of failing silently.

```bash
# .env.local
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

No public key is needed — checkout uses Paystack's redirect-based Standard
flow, initialized server-side.

## Tech stack

- [Next.js](https://nextjs.org) (App Router, TypeScript) + Tailwind CSS
- SQLite via `better-sqlite3` for storage (file at `data/gaslink.db`,
  auto-created and seeded on first run — gitignored)
- [Paystack](https://paystack.com) for payment processing and seller payouts

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The database is
created automatically and seeded with sample Surulere gas sellers the first
time the app runs. Payments run in test mode until `PAYSTACK_SECRET_KEY` is
set (see above).

Other useful commands:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # lint the codebase
```

## Notes

- Seller "login" uses a per-seller access code (shown once at signup), and
  buyers manage their order via a private link containing a per-order
  token — enough for an MVP, not a full account system.
- The gas usage calculator gives an estimate for planning, not a substitute
  for the verified weight check at delivery.
- The marketplace currently seeds sellers for Surulere only, but the schema
  (`city`/`state`/`area` fields) is ready to expand to other Lagos areas or
  cities later.
- Production hardening not yet included: a Paystack webhook (relying only
  on the redirect callback is fine for a demo, not for reliability at
  scale), refund automation for disputes, and rate limiting on the public
  API routes.
