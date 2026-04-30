import { NextRequest } from 'next/server';
import { getDb }       from '@/lib/db';
import { ok, err }     from '@/lib/api-helpers';

// GET /api/products/:id
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db      = getDb();
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(id));
  if (!product) return err('Producto no encontrado', 404);
  return ok(product);
}

// PUT /api/products/:id — full or partial update
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db      = getDb();
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(id)) as Record<string, unknown> | undefined;
  if (!product) return err('Producto no encontrado', 404);

  const body          = await req.json().catch(() => ({}));
  const name          = typeof body.name         === 'string'  ? body.name.trim()   : product.name;
  const price_usd     = typeof body.price_usd    === 'number'  ? body.price_usd     : product.price_usd;
  const unit          = typeof body.unit         === 'string'  ? body.unit          : product.unit;
  const custom_profit = 'custom_profit' in body
    ? (body.custom_profit === null ? null : Number(body.custom_profit))
    : product.custom_profit;

  if (!name)                           return err('El nombre del producto es requerido');
  if (isNaN(Number(price_usd)) || Number(price_usd) <= 0) return err('El precio debe ser mayor a 0');

  db.prepare(
    `UPDATE products
     SET name = @name, price_usd = @price_usd, custom_profit = @custom_profit, unit = @unit
     WHERE id = @id`
  ).run({ name, price_usd, custom_profit, unit, id: Number(id) });

  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(id));
  return ok(updated);
}

// DELETE /api/products/:id
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db      = getDb();
  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(Number(id));
  if (!product) return err('Producto no encontrado', 404);

  db.prepare('DELETE FROM products WHERE id = ?').run(Number(id));
  return ok({ deleted: true });
}
