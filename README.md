# 🔥 Gas-Link

**Hyper-local cooking gas, delivered by the sellers who already own the streets.**

Gas-Link is a two-sided marketplace MVP connecting everyday cooking-gas consumers with **licensed LPG sellers** in **Surulere, Lagos** — Nigeria's most densely networked residential-commercial gas retail corridor. This repository contains a fully interactive, in-memory React prototype used for investor demos, UX validation, and pilot planning.

---

## 1. Mission

Cooking gas (LPG) refills in Lagos are still transacted the way they were a decade ago: a phone call, a guess at the price, a wait with no visibility, and a cash handoff at the door. Gas-Link removes the friction on both sides of that transaction:

- **Consumers** get a live view of how much gas they have left, a transparent price breakdown before they pay, and an escrow-backed order that only releases funds once gas is actually delivered.
- **Licensed sellers** get demand routed directly into the delivery runs they already operate, with automatic revenue splitting so payouts are calculated and settled without manual bookkeeping.

The result is a trust layer on top of an informal, high-frequency, high-margin local market — starting with one neighborhood, proving the model, and expanding street-by-street.

## 2. Target Pilot Sector: Surulere, Lagos

Surulere was selected as the launch corridor for three reasons:

1. **Density.** Surulere's Aguda and Bode Thomas axis packs residential compounds and licensed gas plants within a 1–2km radius — ideal for tight, multi-drop delivery loops.
2. **Existing informal supply.** The area is already served by licensed sellers running bike-based delivery informally. Gas-Link digitizes demand capture and payment rather than building new supply.
3. **Repeat-purchase economics.** A 12.5kg household cylinder is consumed in 2–4 weeks depending on burner usage, giving Gas-Link a naturally recurring transaction cadence to build retention and data around before expanding to Yaba, Mushin, and beyond.

## 3. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| UI Framework | **React 18** (Vite) | Fast dev loop, component isolation, easy hand-off to a future mobile shell |
| Styling | **Tailwind CSS** | Utility-first velocity, consistent dark-mode design tokens, small bundle |
| Icons | **Lucide React** | Lightweight, consistent stroke-based icon set matching the fintech-grade aesthetic |
| State | React `useState`/`useEffect` (in-memory) | Zero external dependencies — the demo runs instantly with no database or API keys |
| Hosting | **Vercel** | Zero-config static hosting with automatic preview deployments on every PR |
| CI | **GitHub Actions** | Lint + production build verification on every push to `main`/`master` |

This MVP is intentionally backend-less: every account, cylinder reading, order, and ledger entry lives in component state so the prototype can be cloned, installed, and deployed in under five minutes with no environment configuration.

## 4. Product Walkthrough

### Dual-role login
A single entry screen toggles between **Gas Consumer** and **Licensed Seller** personas, each with a one-click demo profile and a simulated 4-digit OTP step (`1234`) to preserve the feel of a secure production login.

### Consumer Portal
- **Cylinder Consumption Tracking Engine** — select a cylinder size (5kg / 12.5kg / 25kg / 50kg) and active burner count (1–4); a circular gauge estimates remaining volume, days remaining, and a projected depletion date. A "Simulate Cooking Day" control advances usage instantly, walking the gauge through Green → Amber → Red.
- **Escrow Checkout** — a transparent cost breakdown (base gas cost, Surulere delivery fee, Gas-Link platform fee) calculated off current Lagos LPG pricing (~₦1,250/kg), authorized through a simulated Paystack/Flutterwave sandbox flow that locks funds in escrow and refills the tank.

### Licensed Seller Terminal
- **Route Optimization Manifest** — incoming orders are grouped into a single optimized Aguda–Bode Thomas delivery loop, sequenced as Drop 1, Drop 2, etc., with estimated travel times.
- **Automated Revenue Split Dashboard** — a wallet grid separates *Funds in Escrow* (pending delivery confirmation) from *Cleared Balance* (withdrawable), with a rolling ledger itemizing the 95% vendor payout against the 5% Gas-Link platform fee for every completed delivery.

### Smart Push Notification Engine
An in-app toast system demonstrates two flagship engagement moments: a **Low Volume Alert** the instant a tank drops below 15% (one-click reorder), and a **Street Smart-Match** ping notifying a consumer that a partner rider is already passing their block with a bundled delivery discount.

## 5. The Zero-Asset Logistics Model

Gas-Link does not own trucks, bikes, cylinders, or gas plants. Every unit of delivery capacity in the network already exists — Gas-Link's role is to make that capacity addressable and financially trustworthy:

1. **Supply-side capitalization.** Licensed sellers already run bike dispatch to serve walk-in and phone-in demand. Gas-Link plugs digital orders into those existing routes instead of provisioning a parallel fleet, so marginal delivery cost per new order approaches zero.
2. **Route clustering, not new logistics.** The Route Optimization Manifest batches nearby orders into a seller's existing loop (e.g., the Aguda–Bode Thomas cluster) rather than dispatching one-off trips — sellers fulfill more demand per bike-hour they were already spending.
3. **Escrow as trust infrastructure, not custody of goods.** Gas-Link never touches a physical cylinder. Consumer funds sit in escrow only until delivery is confirmed, at which point the platform takes a 5% coordination fee and releases 95% to the seller — the only asset Gas-Link "holds" is the transaction, momentarily.
4. **Capital-light scaling.** Expansion to a new pilot corridor requires onboarding licensed sellers who already operate there, not capital expenditure on hardware, vehicles, or warehousing — enabling street-by-street growth at software margins.

## 6. Getting Started

```bash
npm install
npm run dev       # local development server
npm run build      # production build to /dist
npm run preview    # preview the production build locally
```

### Deploying to Vercel

This repo is pre-configured for zero-config Vercel deployment (`vercel.json` + Vite build output). Connect the repository in the Vercel dashboard, or run:

```bash
npx vercel --prod
```

Every push to `main`/`master` also runs the GitHub Actions workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which lints and builds the app to catch regressions before they reach production.

---

*This is an in-memory demo prototype built for investor and pilot-partner review. No real payments, OTPs, or user data are processed.*
