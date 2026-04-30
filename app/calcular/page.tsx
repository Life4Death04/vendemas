'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams }  from 'next/navigation';
import { useStore }         from '@/context/StoreContext';
import { useToast }         from '@/context/ToastContext';
import { PageHeader }       from '@/components/ui/PageHeader';
import { BottomSheet }      from '@/components/ui/BottomSheet';
import { formatBs, formatUsd, getProfit, toBaseUnit, compatibleUnits, formatRelativeTime } from '@/lib/utils';
import type { Unit }        from '@/lib/types';

function CalculadoraContent() {
  const { products, bcv, settings, addSale } = useStore();
  const { showToast }   = useToast();
  const searchParams    = useSearchParams();
  const paramProductId  = searchParams.get('productId');

  const [productId,    setProductId]    = useState<number | ''>(paramProductId ? Number(paramProductId) : '');
  const [qty,          setQty]          = useState('');
  const [unit,         setUnit]         = useState<Unit>('kg');
  const [expanded,     setExpanded]     = useState(false);
  const [saleOpen,     setSaleOpen]     = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [registering,  setRegistering]  = useState(false);

  const product = useMemo(() => products.find(p => p.id === productId) ?? null, [products, productId]);
  const units   = useMemo(() => product ? compatibleUnits(product.unit) : [], [product]);

  useEffect(() => {
    if (product) setUnit(product.unit);
  }, [product]);

  const result = useMemo(() => {
    if (!product || !qty || Number(qty) <= 0) return null;
    const qtyBase   = toBaseUnit(Number(qty), unit, product.unit);
    const profitUsd = getProfit(product, settings.generalProfit);
    const totalUsd  = (product.priceUsd + profitUsd) * qtyBase;
    const totalBs   = totalUsd * bcv.rate;
    const profitTotal = profitUsd * qtyBase;
    return { totalBs, totalUsd, profitTotal, profitUsd, qtyBase };
  }, [product, qty, unit, bcv.rate, settings.generalProfit]);

  async function handleRegister() {
    if (!product || !result) return;
    setRegistering(true);
    try {
      await addSale({
        productId:    product.id,
        productName:  product.name,
        quantity:     Number(qty),
        unit,
        priceUsd:     product.priceUsd,
        bcvRate:      bcv.rate,
        profitUsd:    result.profitTotal,
        totalBs:      result.totalBs,
        totalUsd:     result.totalUsd,
        customerName: customerName.trim() || null,
        soldAt:       new Date(),
      });
      showToast('Venta registrada', 'success');
      setQty('');
      setExpanded(false);
      setSaleOpen(false);
      setCustomerName('');
    } catch {
      showToast('Error al registrar la venta', 'error');
    } finally {
      setRegistering(false);
    }
  }

  return (
    <>
      <PageHeader title="Calculadora" />

      <div className="px-4 pt-4">
        {/* Product selector */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-text mb-1.5">Producto</label>
          <select
            value={productId}
            onChange={e => { setProductId(Number(e.target.value)); setQty(''); }}
            className="w-full h-[52px] px-3.5 rounded-xl border-[1.5px] border-border text-base outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(26,86,219,.12)] transition-all appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSI4IiB2aWV3Qm94PSIwIDAgMTIgOCI+PHBhdGggZD0iTTEgMWw1IDUgNS01IiBzdHJva2U9IiM2QjcyODAiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=')] bg-no-repeat bg-[right_14px_center] pr-9"
          >
            <option value="" disabled>Selecciona un producto...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Quantity + unit */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-text mb-1.5">Cantidad</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={qty}
              onChange={e => setQty(e.target.value)}
              placeholder="0"
              min="0"
              step="any"
              inputMode="decimal"
              className="flex-1 max-w-[250px] h-[60px] px-3.5 rounded-xl border-[1.5px] border-border text-2xl font-bold text-center outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(26,86,219,.12)] transition-all"
            />
            <select
              value={unit}
              onChange={e => setUnit(e.target.value as Unit)}
              disabled={!product}
              className="w-[110px] h-[60px] px-3.5 rounded-xl border-[1.5px] border-border text-base outline-none focus:border-primary transition-all appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSI4IiB2aWV3Qm94PSIwIDAgMTIgOCI+PHBhdGggZD0iTTEgMWw1IDUgNS01IiBzdHJva2U9IiM2QjcyODAiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=')] bg-no-repeat bg-[right_14px_center] pr-9 disabled:opacity-50"
            >
              {units.length > 0
                ? units.map(u => <option key={u} value={u}>{u}</option>)
                : <option value="">-</option>
              }
            </select>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="animate-fade-in">
            <div className="bg-price-light border border-price-border rounded-xl px-5 py-5 text-center mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-2">Precio final</p>
              <p className="text-[40px] font-extrabold text-price leading-tight">{formatBs(result.totalBs)}</p>
              <p className="text-lg font-medium text-muted mt-1">{formatUsd(result.totalUsd)}</p>
              <p className="text-xs text-subtle mt-2">
                Tasa BCV: {bcv.rate.toFixed(2)} Bs/$ · {formatRelativeTime(bcv.updatedAt)}
              </p>
            </div>

            {/* Collapsible breakdown */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-primary text-sm font-medium mb-2"
            >
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              Ver desglose
            </button>

            {expanded && (
              <div className="bg-surface border border-border rounded-xl p-4 mb-3 animate-fade-in">
                {[
                  { label: 'Precio base',                 value: formatUsd(product?.priceUsd ?? 0) },
                  { label: `Ganancia / ${product?.unit}`, value: `+ ${formatUsd(result.profitUsd)}`, green: true },
                  { label: 'Precio venta unitario',       value: formatUsd((product?.priceUsd ?? 0) + result.profitUsd) },
                  { label: 'Cantidad',                    value: `${qty} ${unit}` },
                  { label: 'Total',                       value: formatUsd(result.totalUsd) },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-2.5 border-b border-border last:border-none">
                    <span className="text-sm text-muted">{row.label}</span>
                    <span className={`text-sm font-semibold ${row.green ? 'text-price' : 'text-text'}`}>{row.value}</span>
                  </div>
                ))}

                {/* Total profit highlight */}
                <div className="flex justify-between items-center mt-3 pt-3 border-t-2 border-border">
                  <span className="text-sm font-bold text-text">Ganancia total</span>
                  <span className="text-base font-extrabold text-[#059669]">+ {formatUsd(result.profitTotal)}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setSaleOpen(true)}
              className="w-full h-[52px] bg-primary text-white rounded-xl text-base font-semibold flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Registrar esta venta
            </button>
          </div>
        )}
      </div>

      {/* Sale registration sheet with optional customer name */}
      <BottomSheet open={saleOpen} title="Registrar venta" onClose={() => setSaleOpen(false)}>
        <div className="flex flex-col gap-4">
          {result && (
            <div className="bg-price-light border border-price-border rounded-xl px-4 py-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">Total</p>
              <p className="text-2xl font-extrabold text-price">{formatBs(result.totalBs)}</p>
              <p className="text-sm text-muted mt-0.5">{formatUsd(result.totalUsd)}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-text mb-1.5">
              Nombre del cliente{' '}
              <span className="text-xs font-normal text-muted">(opcional)</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Ej: María, Cliente #5..."
              autoComplete="off"
              className="w-full h-[52px] px-3.5 rounded-xl border-[1.5px] border-border text-base outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(26,86,219,.12)] transition-all"
            />
          </div>

          <button
            onClick={handleRegister}
            disabled={registering}
            className="w-full h-[52px] bg-primary text-white rounded-xl text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {registering && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-custom" />}
            {registering ? 'Registrando...' : 'Confirmar venta'}
          </button>
          <button
            type="button"
            onClick={() => setSaleOpen(false)}
            className="w-full h-12 text-base font-medium text-muted"
          >
            Cancelar
          </button>
        </div>
      </BottomSheet>
    </>
  );
}

export default function CalculadoraPage() {
  return (
    <Suspense>
      <CalculadoraContent />
    </Suspense>
  );
}
