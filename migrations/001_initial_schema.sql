-- Price Alat: initial schema
-- Stores/branches, products, live store prices, and user incentive wallets.

BEGIN;

CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. STORES & BRANCHES TABLE (Geographic anchor)
-- Branch-level, not brand-level: "Spar (Ikeja Mall)" is its own row,
-- distinct from "Spar (Lekki 1)", since price/stock vary per branch.
CREATE TABLE stores (
    store_id SERIAL PRIMARY KEY,
    brand_name VARCHAR(100) NOT NULL,          -- e.g., 'Shoprite', 'Spar'
    branch_name VARCHAR(100) NOT NULL,         -- e.g., 'Ikeja City Mall', 'Lekki 1'
    region VARCHAR(50) NOT NULL,                -- 'Mainland' or 'Island'
    address VARCHAR(255),
    geolocation GEOMETRY(Point, 4326) NOT NULL, -- PostGIS GPS coordinates (lon, lat)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (brand_name, branch_name)
);

CREATE INDEX idx_stores_geolocation ON stores USING GIST (geolocation);
CREATE INDEX idx_stores_region ON stores (region);

-- 2. PRODUCTS MASTER TABLE
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,        -- e.g., 'Peak Milk Powder 400g'
    barcode VARCHAR(50) UNIQUE,
    category VARCHAR(100),                      -- e.g., 'FMCG / Dairy'
    brand VARCHAR(100),                          -- e.g., 'FrieslandCampina'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products (category);
CREATE INDEX idx_products_brand ON products (brand);

-- 3. LIVE PRICE MATRIX (Many-to-Many Bridge)
CREATE TABLE store_prices (
    price_id SERIAL PRIMARY KEY,
    store_id INT NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    current_price DECIMAL(10,2) NOT NULL,
    promo_price DECIMAL(10,2) NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    data_source VARCHAR(50) NOT NULL DEFAULT 'scraped'
        CHECK (data_source IN ('scraped', 'field_agent', 'crowdsourced')),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (store_id, product_id)
);

CREATE INDEX idx_store_prices_store_id ON store_prices (store_id);
CREATE INDEX idx_store_prices_product_id ON store_prices (product_id);
CREATE INDEX idx_store_prices_updated_at ON store_prices (updated_at);

-- 4. USER INCENTIVE WALLET TABLE
CREATE TABLE user_wallets (
    wallet_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    coin_balance INT NOT NULL DEFAULT 0 CHECK (coin_balance >= 0),
    lifetime_receipts_uploaded INT NOT NULL DEFAULT 0,
    last_payout_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
