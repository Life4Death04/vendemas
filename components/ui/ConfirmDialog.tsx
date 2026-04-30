'use client';

interface ConfirmDialogProps {
  open: boolean;
  icon?: string;
  title: string;
  body: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open, icon = '🗑️', title, body,
  confirmLabel = 'Confirmar', danger = true,
  onConfirm, onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/45 z-[500] animate-fade-in" onClick={onCancel} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-48px)] max-w-[340px] bg-surface rounded-2xl p-6 z-[600] text-center animate-fade-in shadow-xl">
        <div className="text-[40px] mb-3">{icon}</div>
        <h3 className="text-lg font-bold text-text mb-2">{title}</h3>
        <p className="text-[15px] text-muted leading-relaxed mb-5">{body}</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className={`h-[52px] rounded-xl text-base font-semibold text-white w-full ${danger ? 'bg-danger' : 'bg-primary'}`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="h-12 rounded-xl text-base font-medium text-muted w-full"
          >
            Cancelar
          </button>
        </div>
      </div>
    </>
  );
}
