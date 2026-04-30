'use client';

import { use, useState } from 'react';
import { useRouter }     from 'next/navigation';
import { useStore }      from '@/context/StoreContext';
import { useToast }      from '@/context/ToastContext';
import { PageHeader }    from '@/components/ui/PageHeader';
import { BottomSheet }   from '@/components/ui/BottomSheet';
import { ProductForm }   from '@/components/products/ProductForm';
import { formatBs, formatUsd, calcPriceBs, calcPriceUsd, getProfit, formatRelativeTime } from '@/lib/utils';
import type { Product }  from '@/lib/types';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }   = use(params);
  const router   = useRouter();
  const { products, bcv, settings, editProduct } = useStore();
  const { showToast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [saving,   setSaving]   = useState(false);

  const product = products.find(p => p.id === Number(id));

  if (!product) {
    return (
      <>
        <PageHeader title="Producto" showBack />
        <div className="flex flex-col items-center justify-center pt-20 gap-3 text-center px-4">
          <span className="text-[56px]">😕</span>
          <p className="text-lg font-bold">Producto no encontrado</p>
          <button onClick={() => router.push('/productos')} className="text-primary font-medium">
            Volver a productos
          </button>
        </div>
      </>
    );
  }

  // product is defined here — the undefined case returned early above
  const p        = product!;
  const profit   = getProfit(p, settings.generalProfit);
  const conv     = p.priceUsd * bcv.rate;
  const priceBs  = calcPriceBs(p, bcv.rate, settings.generalProfit);
  const priceUsd = calcPriceUsd(p, bcv.rate, settings.generalProfit);
  const hasCustom = p.customProfit != null;

  async function handleSave(data: Omit<Product, 'id' | 'createdAt'>) {
    setSaving(true);
    try {
      await editProduct(p.id, data);
      showToast('Producto actualizado', 'success');
      setEditOpen(false);
    } catch (e: unknown) {
      showToast((e as Error).message ?? 'Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title={p.name}
        showBack
        right={
          <button onClick={() => setEditOpen(true)} className="flex items-center justify-center w-11 h-11">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        }
      />

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Hero price card */}
        <div className="bg-price-light border border-price-border rounded-xl px-5 py-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-2">Precio de venta</p>
          <p className="text-[44px] font-extrabold text-price leading-tight">{formatBs(priceBs)}</p>
          <p className="text-xl font-medium text-muted mt-1.5">{formatUsd(priceUsd)}</p>
        </div>

        {/* Breakdown */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">Cómo se calculó</p>

          {[
            { label: 'Precio base',  value: formatUsd(p.priceUsd) },
            { label: 'Tasa BCV',     value: `× ${bcv.rate.toFixed(2)} Bs/$` },
            { label: 'Conversión',   value: formatBs(conv) },
            { label: 'Ganancia',     value: `+ ${profit.toFixed(2)} Bs`, green: true },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between py-3 border-b border-border last:border-none">
              <span className="text-[15px] text-muted">{row.label}</span>
              <span className={`text-[15px] font-semibold ${row.green ? 'text-price' : 'text-text'}`}>{row.value}</span>
            </div>
          ))}

          <div className="flex items-center justify-between pt-3 mt-1 border-t-2 border-border">
            <span className="text-[15px] font-bold text-text">Total</span>
            <span className="text-lg font-bold text-price">{formatBs(priceBs)}</span>
          </div>

          <p className="text-xs text-subtle mt-2">Tasa actualizada {formatRelativeTime(bcv.updatedAt)}</p>
        </div>

        {/* Product info */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">Información del producto</p>
          {[
            { label: 'Unidad de medida', value: p.unit },
            { label: 'Precio base',      value: `${formatUsd(p.priceUsd)} / ${p.unit}` },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between py-3 border-b border-border last:border-none">
              <span className="text-[15px] text-muted">{row.label}</span>
              <span className="text-[15px] font-semibold text-text">{row.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between py-3">
            <span className="text-[15px] text-muted">Ganancia aplicada</span>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold text-text">{profit} Bs</span>
              {hasCustom ? (
                <span className="text-xs bg-warn-light text-warn-text px-2 py-0.5 rounded-full">personalizada</span>
              ) : (
                <span className="text-xs text-subtle">(general)</span>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push(`/calcular?productId=${p.id}`)}
          className="w-full h-[52px] bg-primary text-white rounded-xl text-base font-semibold flex items-center justify-center gap-2 mb-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="12" y2="15"/>
          </svg>
          Calcular porción de este producto
        </button>
      </div>

      <BottomSheet open={editOpen} title="Editar producto" onClose={() => setEditOpen(false)}>
        <ProductForm
          product={p}
          bcvRate={bcv.rate}
          generalProfit={settings.generalProfit}
          onSave={handleSave}
          onCancel={() => setEditOpen(false)}
          saving={saving}
        />
      </BottomSheet>
    </>
  );
}
