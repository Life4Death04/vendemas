import type { Product, Sale, Settings, BcvState } from './types';

const now = new Date();
const d = (daysAgo: number, h = 12, m = 0) => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, m, 0, 0);
  return d;
};

export const MOCK_BCV: BcvState = {
  rate: 96.50,
  updatedAt: new Date(Date.now() - 2 * 60 * 1000),
  isStale: false,
};

export const MOCK_SETTINGS: Settings = {
  generalProfit: 20,
};

export const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Jamón',          priceUsd: 8.50,  customProfit: null, unit: 'kg',     createdAt: d(2) },
  { id: 2, name: 'Queso Blanco',   priceUsd: 4.00,  customProfit: null, unit: 'kg',     createdAt: d(3) },
  { id: 3, name: 'Mortadela',      priceUsd: 5.50,  customProfit: 15,   unit: 'kg',     createdAt: d(4) },
  { id: 4, name: 'Queso Amarillo', priceUsd: 6.00,  customProfit: null, unit: 'kg',     createdAt: d(5) },
  { id: 5, name: 'Pernil',         priceUsd: 12.00, customProfit: 30,   unit: 'kg',     createdAt: d(6) },
  { id: 6, name: 'Agua Mineral',   priceUsd: 0.80,  customProfit: null, unit: 'litro',  createdAt: d(7) },
];

export const MOCK_SALES: Sale[] = [
  { id: 1, productId: 1, productName: 'Jamón',        quantity: 0.8, unit: 'kg',    priceUsd: 8.50,  bcvRate: 96.50, profitBs: 20, totalBs: 677.00, totalUsd: 7.02, soldAt: d(0, 15, 45) },
  { id: 2, productId: 2, productName: 'Queso Blanco', quantity: 1.0, unit: 'kg',    priceUsd: 4.00,  bcvRate: 96.50, profitBs: 20, totalBs: 406.00, totalUsd: 4.21, soldAt: d(0, 11, 20) },
  { id: 3, productId: 3, productName: 'Mortadela',    quantity: 0.5, unit: 'kg',    priceUsd: 5.50,  bcvRate: 96.50, profitBs: 15, totalBs: 280.75, totalUsd: 2.91, soldAt: d(1, 14, 10) },
  { id: 4, productId: 1, productName: 'Jamón',        quantity: 0.5, unit: 'kg',    priceUsd: 8.50,  bcvRate: 96.50, profitBs: 20, totalBs: 482.25, totalUsd: 5.00, soldAt: d(1, 10,  5) },
  { id: 5, productId: 6, productName: 'Agua Mineral', quantity: 3,   unit: 'litro', priceUsd: 0.80,  bcvRate: 96.00, profitBs: 20, totalBs: 250.40, totalUsd: 2.61, soldAt: d(2,  9, 30) },
];
