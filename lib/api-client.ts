// Thin fetch wrapper — all UI components use these functions instead of raw fetch
import type { Product, Sale, Settings, BcvState } from './types';

// Prisma returns camelCase already; only dates need parsing (JSON has no Date type)
type ProductJson = Omit<Product, 'createdAt'> & { createdAt: string };
type SaleJson    = Omit<Sale,    'soldAt'>    & { soldAt:    string };

interface BcvApiResult { rate: number; fetched_at: string; stale: boolean }
interface DbSettings   { general_profit: string }

function mapProduct(r: ProductJson): Product { return { ...r, createdAt: new Date(r.createdAt) }; }
function mapSale(r: SaleJson):       Sale    { return { ...r, soldAt:    new Date(r.soldAt)    }; }

// ─── Products ───────────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch('/api/products');
  if (!res.ok) throw new Error('Error al cargar productos');
  return (await res.json() as ProductJson[]).map(mapProduct);
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  const res = await fetch('/api/products', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      name:         data.name,
      priceUsd:     data.priceUsd,
      customProfit: data.customProfit,
      unit:         data.unit,
    }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
  return mapProduct(await res.json());
}

export async function updateProduct(id: number, data: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product> {
  const res = await fetch(`/api/products/${id}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      name:         data.name,
      priceUsd:     data.priceUsd,
      customProfit: data.customProfit,
      unit:         data.unit,
    }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
  return mapProduct(await res.json());
}

export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar producto');
}

// ─── Sales ──────────────────────────────────────────────────────────────────

export async function fetchSales(): Promise<Sale[]> {
  const res = await fetch('/api/sales');
  if (!res.ok) throw new Error('Error al cargar historial');
  return (await res.json() as SaleJson[]).map(mapSale);
}

export async function createSale(data: Omit<Sale, 'id'>): Promise<Sale> {
  const res = await fetch('/api/sales', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      productId:    data.productId,
      productName:  data.productName,
      quantity:     data.quantity,
      unit:         data.unit,
      priceUsd:     data.priceUsd,
      bcvRate:      data.bcvRate,
      profitUsd:    data.profitUsd,
      totalBs:      data.totalBs,
      totalUsd:     data.totalUsd,
      customerName: data.customerName,
    }),
  });
  if (!res.ok) throw new Error('Error al registrar venta');
  return mapSale(await res.json());
}

// ─── Settings ───────────────────────────────────────────────────────────────

export async function fetchSettings(): Promise<Settings> {
  const res = await fetch('/api/settings');
  if (!res.ok) throw new Error('Error al cargar configuración');
  const data: DbSettings = await res.json();
  return { generalProfit: Number(data.general_profit) };
}

export async function updateSettings(settings: Partial<Settings>): Promise<Settings> {
  const res = await fetch('/api/settings', {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ general_profit: settings.generalProfit }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
  const data: DbSettings = await res.json();
  return { generalProfit: Number(data.general_profit) };
}

// ─── BCV ────────────────────────────────────────────────────────────────────

export async function fetchBcvRate(): Promise<BcvState> {
  const res = await fetch('/api/bcv');
  if (!res.ok) throw new Error('Error al obtener tasa BCV');
  const data: BcvApiResult = await res.json();
  return {
    rate:      data.rate,
    updatedAt: new Date(data.fetched_at),
    isStale:   data.stale,
  };
}
