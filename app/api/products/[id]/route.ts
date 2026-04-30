import { NextRequest } from 'next/server';
import { prisma }      from '@/lib/prisma';
import { ok, err }     from '@/lib/api-helpers';

// GET /api/products/:id
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!product) return err('Producto no encontrado', 404);
  return ok(product);
}

// PUT /api/products/:id — full or partial update
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!existing) return err('Producto no encontrado', 404);

  const body         = await req.json().catch(() => ({}));
  const name         = typeof body.name         === 'string' ? body.name.trim()  : existing.name;
  const priceUsd     = typeof body.priceUsd     === 'number' ? body.priceUsd     : existing.priceUsd;
  const unit         = typeof body.unit         === 'string' ? body.unit         : existing.unit;
  const customProfit = 'customProfit' in body
    ? (body.customProfit === null ? null : Number(body.customProfit))
    : existing.customProfit;

  if (!name)                                    return err('El nombre del producto es requerido');
  if (isNaN(Number(priceUsd)) || Number(priceUsd) <= 0) return err('El precio debe ser mayor a 0');

  const updated = await prisma.product.update({
    where: { id: Number(id) },
    data:  { name, priceUsd, customProfit, unit },
  });
  return ok(updated);
}

// DELETE /api/products/:id
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!existing) return err('Producto no encontrado', 404);

  await prisma.product.delete({ where: { id: Number(id) } });
  return ok({ deleted: true });
}
