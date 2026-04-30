import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR  = path.join(process.cwd(), '.data');
const DB_PATH = path.join(DB_DIR, 'vendemas.db');

// Ensure the .data directory exists
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

// Singleton — reuse the same connection across hot-reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined;
}

function openDb(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

export function getDb(): Database.Database {
  if (process.env.NODE_ENV === 'development') {
    if (!global.__db) global.__db = openDb();
    return global.__db;
  }
  return openDb();
}

// ─── Schema ────────────────────────────────────────────────────────────────

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS products (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    price_usd     REAL    NOT NULL,
    custom_profit REAL,
    unit          TEXT    NOT NULL DEFAULT 'kg',
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sales (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id    INTEGER,
    product_name  TEXT    NOT NULL,
    quantity      REAL    NOT NULL,
    unit          TEXT    NOT NULL,
    price_usd     REAL    NOT NULL,
    bcv_rate      REAL    NOT NULL,
    profit_usd    REAL    NOT NULL,
    total_bs      REAL    NOT NULL,
    total_usd     REAL    NOT NULL,
    customer_name TEXT,
    sold_at       TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bcv_cache (
    id         INTEGER PRIMARY KEY CHECK (id = 1),
    rate       REAL    NOT NULL,
    fetched_at TEXT    NOT NULL
  );
`;

// ─── Seed ──────────────────────────────────────────────────────────────────

const SEED_PRODUCTS = [
  { name: 'Jamón',          price_usd: 8.50,  custom_profit: null, unit: 'kg'     },
  { name: 'Queso Blanco',   price_usd: 4.00,  custom_profit: null, unit: 'kg'     },
  { name: 'Mortadela',      price_usd: 5.50,  custom_profit: 1.5,  unit: 'kg'     },
  { name: 'Queso Amarillo', price_usd: 6.00,  custom_profit: null, unit: 'kg'     },
  { name: 'Pernil',         price_usd: 12.00, custom_profit: 3.0,  unit: 'kg'     },
  { name: 'Agua Mineral',   price_usd: 0.80,  custom_profit: null, unit: 'litro'  },
];

// ─── Init ──────────────────────────────────────────────────────────────────

export function initDb(): void {
  const db = getDb();

  // Apply schema
  db.exec(SCHEMA);

  // Migrations (idempotent — guarded by column existence checks)
  const saleColumns = (db.prepare("PRAGMA table_info(sales)").all() as { name: string }[]).map(c => c.name);
  if (saleColumns.includes('profit_bs') && !saleColumns.includes('profit_usd')) {
    db.exec('ALTER TABLE sales RENAME COLUMN profit_bs TO profit_usd');
  }
  if (!saleColumns.includes('customer_name')) {
    db.exec('ALTER TABLE sales ADD COLUMN customer_name TEXT');
  }

  // Seed default settings
  db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('general_profit', '20')`).run();

  // Seed products only on a fresh database
  const count = (db.prepare('SELECT COUNT(*) as n FROM products').get() as { n: number }).n;
  if (count === 0) {
    const insert = db.prepare(
      `INSERT INTO products (name, price_usd, custom_profit, unit)
       VALUES (@name, @price_usd, @custom_profit, @unit)`
    );
    const seedAll = db.transaction((rows: typeof SEED_PRODUCTS) => {
      for (const row of rows) insert.run(row);
    });
    seedAll(SEED_PRODUCTS);
  }
}
