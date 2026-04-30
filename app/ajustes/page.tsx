'use client';

import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { useToast } from '@/context/ToastContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatRelativeTime } from '@/lib/utils';

export default function AjustesPage() {
  const { settings, saveSettings, bcv, refreshBcv } = useStore();
  const { showToast } = useToast();

  const [profitValue, setProfitValue] = useState(settings.generalProfit.toString());
  const [profitError, setProfitError] = useState('');
  const [profitShake, setProfitShake] = useState(false);
  const [refreshing,  setRefreshing]  = useState(false);

  async function handleSaveProfit() {
    const val = parseFloat(profitValue);
    if (!val || val <= 0) {
      setProfitError('La ganancia debe ser mayor a 0');
      setProfitShake(true);
      setTimeout(() => setProfitShake(false), 400);
      return;
    }
    setProfitError('');
    try {
      await saveSettings({ generalProfit: val });
      showToast('Ganancia actualizada · Precios recalculados', 'success');
    } catch (e: unknown) {
      showToast((e as Error).message ?? 'Error al guardar', 'error');
    }
  }

  async function handleRefreshBcv() {
    setRefreshing(true);
    try {
      await refreshBcv();
      showToast('Tasa BCV actualizada', 'success');
    } catch {
      showToast('Sin conexión · Usando última tasa guardada', 'warning');
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <>
      <PageHeader title="Ajustes" />

      <div className="px-4 pt-4 flex flex-col gap-5">

        {/* Prices section */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-2">Precios</p>
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-base font-bold text-text mb-1">Ganancia general</p>
            <p className="text-sm text-muted mb-4">En dólares por unidad. Se aplica a productos sin ganancia personalizada</p>

            <div className="relative mb-2">
              <input
                type="number"
                value={profitValue}
                onChange={e => { setProfitValue(e.target.value); setProfitError(''); }}
                min="0"
                step="0.5"
                inputMode="decimal"
                className={`w-full h-[60px] px-3.5 pr-12 rounded-xl border-[1.5px] text-2xl font-bold text-center outline-none transition-all ${
                  profitError
                    ? 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(224,36,36,.10)]'
                    : 'border-border focus:border-primary focus:shadow-[0_0_0_3px_rgba(26,86,219,.12)]'
                } ${profitShake ? 'animate-shake' : ''}`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xl font-bold text-muted pointer-events-none">$</span>
            </div>
            {profitError && <p className="text-danger text-[13px] mb-3">{profitError}</p>}

            <button
              onClick={handleSaveProfit}
              className="w-full h-[52px] bg-primary text-white rounded-xl text-base font-semibold"
            >
              Guardar ganancia
            </button>
          </div>
        </div>

        {/* BCV section */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-2">Tasa BCV</p>
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-[15px] text-muted">Tasa actual</span>
              <span className="text-[15px] font-bold text-price">{bcv.rate.toFixed(2)} Bs/$</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-[15px] text-muted">Última actualización</span>
              <span className="text-sm text-muted">{formatRelativeTime(bcv.updatedAt)}</span>
            </div>

            <div className="flex gap-2.5 items-start bg-primary-light border border-primary-border rounded-xl p-3 my-3">
              <span className="text-base flex-shrink-0">ℹ️</span>
              <p className="text-[13px] text-[#1E40AF] leading-relaxed">
                El BCV actualiza la tasa todos los días a las <strong>5:00 pm</strong> (hora Venezuela).
                Si no hay conexión se usa la última tasa guardada.
              </p>
            </div>

            <button
              onClick={handleRefreshBcv}
              disabled={refreshing}
              className="w-full h-[52px] bg-transparent border-2 border-primary text-primary rounded-xl text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {refreshing ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin-custom" />
                  Actualizando...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
                  </svg>
                  Actualizar tasa ahora
                </>
              )}
            </button>
          </div>
        </div>

        {/* About */}
        <p className="text-center text-[13px] text-subtle pb-2">VendeMás · Hecho con ♥</p>
      </div>
    </>
  );
}
