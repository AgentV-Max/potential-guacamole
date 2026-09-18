# Price Alat

Price discount aggregator for modern trade stores in Lagos (Shoprite, Spar,
Prince Ebeano, Justrite, Hubmart). Aggregates live pricing across store
branches, powers a cross-platform basket comparison, and gamifies price
verification through a receipt-to-wallet coin system.

## Tech Stack

- **Mobile**: Flutter (Android/iOS, single codebase) — real-time GPS,
  barcode/QR scanning, offline-cached coupons.
- **Web**: Next.js — SEO-optimized discount pages, manual zone/neighborhood
  selection, budget-planning tools.
- **Backend**: Node.js/FastAPI — high-frequency concurrent API layer serving
  both clients from a shared core.
- **Database**: PostgreSQL + PostGIS — branch-level geolocation, radius
  queries, and proximity-based basket comparison.
- **Cache**: Redis — price caching (12h TTL) to keep basket comparisons off
  the primary database on every request.
- **Scraping**: Python (BeautifulSoup/Playwright) — nightly automated price
  collection, supplemented by field-agent and crowdsourced data.

## Architecture Notes

- Store data is branch-level, never brand-level (e.g. "Spar (Ikeja Mall)",
  not "Spar") — pricing and stock vary per branch.
- All price rows carry `data_source` (`scraped`, `field_agent`,
  `crowdsourced`) and `updated_at` so staleness is always visible to users.
- User wallet/coin balances are transactional and must stay isolated from
  the read-heavy scraping/browsing path.

## Repository Layout

- `migrations/` — SQL schema migrations, applied in numeric order.
