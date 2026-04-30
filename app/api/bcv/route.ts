import { getDb } from '@/lib/db';
import { ok }    from '@/lib/api-helpers';

const BCV_API_URL = 'https://ve.dolarapi.com/v1/dolares/oficial';

interface BcvApiResponse {
  promedio: number;
  fechaActualizacion: string;
}

interface CachedRate {
  id: number;
  rate: number;
  fetched_at: string;
}

// GET /api/bcv — fetch live BCV rate, cache it, return with staleness flag
export async function GET() {
  const db    = getDb();
  const cache = db.prepare('SELECT * FROM bcv_cache WHERE id = 1').get() as CachedRate | undefined;

  // Try fetching a fresh rate from the external API
  try {
    const res  = await fetch(BCV_API_URL, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error(`BCV API responded ${res.status}`);

    const data = await res.json() as BcvApiResponse;
    const rate = data.promedio;

    if (!rate || isNaN(rate)) throw new Error('Invalid rate in BCV response');

    // Persist to cache (upsert — only one row ever exists)
    db.prepare(
      `INSERT INTO bcv_cache (id, rate, fetched_at)
       VALUES (1, @rate, @fetched_at)
       ON CONFLICT(id) DO UPDATE SET rate = @rate, fetched_at = @fetched_at`
    ).run({ rate, fetched_at: new Date().toISOString() });

    return ok({ rate, fetched_at: new Date().toISOString(), stale: false });

  } catch (e) {
    // Fallback: return the last cached rate marked as stale
    if (cache) {
      return ok({ rate: cache.rate, fetched_at: cache.fetched_at, stale: true });
    }

    // No cache at all — return a hardcoded safe fallback
    console.error('[BCV] Fetch failed and no cache available:', e);
    return ok({ rate: 1, fetched_at: new Date().toISOString(), stale: true });
  }
}
