import type { Product, Unit } from './types';

export function formatBs(value: number): string {
  return (
    new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + ' Bs'
  );
}

export function formatUsd(value: number): string {
  return (
    '$' +
    new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  );
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-VE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

export function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'hace un momento';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

export function getProfit(product: Product, generalProfit: number): number {
  return product.customProfit ?? generalProfit;
}

export function calcPriceUsd(product: Product, generalProfit: number, quantity = 1): number {
  const profitUsd = getProfit(product, generalProfit);
  return (product.priceUsd + profitUsd) * quantity;
}

export function calcPriceBs(product: Product, bcvRate: number, generalProfit: number, quantity = 1): number {
  return calcPriceUsd(product, generalProfit, quantity) * bcvRate;
}

// Unit conversion: converts `value` in `fromUnit` to the product's base unit
const CONVERSION_TABLE: Record<Unit, Partial<Record<Unit, number>>> = {
  kg:     { kg: 1,       g: 0.001,     lb: 0.453592 },
  g:      { g: 1,        kg: 1000                    },
  lb:     { lb: 1,       kg: 2.20462,  g: 453.592    },
  litro:  { litro: 1                                  },
  unidad: { unidad: 1                                 },
};

export function toBaseUnit(value: number, fromUnit: Unit, baseUnit: Unit): number {
  const factor = CONVERSION_TABLE[baseUnit]?.[fromUnit] ?? 1;
  return value / factor;
}

export function compatibleUnits(baseUnit: Unit): Unit[] {
  return Object.keys(CONVERSION_TABLE[baseUnit] ?? { [baseUnit]: 1 }) as Unit[];
}
