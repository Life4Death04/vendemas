'use client';

import { useEffect, type ReactNode } from 'react';

interface BottomSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function BottomSheet({ open, title, onClose, children }: BottomSheetProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else      document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/45 z-[400] animate-fade-in"
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-surface rounded-t-2xl z-[500] max-h-[92vh] overflow-y-auto"
        style={{ animation: 'slideUp .3s cubic-bezier(.32,.72,0,1)' }}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3.5 mb-5" />
        {/* Header */}
        <div className="flex items-center justify-between px-4 mb-5">
          <span className="text-xl font-bold text-text">{title}</span>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-11 h-11 rounded-lg hover:bg-bg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="px-4 pb-8">
          {children}
        </div>
      </div>
    </>
  );
}
