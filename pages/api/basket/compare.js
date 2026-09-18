import pool from '../../../lib/db.js';

// Lagos Traffic Friction formula:
//   True Cost = Basket Price + (Distance(km) * BASE_FUEL_COST_PER_KM * Traffic Multiplier)
const BASE_FUEL_COST_PER_KM = 350;
const RUSH_HOUR_MULTIPLIER = 2.8;
const DEFAULT_TRAFFIC_MULTIPLIER = 1.0;
const LAGOS_TIMEZONE = 'Africa/Lagos';

// Rush hour: 6:30-9:30 AM and 4:30-8:30 PM, Monday-Friday.
const RUSH_WINDOWS_MINUTES = [
  { start: 6 * 60 + 30, end: 9 * 60 + 30 },
  { start: 16 * 60 + 30, end: 20 * 60 + 30 },
];
const WEEKEND_DAYS = new Set(['Sat', 'Sun']);

const STORE_BASKET_QUERY = `
  WITH basket_items AS (
    SELECT * FROM UNNEST($1::int[], $2::int[]) AS t(product_id, quantity)
  ),
  matched_prices AS (
    SELECT
      sp.store_id,
      sp.product_id,
      bi.quantity,
      COALESCE(sp.promo_price, sp.current_price) AS unit_price
    FROM store_prices sp
    JOIN basket_items bi ON bi.product_id = sp.product_id
    WHERE sp.is_available = TRUE
  )
  SELECT
    s.store_id,
    s.brand_name,
    s.branch_name,
    s.region,
    ST_DistanceSphere(
      s.geolocation,
      ST_SetSRID(ST_MakePoint($3, $4), 4326)
    ) / 1000.0 AS distance_km,
    SUM(mp.unit_price * mp.quantity) AS basket_price
  FROM matched_prices mp
  JOIN stores s ON s.store_id = mp.store_id
  GROUP BY s.store_id
  HAVING COUNT(DISTINCT mp.product_id) = $5
  ORDER BY basket_price ASC;
`;

function getLagosTimeParts(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: LAGOS_TIMEZONE,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date);

  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    weekday: lookup.weekday,
    hour: Number(lookup.hour),
    minute: Number(lookup.minute),
  };
}

function resolveTraffic(date) {
  const { weekday, hour, minute } = getLagosTimeParts(date);
  const minutesOfDay = hour * 60 + minute;
  const isWeekday = !WEEKEND_DAYS.has(weekday);
  const inRushWindow = RUSH_WINDOWS_MINUTES.some(
    (window) => minutesOfDay >= window.start && minutesOfDay <= window.end
  );

  const isRushHour = isWeekday && inRushWindow;
  return {
    isRushHour,
    multiplier: isRushHour ? RUSH_HOUR_MULTIPLIER : DEFAULT_TRAFFIC_MULTIPLIER,
  };
}

function parseCoordinate(value, label, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < min || num > max) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
  return num;
}

function parseBasket(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('`items` must be a non-empty array of { productId, quantity }.');
  }

  const seen = new Set();
  return items.map((item) => {
    const productId = Number(item?.productId);
    const quantity = Number(item?.quantity);

    if (!Number.isInteger(productId) || productId <= 0) {
      throw new Error(`Invalid productId: ${item?.productId}`);
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error(`Invalid quantity for productId ${productId}: ${item?.quantity}`);
    }
    if (seen.has(productId)) {
      throw new Error(`Duplicate productId in basket: ${productId}`);
    }
    seen.add(productId);

    return { productId, quantity };
  });
}

function parseRequest(body) {
  const basket = parseBasket(body?.items);
  const userLat = parseCoordinate(body?.userLat, 'userLat', -90, 90);
  const userLng = parseCoordinate(body?.userLng, 'userLng', -180, 180);

  const requestedAt = body?.timestamp ? new Date(body.timestamp) : new Date();
  if (Number.isNaN(requestedAt.getTime())) {
    throw new Error(`Invalid timestamp: ${body.timestamp}`);
  }

  return { basket, userLat, userLng, requestedAt };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }

  let basket;
  let userLat;
  let userLng;
  let requestedAt;

  try {
    ({ basket, userLat, userLng, requestedAt } = parseRequest(req.body));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const { isRushHour, multiplier: trafficMultiplier } = resolveTraffic(requestedAt);
  const productIds = basket.map((item) => item.productId);
  const quantities = basket.map((item) => item.quantity);

  let client;
  try {
    client = await pool.connect();

    const { rows } = await client.query(STORE_BASKET_QUERY, [
      productIds,
      quantities,
      userLng,
      userLat,
      productIds.length,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'No store branch currently stocks every item in this basket.',
      });
    }

    const comparisons = rows
      .map((row) => {
        const distanceKm = Number(row.distance_km);
        const basketPrice = Number(row.basket_price);
        const transitCost = distanceKm * BASE_FUEL_COST_PER_KM * trafficMultiplier;
        const trueCost = basketPrice + transitCost;

        return {
          storeId: row.store_id,
          brandName: row.brand_name,
          branchName: row.branch_name,
          region: row.region,
          distanceKm: Number(distanceKm.toFixed(2)),
          basketPrice: Number(basketPrice.toFixed(2)),
          transitCost: Number(transitCost.toFixed(2)),
          trueCost: Number(trueCost.toFixed(2)),
        };
      })
      .sort((a, b) => a.trueCost - b.trueCost)
      .map((comparison, index) => ({ rank: index + 1, ...comparison }));

    return res.status(200).json({
      generatedAt: requestedAt.toISOString(),
      traffic: {
        isRushHour,
        multiplier: trafficMultiplier,
        baseFuelCostPerKm: BASE_FUEL_COST_PER_KM,
      },
      origin: { lat: userLat, lng: userLng },
      basket,
      cheapest: comparisons[0],
      comparisons,
    });
  } catch (error) {
    console.error('[basket/compare] failed to compute basket comparison:', error);
    return res.status(500).json({ error: 'Failed to compute basket comparison.' });
  } finally {
    client?.release();
  }
}
