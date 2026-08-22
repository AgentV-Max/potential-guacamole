import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "gaslink.db");

declare global {
  var __gaslinkDb: Database.Database | undefined;
}

function createConnection(): Database.Database {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS sellers (
      id TEXT PRIMARY KEY,
      business_name TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      area TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT 'Surulere',
      state TEXT NOT NULL DEFAULT 'Lagos',
      address TEXT NOT NULL,
      price_5kg INTEGER,
      price_12_5kg INTEGER,
      price_25kg INTEGER,
      delivery INTEGER NOT NULL DEFAULT 0,
      accessories INTEGER NOT NULL DEFAULT 0,
      rating REAL NOT NULL DEFAULT 4.5,
      rating_count INTEGER NOT NULL DEFAULT 0,
      access_code TEXT NOT NULL UNIQUE,
      verified INTEGER NOT NULL DEFAULT 0,
      bank_code TEXT,
      bank_account_number TEXT,
      bank_account_name TEXT,
      paystack_recipient_code TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      seller_id TEXT NOT NULL REFERENCES sellers(id),
      buyer_name TEXT NOT NULL,
      buyer_phone TEXT NOT NULL,
      buyer_email TEXT,
      buyer_token TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      area TEXT NOT NULL,
      cylinder_size TEXT NOT NULL,
      order_type TEXT NOT NULL DEFAULT 'refill',
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price INTEGER NOT NULL DEFAULT 0,
      amount INTEGER NOT NULL DEFAULT 0,
      commission_amount INTEGER NOT NULL DEFAULT 0,
      payout_amount INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      payment_status TEXT NOT NULL DEFAULT 'unpaid',
      payment_provider TEXT,
      payment_reference TEXT,
      paid_at TEXT,
      buyer_confirmed_at TEXT,
      released_at TEXT,
      payout_error TEXT,
      dispute_reason TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
    CREATE INDEX IF NOT EXISTS idx_sellers_area ON sellers(area);
    CREATE INDEX IF NOT EXISTS idx_orders_payment_reference ON orders(payment_reference);
  `);

  seedIfEmpty(db);
  return db;
}

function seedIfEmpty(db: Database.Database) {
  const { count } = db
    .prepare("SELECT COUNT(*) as count FROM sellers")
    .get() as { count: number };
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO sellers (
      id, business_name, owner_name, phone, whatsapp, area, city, state, address,
      price_5kg, price_12_5kg, price_25kg, delivery, accessories, rating, rating_count,
      access_code, verified, created_at
    ) VALUES (
      @id, @business_name, @owner_name, @phone, @whatsapp, @area, @city, @state, @address,
      @price_5kg, @price_12_5kg, @price_25kg, @delivery, @accessories, @rating, @rating_count,
      @access_code, @verified, @created_at
    )
  `);

  const now = new Date().toISOString();
  const seedSellers = [
    {
      id: randomUUID(),
      business_name: "Ogunlana Gas & Accessories",
      owner_name: "Tunde Bakare",
      phone: "+2348031234501",
      whatsapp: "+2348031234501",
      area: "Ogunlana Drive",
      city: "Surulere",
      state: "Lagos",
      address: "12 Ogunlana Drive, Surulere, Lagos",
      price_5kg: 6500,
      price_12_5kg: 15500,
      price_25kg: 30500,
      delivery: 1,
      accessories: 1,
      rating: 4.8,
      rating_count: 132,
      access_code: "GAS-OGUN-501",
      verified: 1,
      created_at: now,
    },
    {
      id: randomUUID(),
      business_name: "Aguda Cooking Gas Depot",
      owner_name: "Chidinma Okafor",
      phone: "+2348052234502",
      whatsapp: "+2348052234502",
      area: "Aguda",
      city: "Surulere",
      state: "Lagos",
      address: "45 Aguda Road, Surulere, Lagos",
      price_5kg: 6300,
      price_12_5kg: 15200,
      price_25kg: 29800,
      delivery: 1,
      accessories: 0,
      rating: 4.6,
      rating_count: 87,
      access_code: "GAS-AGUD-502",
      verified: 1,
      created_at: now,
    },
    {
      id: randomUUID(),
      business_name: "Bode Thomas LPG Station",
      owner_name: "Ibrahim Suleiman",
      phone: "+2348073234503",
      whatsapp: "+2348073234503",
      area: "Bode Thomas",
      city: "Surulere",
      state: "Lagos",
      address: "78 Bode Thomas Street, Surulere, Lagos",
      price_5kg: 6600,
      price_12_5kg: 15800,
      price_25kg: 31000,
      delivery: 0,
      accessories: 1,
      rating: 4.3,
      rating_count: 54,
      access_code: "GAS-BODE-503",
      verified: 1,
      created_at: now,
    },
    {
      id: randomUUID(),
      business_name: "Adeniran Ogunsanya Gas Point",
      owner_name: "Funmilayo Adeyemi",
      phone: "+2348094234504",
      whatsapp: "+2348094234504",
      area: "Adeniran Ogunsanya",
      city: "Surulere",
      state: "Lagos",
      address: "23 Adeniran Ogunsanya Street, Surulere, Lagos",
      price_5kg: 6450,
      price_12_5kg: 15400,
      price_25kg: 30200,
      delivery: 1,
      accessories: 1,
      rating: 4.9,
      rating_count: 210,
      access_code: "GAS-ADEN-504",
      verified: 1,
      created_at: now,
    },
    {
      id: randomUUID(),
      business_name: "Ojuelegba Quick Gas",
      owner_name: "Emeka Nwosu",
      phone: "+2348015234505",
      whatsapp: "+2348015234505",
      area: "Ojuelegba",
      city: "Surulere",
      state: "Lagos",
      address: "5 Ojuelegba Road, Surulere, Lagos",
      price_5kg: 6200,
      price_12_5kg: 14900,
      price_25kg: 29500,
      delivery: 1,
      accessories: 0,
      rating: 4.1,
      rating_count: 39,
      access_code: "GAS-OJUE-505",
      verified: 0,
      created_at: now,
    },
    {
      id: randomUUID(),
      business_name: "Coker Village Gas Supplies",
      owner_name: "Blessing Etim",
      phone: "+2348036234506",
      whatsapp: "+2348036234506",
      area: "Coker",
      city: "Surulere",
      state: "Lagos",
      address: "10 Coker Road, Orile, Surulere, Lagos",
      price_5kg: 6350,
      price_12_5kg: 15100,
      price_25kg: 29900,
      delivery: 0,
      accessories: 0,
      rating: 4.4,
      rating_count: 61,
      access_code: "GAS-COKE-506",
      verified: 1,
      created_at: now,
    },
    {
      id: randomUUID(),
      business_name: "Lawanson Energy & Gas",
      owner_name: "Musa Abdullahi",
      phone: "+2348097234507",
      whatsapp: "+2348097234507",
      area: "Lawanson",
      city: "Surulere",
      state: "Lagos",
      address: "31 Lawanson Road, Surulere, Lagos",
      price_5kg: 6400,
      price_12_5kg: 15300,
      price_25kg: 30000,
      delivery: 1,
      accessories: 1,
      rating: 4.7,
      rating_count: 98,
      access_code: "GAS-LAWA-507",
      verified: 1,
      created_at: now,
    },
    {
      id: randomUUID(),
      business_name: "Itire Road Cooking Gas",
      owner_name: "Grace Uzoma",
      phone: "+2348028234508",
      whatsapp: "+2348028234508",
      area: "Itire",
      city: "Surulere",
      state: "Lagos",
      address: "62 Itire Road, Surulere, Lagos",
      price_5kg: 6250,
      price_12_5kg: 15000,
      price_25kg: 29600,
      delivery: 1,
      accessories: 0,
      rating: 4.2,
      rating_count: 45,
      access_code: "GAS-ITIR-508",
      verified: 0,
      created_at: now,
    },
  ];

  const insertMany = db.transaction((rows: typeof seedSellers) => {
    for (const row of rows) insert.run(row);
  });
  insertMany(seedSellers);
}

export function getDb(): Database.Database {
  if (!global.__gaslinkDb) {
    global.__gaslinkDb = createConnection();
  }
  return global.__gaslinkDb;
}
