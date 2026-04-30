// Thin fetch wrapper — all UI components use these functions instead of raw fetch
import type { Product, Sale, Settings, BcvState, Unit } from './types';

// ─── Types that mirror the DB column names ──────────────────────────────────

interface DbProduct {
  id: number;
  name: string;
  price_usd: number;
  custom_profit: number | null;
  unit: Unit;
  created_at: string;
}

interface DbSale {
  id: number;
  product_id: number | null;
  product_name: string;
  quantity: number;
  unit: Unit;
  price_usd: number;
  bcv_rate: number;
  profit_bs: number;
  total_bs: number;
  total_usd: number;
  sold_at: string;
}

interface DbSettings { general_profit: string }

interface BcvApiResult { rate: number; fetched_at: string; stale: boolean }

// ─── Mappers: DB rows → app types ──────────────────────────────────────────

function mapProduct(r: DbProduct): Product {
  return {
    id:           r.id,
    name:         r.name,
    priceUsd:     r.price_usd,
    customProfit: r.custom_profit,
    unit:         r.unit,
    createdAt:    new Date(r.created_at),
  };
}

function mapSale(r: DbSale): Sale {
  return {
    id:          r.id,
    productId:   r.product_id,
    productName: r.product_name,
    quantity:    r.quantity,
    unit:        r.unit,
    priceUsd:    r.price_usd,
    bcvRate:     r.bcv_rate,
    profitBs:    r.profit_bs,
    totalBs:     r.total_bs,
    totalUsd:    r.total_usd,
    soldAt:      new Date(r.sold_at),
  };
}

// ─── Products ───────────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch('/api/products');
  if (!res.ok) throw new Error('Error al cargar productos');
  const data: DbProduct[] = await res.json();
  return data.map(mapProduct);
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  const res = await fetch('/api/products', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      name:          data.name,
      price_usd:     data.priceUsd,
      custom_profit: data.customProfit,
      unit:          data.unit,
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
      name:          data.name,
      price_usd:     data.priceUsd,
      custom_profit: data.customProfit,
      unit:          data.unit,
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
  const data: DbSale[] = await res.json();
  return data.map(mapSale);
}

export async function createSale(data: Omit<Sale, 'id'>): Promise<Sale> {
  const res = await fetch('/api/sales', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      product_id:   data.productId,
      product_name: data.productName,
      quantity:     data.quantity,
      unit:         data.unit,
      price_usd:    data.priceUsd,
      bcv_rate:     data.bcvRate,
      profit_bs:    data.profitBs,
      total_bs:     data.totalBs,
      total_usd:    data.totalUsd,
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
