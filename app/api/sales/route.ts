import { NextRequest } from 'next/server';
import { getDb }       from '@/lib/db';
import { ok, err }     from '@/lib/api-helpers';

// GET /api/sales — list all sales ordered by date desc
export async function GET() {
  const db    = getDb();
  const sales = db.prepare(
    `SELECT id, product_id, product_name, quantity, unit,
            price_usd, bcv_rate, profit_bs, total_bs, total_usd, sold_at
     FROM sales
     ORDER BY sold_at DESC`
  ).all();
  return ok(sales);
}

// POST /api/sales — register a sale
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const required = ['product_name', 'quantity', 'unit', 'price_usd', 'bcv_rate', 'profit_bs', 'total_bs', 'total_usd'];
  for (const field of required) {
    if (body?.[field] == null) return err(`Campo requerido: ${field}`);
  }

  const db     = getDb();
  const result = db.prepare(
    `INSERT INTO sales
       (product_id, product_name, quantity, unit, price_usd, bcv_rate, profit_bs, total_bs, total_usd)
     VALUES
       (@product_id, @product_name, @quantity, @unit, @price_usd, @bcv_rate, @profit_bs, @total_bs, @total_usd)`
  ).run({
    product_id:   body.product_id   ?? null,
    product_name: body.product_name,
    quantity:     body.quantity,
    unit:         body.unit,
    price_usd:    body.price_usd,
    bcv_rate:     body.bcv_rate,
    profit_bs:    body.profit_bs,
    total_bs:     body.total_bs,
    total_usd:    body.total_usd,
  });

  const created = db.prepare('SELECT * FROM sales WHERE id = ?').get(result.lastInsertRowid);
  return ok(created, 201);
}
