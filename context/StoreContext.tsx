'use client';

import {
  createContext, useContext, useState, useEffect,
  useCallback, type ReactNode,
} from 'react';
import type { Product, Sale, Settings, BcvState } from '@/lib/types';
import * as api from '@/lib/api-client';

interface StoreContextValue {
  // State
  bcv:         BcvState;
  settings:    Settings;
  products:    Product[];
  sales:       Sale[];
  loading:     boolean;

  // Mutations
  refreshBcv:     () => Promise<void>;
  saveSettings:   (s: Partial<Settings>) => Promise<void>;
  addProduct:     (data: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  editProduct:    (id: number, data: Partial<Omit<Product, 'id' | 'createdAt'>>) => Promise<void>;
  removeProduct:  (id: number) => Promise<void>;
  addSale:        (data: Omit<Sale, 'id'>) => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const FALLBACK_BCV: BcvState = { rate: 1, updatedAt: new Date(), isStale: true };
const FALLBACK_SETTINGS: Settings = { generalProfit: 20 };

export function StoreProvider({ children }: { children: ReactNode }) {
  const [bcv,      setBcv]      = useState<BcvState>(FALLBACK_BCV);
  const [settings, setSettings] = useState<Settings>(FALLBACK_SETTINGS);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales,    setSales]    = useState<Sale[]>([]);
  const [loading,  setLoading]  = useState(true);

  // Load everything in parallel on mount
  useEffect(() => {
    Promise.all([
      api.fetchBcvRate().catch(() => FALLBACK_BCV),
      api.fetchSettings().catch(() => FALLBACK_SETTINGS),
      api.fetchProducts().catch(() => []),
      api.fetchSales().catch(() => []),
    ]).then(([bcvData, settingsData, productsData, salesData]) => {
      setBcv(bcvData);
      setSettings(settingsData);
      setProducts(productsData);
      setSales(salesData);
      setLoading(false);
    });
  }, []);

  const refreshBcv = useCallback(async () => {
    const data = await api.fetchBcvRate();
    setBcv(data);
  }, []);

  const saveSettings = useCallback(async (partial: Partial<Settings>) => {
    const updated = await api.updateSettings(partial);
    setSettings(updated);
  }, []);

  const addProduct = useCallback(async (data: Omit<Product, 'id' | 'createdAt'>) => {
    const created = await api.createProduct(data);
    setProducts(prev => [created, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
  }, []);

  const editProduct = useCallback(async (id: number, data: Partial<Omit<Product, 'id' | 'createdAt'>>) => {
    const updated = await api.updateProduct(id, data);
    setProducts(prev => prev.map(p => p.id === id ? updated : p));
  }, []);

  const removeProduct = useCallback(async (id: number) => {
    await api.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const addSale = useCallback(async (data: Omit<Sale, 'id'>) => {
    const created = await api.createSale(data);
    setSales(prev => [created, ...prev]);
  }, []);

  return (
    <StoreContext value={{
      bcv, settings, products, sales, loading,
      refreshBcv, saveSettings, addProduct, editProduct, removeProduct, addSale,
    }}>
      {children}
    </StoreContext>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
