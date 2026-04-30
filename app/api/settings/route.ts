import { NextRequest } from 'next/server';
import { getDb }       from '@/lib/db';
import { ok, err }     from '@/lib/api-helpers';

// GET /api/settings — return all settings as { key: value } map
export async function GET() {
  const db   = getDb();
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const map  = Object.fromEntries(rows.map(r => [r.key, r.value]));
  return ok(map);
}

// PUT /api/settings — update one or more settings
// Body: { general_profit: number }
export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const db   = getDb();

  const update = db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (@key, @value)`);
  const updateAll = db.transaction((entries: [string, string][]) => {
    for (const [key, value] of entries) update.run({ key, value });
  });

  if ('general_profit' in body) {
    const val = Number(body.general_profit);
    if (isNaN(val) || val <= 0) return err('La ganancia debe ser mayor a 0');
    updateAll([['general_profit', String(val)]]);
  }

  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  return ok(Object.fromEntries(rows.map(r => [r.key, r.value])));
}
