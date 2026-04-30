'use client';

import { useState, useMemo } from 'react';
import { useStore }          from '@/context/StoreContext';
import { PageHeader }        from '@/components/ui/PageHeader';
import { formatBs, formatUsd, formatDate, formatTime } from '@/lib/utils';
import type { HistoryFilter } from '@/lib/types';

const FILTERS: { value: HistoryFilter; label: string }[] = [
  { value: 'today', label: 'Hoy' },
  { value: 'week',  label: 'Esta semana' },
  { value: 'all',   label: 'Todo' },
];

function isToday(date: Date) {
  return new Date().toDateString() === date.toDateString();
}

function isThisWeek(date: Date) {
  return Date.now() - date.getTime() <= 7 * 24 * 60 * 60 * 1000;
}

export default function HistorialPage() {
  const { sales, products } = useStore();
  const [filter, setFilter] = useState<HistoryFilter>('today');

  const filtered = useMemo(() => {
    return sales.filter(s => {
      if (filter === 'today') return isToday(s.soldAt);
      if (filter === 'week')  return isThisWeek(s.soldAt);
      return true;
    });
  }, [sales, filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, { date: Date; items: typeof filtered }>();
    filtered.forEach(s => {
      const key = s.soldAt.toDateString();
      if (!map.has(key)) map.set(key, { date: s.soldAt, items: [] });
      map.get(key)!.items.push(s);
    });
    return [...map.values()];
  }, [filtered]);

  const totalBs = filtered.reduce((sum, s) => sum + s.totalBs, 0);

  return (
    <>
      <PageHeader title="Historial de Ventas" />

      <div className="px-4 pt-4">
        {/* Filter chips */}
        <div className="flex gap-2 no-scrollbar overflow-x-auto pb-0.5 mb-4">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex-shrink-0 h-9 px-4 rounded-full text-sm font-medium transition-colors ${
                filter === f.value ? 'bg-primary text-white' : 'bg-[#F3F4F6] text-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Summary */}
        {filtered.length > 0 && filter !== 'all' && (
          <div className="flex items-center justify-between bg-primary-light border border-primary-border rounded-xl px-4 py-3 mb-4">
            <span className="text-sm font-medium text-primary">
              {filtered.length} venta{filtered.length !== 1 ? 's' : ''} {filter === 'today' ? 'hoy' : 'esta semana'}
            </span>
            <span className="text-base font-bold text-primary">{formatBs(totalBs)}</span>
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-14 pb-6 text-center gap-3">
            <span className="text-[56px]">{filter === 'all' ? '📂' : '📭'}</span>
            <p className="text-lg font-bold text-text">
              {filter === 'today' ? 'Sin ventas hoy' : filter === 'week' ? 'Sin ventas esta semana' : 'Sin ventas registradas'}
            </p>
            <p className="text-[15px] text-muted max-w-[260px]">
              Usa la calculadora para registrar ventas
            </p>
          </div>
        ) : (
          grouped.map(group => (
            <div key={group.date.toDateString()} className="mb-2">
              {/* Date header */}
              <div className="flex items-center gap-2 py-3">
                <span className="text-[13px] font-semibold text-muted uppercase tracking-wide">
                  {formatDate(group.date)}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="flex flex-col gap-2">
                {group.items.map(sale => {
                  const productDeleted = sale.productId && !products.find(p => p.id === sale.productId);
                  return (
                    <div key={sale.id} className="bg-surface border border-border rounded-xl px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-text">{sale.productName}</span>
                          {productDeleted && (
                            <span className="text-[11px] bg-[#F3F4F6] text-subtle px-1.5 py-0.5 rounded-full">eliminado</span>
                          )}
                        </div>
                        <span className="text-sm text-muted">{sale.quantity} {sale.unit}</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-xl font-bold text-price">{formatBs(sale.totalBs)}</span>
                          <span className="text-sm text-muted ml-2">{formatUsd(sale.totalUsd)}</span>
                        </div>
                        <span className="text-sm text-subtle">{formatTime(sale.soldAt)}</span>
                      </div>
                      <p className="text-xs text-subtle mt-1">
                        Tasa: {sale.bcvRate.toFixed(2)} Bs/$ · Ganancia: {sale.profitBs.toFixed(2)} Bs
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
