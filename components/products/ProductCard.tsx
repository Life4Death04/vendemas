'use client';

import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';
import { formatBs, formatUsd, calcPriceBs, calcPriceUsd, getProfit } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  bcvRate: number;
  generalProfit: number;
  onEdit:   (p: Product) => void;
  onDelete: (p: Product) => void;
}

export function ProductCard({ product, bcvRate, generalProfit, onEdit, onDelete }: ProductCardProps) {
  const router     = useRouter();
  const priceBs    = calcPriceBs(product, bcvRate, generalProfit);
  const priceUsd   = calcPriceUsd(product, bcvRate, generalProfit);
  const profit     = getProfit(product, generalProfit);
  const hasCustom  = product.customProfit != null;

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="p-4">
        <p className="text-lg font-bold text-text">{product.name}</p>
        <p className="text-sm text-muted mt-0.5">Base: {formatUsd(product.priceUsd)} / {product.unit}</p>

        <div className="h-px bg-border my-3" />

        <p className="text-[28px] font-bold text-price leading-tight">{formatBs(priceBs)}</p>
        <p className="text-sm font-medium text-muted mt-0.5">{formatUsd(priceUsd)}</p>

        {hasCustom && (
          <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-warn-light text-warn-text">
            Ganancia propia: {profit} Bs
          </span>
        )}
      </div>

      {/* Actions row */}
      <div className="grid grid-cols-[1fr_44px_44px_44px] border-t border-border">
        {/* Quick calc */}
        <button
          onClick={() => router.push(`/calcular?productId=${product.id}`)}
          className="flex items-center justify-center gap-1.5 h-12 text-sm font-semibold text-primary bg-primary-light border-r border-border active:bg-[#DBEAFE] transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="12" y2="15"/>
          </svg>
          Calcular
        </button>

        {/* Detail */}
        <button
          onClick={() => router.push(`/productos/${product.id}`)}
          className="flex items-center justify-center h-12 w-11 border-r border-border active:bg-bg transition-colors"
          title="Ver detalle"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A56DB" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </button>

        {/* Edit */}
        <button
          onClick={() => onEdit(product)}
          className="flex items-center justify-center h-12 w-11 border-r border-border active:bg-bg transition-colors"
          title="Editar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(product)}
          className="flex items-center justify-center h-12 w-11 active:bg-bg transition-colors"
          title="Eliminar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E02424" strokeWidth="2" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
