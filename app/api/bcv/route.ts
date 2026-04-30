import { prisma } from '@/lib/prisma';
import { ok }     from '@/lib/api-helpers';

const BCV_API_URL = 'https://ve.dolarapi.com/v1/dolares/oficial';

interface BcvApiResponse {
  promedio: number;
  fechaActualizacion: string;
}

// GET /api/bcv — fetch live BCV rate, cache it, return with staleness flag
export async function GET() {
  const cache = await prisma.bcvCache.findUnique({ where: { id: 1 } });

  try {
    const res  = await fetch(BCV_API_URL, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error(`BCV API responded ${res.status}`);

    const data = await res.json() as BcvApiResponse;
    const rate = data.promedio;
    if (!rate || isNaN(rate)) throw new Error('Invalid rate in BCV response');

    const fetchedAt = new Date();
    await prisma.bcvCache.upsert({
      where:  { id: 1 },
      update: { rate, fetchedAt },
      create: { id: 1, rate, fetchedAt },
    });

    return ok({ rate, fetched_at: fetchedAt.toISOString(), stale: false });

  } catch (e) {
    if (cache) {
      return ok({ rate: cache.rate, fetched_at: cache.fetchedAt.toISOString(), stale: true });
    }
    console.error('[BCV] Fetch failed and no cache available:', e);
    return ok({ rate: 1, fetched_at: new Date().toISOString(), stale: true });
  }
}
