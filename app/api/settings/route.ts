import { NextRequest } from 'next/server';
import { prisma }      from '@/lib/prisma';
import { ok, err }     from '@/lib/api-helpers';

// GET /api/settings
export async function GET() {
  const rows = await prisma.settings.findMany();
  return ok(Object.fromEntries(rows.map(r => [r.key, r.value])));
}

// PUT /api/settings — Body: { general_profit: number }
export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  if ('general_profit' in body) {
    const val = Number(body.general_profit);
    if (isNaN(val) || val <= 0) return err('La ganancia debe ser mayor a 0');
    await prisma.settings.upsert({
      where:  { key: 'general_profit' },
      update: { value: String(val) },
      create: { key: 'general_profit', value: String(val) },
    });
  }

  const rows = await prisma.settings.findMany();
  return ok(Object.fromEntries(rows.map(r => [r.key, r.value])));
}
