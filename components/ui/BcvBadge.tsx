'use client';

import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { useToast } from '@/context/ToastContext';
import { formatRelativeTime } from '@/lib/utils';

export function BcvBadge() {
  const { bcv, setBcv } = useStore();
  const { showToast }   = useToast();
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200)); // mock delay
    setBcv({ ...bcv, updatedAt: new Date(), isStale: false });
    showToast('Tasa BCV actualizada', 'success');
    setLoading(false);
  };

  return (
    <button
      onClick={refresh}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold border transition-colors ${
        bcv.isStale
          ? 'bg-warn-light text-warn-text border-warn-border'
          : 'bg-primary-light text-primary border-primary-border'
      }`}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin-custom" />
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      )}
      {bcv.rate.toFixed(2)} Bs/$
    </button>
  );
}
