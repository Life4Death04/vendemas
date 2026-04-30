export interface Product {
  id: number;
  name: string;
  priceUsd: number;
  customProfit: number | null;
  unit: Unit;
  createdAt: Date;
}

export interface Sale {
  id: number;
  productId: number | null;
  productName: string;
  quantity: number;
  unit: Unit;
  priceUsd: number;
  bcvRate: number;
  profitBs: number;
  totalBs: number;
  totalUsd: number;
  soldAt: Date;
}

export interface Settings {
  generalProfit: number;
}

export interface BcvState {
  rate: number;
  updatedAt: Date;
  isStale: boolean;
}

export type Unit = 'kg' | 'g' | 'lb' | 'litro' | 'unidad';

export type SortOrder = 'az' | 'za' | 'price-asc' | 'price-desc';
export type HistoryFilter = 'today' | 'week' | 'all';
