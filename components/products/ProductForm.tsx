'use client';

import { useState, useEffect } from 'react';
import type { Product, Unit } from '@/lib/types';
import { formatBs, formatUsd } from '@/lib/utils';

const UNITS: Unit[] = ['kg', 'g', 'lb', 'litro', 'unidad'];

interface ProductFormProps {
  product?: Product | null;
  bcvRate: number;
  generalProfit: number;
  onSave: (data: Omit<Product, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  saving?: boolean;
}

export function ProductForm({ product, bcvRate, generalProfit, onSave, onCancel, saving = false }: ProductFormProps) {
  const [name,         setName]         = useState(product?.name         ?? '');
  const [priceUsd,     setPriceUsd]     = useState(product?.priceUsd?.toString() ?? '');
  const [unit,         setUnit]         = useState<Unit>(product?.unit   ?? 'kg');
  const [customProfit, setCustomProfit] = useState(product?.customProfit?.toString() ?? '');
  const [errors,       setErrors]       = useState<Record<string, string>>({});
  const [shake,        setShake]        = useState<string | null>(null);

  const priceNum   = parseFloat(priceUsd)   || 0;
  const profitNum  = parseFloat(customProfit) || generalProfit;
  const previewBs  = priceNum > 0 ? (priceNum * bcvRate) + profitNum : 0;
  const previewUsd = previewBs > 0 ? previewBs / bcvRate : 0;

  function triggerShake(field: string) {
    setShake(field);
    setTimeout(() => setShake(null), 400);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim())         { newErrors.name  = 'El nombre es requerido';     triggerShake('name'); }
    if (!priceNum || priceNum <= 0) { newErrors.price = 'Ingresa un precio mayor a 0'; triggerShake('price'); }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onSave({
      name: name.trim(),
      priceUsd: priceNum,
      unit,
      customProfit: customProfit ? parseFloat(customProfit) : null,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Name */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-text mb-1.5">Nombre del producto</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ej: Jamón, Queso blanco..."
          autoComplete="off"
          className={`w-full h-[52px] px-3.5 rounded-xl border-[1.5px] text-base outline-none transition-all ${
            errors.name
              ? 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(224,36,36,.10)]'
              : 'border-border focus:border-primary focus:shadow-[0_0_0_3px_rgba(26,86,219,.12)]'
          } ${shake === 'name' ? 'animate-shake' : ''}`}
        />
        {errors.name && <p className="text-danger text-[13px] mt-1">{errors.name}</p>}
      </div>

      {/* Price */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-text mb-1.5">Precio base (USD)</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-semibold text-muted pointer-events-none">$</span>
          <input
            type="number"
            value={priceUsd}
            onChange={e => setPriceUsd(e.target.value)}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            className={`w-full h-[52px] pl-7 pr-3.5 rounded-xl border-[1.5px] text-base font-bold outline-none transition-all ${
              errors.price
                ? 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(224,36,36,.10)]'
                : 'border-border focus:border-primary focus:shadow-[0_0_0_3px_rgba(26,86,219,.12)]'
            } ${shake === 'price' ? 'animate-shake' : ''}`}
          />
        </div>
        {errors.price && <p className="text-danger text-[13px] mt-1">{errors.price}</p>}
      </div>

      {/* Unit */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-text mb-1.5">Se vende por</label>
        <select
          value={unit}
          onChange={e => setUnit(e.target.value as Unit)}
          className="w-full h-[52px] px-3.5 rounded-xl border-[1.5px] border-border text-base outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(26,86,219,.12)] transition-all appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSI4IiB2aWV3Qm94PSIwIDAgMTIgOCI+PHBhdGggZD0iTTEgMWw1IDUgNS01IiBzdHJva2U9IiM2QjcyODAiIHN0cm9rZS13aWR0aD0iMS41IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=')] bg-no-repeat bg-[right_14px_center] pr-9"
        >
          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      {/* Custom profit */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-text mb-1.5">
          Ganancia personalizada{' '}
          <span className="text-xs font-normal text-muted">(opcional)</span>
        </label>
        <div className="relative">
          <input
            type="number"
            value={customProfit}
            onChange={e => setCustomProfit(e.target.value)}
            placeholder={`Dejar vacío para usar ${generalProfit} Bs`}
            min="0"
            step="0.5"
            inputMode="decimal"
            className="w-full h-[52px] px-3.5 pr-10 rounded-xl border-[1.5px] border-border text-base outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(26,86,219,.12)] transition-all"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base font-semibold text-muted pointer-events-none">Bs</span>
        </div>
        <p className="text-[13px] text-muted mt-1">Si se deja vacío se aplica la ganancia general ({generalProfit} Bs)</p>

        {previewBs > 0 && (
          <div className="mt-2 px-3 py-2 rounded-lg bg-price-light border border-price-border text-sm font-semibold text-price">
            Precio aprox: {formatBs(previewBs)} · {formatUsd(previewUsd)}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full h-[52px] bg-primary text-white rounded-xl text-base font-semibold mb-2 flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-custom" />}
        {saving ? 'Guardando...' : 'Guardar'}
      </button>
      <button type="button" onClick={onCancel} className="w-full h-12 text-base font-medium text-muted">
        Cancelar
      </button>
    </form>
  );
}
