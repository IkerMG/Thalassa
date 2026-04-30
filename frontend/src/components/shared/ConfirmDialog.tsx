import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  requireTextConfirmation?: string;
  onConfirm: () => Promise<void>;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  requireTextConfirmation,
  onConfirm,
}: ConfirmDialogProps) {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Reset input when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setInputValue('');
      setLoading(false);
    } else {
      // Focus cancel button on open (safer default for destructive actions)
      setTimeout(() => cancelRef.current?.focus(), 0);
    }
  }, [open]);

  // Escape closes + focus trap
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
        return;
      }

      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  const confirmAllowed =
    !requireTextConfirmation || inputValue === requireTextConfirmation;

  const handleConfirm = async () => {
    if (!confirmAllowed || loading) return;
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const confirmButtonClass =
    variant === 'destructive'
      ? 'bg-red-600 hover:bg-red-500 text-white'
      : 'bg-[#59D3FF] hover:bg-[#7DDEFF] text-[#0A0F1E]';

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onOpenChange(false); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-sm bg-[#0A0A0A] border border-[rgba(255,255,255,0.08)] rounded-xl p-6 z-10 flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <h2
            id="confirm-dialog-title"
            className="text-base font-semibold text-white"
          >
            {title}
          </h2>
          <p
            id="confirm-dialog-description"
            className="text-sm text-[#A0A0A0] leading-relaxed"
          >
            {description}
          </p>
        </div>

        {requireTextConfirmation && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#A0A0A0]">
              Escribe <span className="text-white font-medium">"{requireTextConfirmation}"</span> para confirmar
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-[#111] border border-[rgba(255,255,255,0.10)] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] outline-none focus:border-[rgba(255,255,255,0.25)] transition-colors"
              placeholder={requireTextConfirmation}
              autoComplete="off"
            />
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            ref={cancelRef}
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.12)] text-white text-sm hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!confirmAllowed || loading}
            className={[
              'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              confirmButtonClass,
            ].join(' ')}
          >
            {loading ? 'Procesando…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
