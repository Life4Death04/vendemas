import { NextRequest } from 'next/server';
import { prisma }      from '@/lib/prisma';
import { ok, err }     from '@/lib/api-helpers';

// GET /api/products — list all products ordered alphabetically
export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { name: 'asc' } });
  return ok(products);
}

// POST /api/products — create a new product
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const name         = typeof body?.name         === 'string' ? body.name.trim() : '';
  const priceUsd     = typeof body?.priceUsd     === 'number' ? body.priceUsd    : NaN;
  const unit         = typeof body?.unit         === 'string' ? body.unit        : 'kg';
  const customProfit = typeof body?.customProfit === 'number' ? body.customProfit : null;

  if (!name)                              return err('El nombre del producto es requerido');
  if (isNaN(priceUsd) || priceUsd <= 0)  return err('El precio debe ser mayor a 0');

  const product = await prisma.product.create({ data: { name, priceUsd, customProfit, unit } });
  return ok(product, 201);
}
