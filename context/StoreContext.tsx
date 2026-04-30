'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Product, Sale, Settings, BcvState, Unit } from '@/lib/types';
import { MOCK_BCV, MOCK_PRODUCTS, MOCK_SALES, MOCK_SETTINGS } from '@/lib/mock-data';

interface StoreContextValue {
  bcv: BcvState;
  settings: Settings;
  products: Product[];
  sales: Sale[];
  setBcv: (bcv: BcvState) => void;
  setSettings: (s: Settings) => void;
  addProduct: (data: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: number, data: Partial<Omit<Product, 'id' | 'createdAt'>>) => void;
  deleteProduct: (id: number) => void;
  addSale: (data: Omit<Sale, 'id'>) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

let nextId = 100;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [bcv, setBcv]           = useState<BcvState>(MOCK_BCV);
  const [settings, setSettings] = useState<Settings>(MOCK_SETTINGS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [sales, setSales]       = useState<Sale[]>(MOCK_SALES);

  const addProduct = useCallback((data: Omit<Product, 'id' | 'createdAt'>) => {
    setProducts(prev => [{ ...data, id: ++nextId, createdAt: new Date() }, ...prev]);
  }, []);

  const updateProduct = useCallback((id: number, data: Partial<Omit<Product, 'id' | 'createdAt'>>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  }, []);

  const deleteProduct = useCallback((id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const addSale = useCallback((data: Omit<Sale, 'id'>) => {
    setSales(prev => [{ ...data, id: ++nextId }, ...prev]);
  }, []);

  return (
    <StoreContext value={{ bcv, settings, products, sales, setBcv, setSettings, addProduct, updateProduct, deleteProduct, addSale }}>
      {children}
    </StoreContext>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
