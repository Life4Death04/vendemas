'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  right?: ReactNode;
}

export function PageHeader({ title, showBack = false, right }: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-[var(--header-height)] bg-surface border-b border-border flex items-center justify-between px-4 z-[100]">
      {showBack ? (
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-primary text-base font-medium min-w-[44px] min-h-[44px] -ml-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Volver
        </button>
      ) : (
        <div className="w-[44px]" />
      )}

      <span className="text-xl font-bold text-text flex-1 text-center">{title}</span>

      <div className="min-w-[44px] flex justify-end">
        {right ?? null}
      </div>
    </header>
  );
}
