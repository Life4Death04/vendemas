import { NextRequest } from 'next/server';
import { prisma }      from '@/lib/prisma';
import { ok, err }     from '@/lib/api-helpers';

// GET /api/sales — list all sales ordered by date desc
export async function GET() {
  const sales = await prisma.sale.findMany({ orderBy: { soldAt: 'desc' } });
  return ok(sales);
}

// POST /api/sales — register a sale
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const required = ['productName', 'quantity', 'unit', 'priceUsd', 'bcvRate', 'profitUsd', 'totalBs', 'totalUsd'];
  for (const field of required) {
    if (body?.[field] == null) return err(`Campo requerido: ${field}`);
  }

  const sale = await prisma.sale.create({
    data: {
      productId:    body.productId    ?? null,
      productName:  body.productName,
      quantity:     body.quantity,
      unit:         body.unit,
      priceUsd:     body.priceUsd,
      bcvRate:      body.bcvRate,
      profitUsd:    body.profitUsd,
      totalBs:      body.totalBs,
      totalUsd:     body.totalUsd,
      customerName: body.customerName ?? null,
      soldAt:       new Date(),
    },
  });
  return ok(sale, 201);
}
