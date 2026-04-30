import { NextRequest } from 'next/server';
import { getDb }       from '@/lib/db';
import { ok, err }     from '@/lib/api-helpers';

// GET /api/products — list all products ordered alphabetically
export async function GET() {
  const db       = getDb();
  const products = db.prepare(
    `SELECT id, name, price_usd, custom_profit, unit, created_at
     FROM products
     ORDER BY name ASC`
  ).all();
  return ok(products);
}

// POST /api/products — create a new product
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const name          = typeof body?.name       === 'string'  ? body.name.trim()           : '';
  const price_usd     = typeof body?.price_usd  === 'number'  ? body.price_usd             : NaN;
  const unit          = typeof body?.unit        === 'string'  ? body.unit                  : 'kg';
  const custom_profit = typeof body?.custom_profit === 'number' ? body.custom_profit         : null;

  if (!name)                   return err('El nombre del producto es requerido');
  if (isNaN(price_usd) || price_usd <= 0) return err('El precio debe ser mayor a 0');

  const db     = getDb();
  const result = db.prepare(
    `INSERT INTO products (name, price_usd, custom_profit, unit)
     VALUES (@name, @price_usd, @custom_profit, @unit)`
  ).run({ name, price_usd, custom_profit, unit });

  const created = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  return ok(created, 201);
}
