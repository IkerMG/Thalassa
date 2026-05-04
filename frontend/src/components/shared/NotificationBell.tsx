import { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, CheckCheck } from 'lucide-react';
import { useNotifications } from '../../hooks/queries/useNotifications';
import { useParameterAlerts } from '../../hooks/useParameterAlerts';
import type { NotificationItem } from '../../api/notificationApi';

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60)    return 'ahora';
  if (diff < 3600)  return `hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  return `hace ${Math.floor(diff / 86400)}d`;
}

function TypeIcon({ type }: { type: NotificationItem['type'] }) {
  if (type === 'SUCCESS') return <CheckCircle2 size={14} className="text-[#59D3FF] shrink-0" />;
  if (type === 'WARNING') return <AlertTriangle size={14} className="text-amber-400 shrink-0" />;
  return <Info size={14} className="text-[#A0A0A0] shrink-0" />;
}

function UnreadDot({ type }: { type: NotificationItem['type'] }) {
  const color =
    type === 'WARNING' ? 'bg-amber-400' :
    type === 'SUCCESS' ? 'bg-[#59D3FF]' :
    'bg-[#A0A0A0]';
  return <div className={`shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${color}`} />;
}

// ── Component ─────────────────────────────────────────────────────────────────

const PANEL_WIDTH = 320; // w-80

export default function NotificationBell() {
  const [open, setOpen]           = useState(false);
  const [openRight, setOpenRight] = useState(true);
  const [readIds, setReadIds]     = useState<Set<number>>(new Set());
  const ref                       = useRef<HTMLDivElement>(null);

  const { data: serverItems = [] } = useNotifications();
  const paramAlerts                = useParameterAlerts();

  const all: NotificationItem[] = [...paramAlerts, ...serverItems];

  const isRead = useCallback(
    (n: NotificationItem) => n.read || readIds.has(n.id ?? 0),
    [readIds]
  );

  const unreadCount = all.filter((n) => !isRead(n)).length;
  const visible     = all.slice(0, 7);

  const markAllRead = () => {
    setReadIds(new Set(all.map((n) => n.id ?? 0)));
  };

  // Detect which direction has room when the panel opens
  useEffect(() => {
    if (!open || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const spaceRight = window.innerWidth - rect.left;
    setOpenRight(spaceRight >= PANEL_WIDTH);
  }, [open]);

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-all duration-150 cursor-pointer"
        aria-label={`Notificaciones${unreadCount > 0 ? ` — ${unreadCount} sin leer` : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span
            className="absolute top-0.5 right-0.5 min-w-[14px] h-[14px] rounded-full bg-amber-400 text-black text-[9px] font-bold flex items-center justify-center px-0.5"
            aria-hidden="true"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="dialog"
          aria-label="Notificaciones"
          className={[
            'absolute top-10 w-80 bg-[#111] border border-[rgba(255,255,255,0.08)] rounded-xl shadow-2xl z-50 overflow-hidden',
            openRight ? 'left-0 origin-top-left' : 'right-0 origin-top-right',
          ].join(' ')}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
            <span className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">
              Notificaciones
              {unreadCount > 0 && (
                <span className="ml-2 text-amber-400">{unreadCount}</span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[10px] text-[#555] hover:text-[#A0A0A0] transition-colors cursor-pointer"
                title="Marcar todo como leído"
              >
                <CheckCheck size={12} />
                Leído
              </button>
            )}
          </div>

          {/* Items */}
          {visible.length === 0 ? (
            <div className="px-4 py-8 text-center text-[#555] text-sm">
              Sin notificaciones
            </div>
          ) : (
            <ul className="max-h-[360px] overflow-y-auto">
              {visible.map((n) => {
                const read = isRead(n);
                return (
                  <li
                    key={n.id}
                    className={[
                      'flex gap-3 px-4 py-3 border-b border-[rgba(255,255,255,0.04)] last:border-0 transition-colors',
                      !read ? 'bg-[rgba(251,191,36,0.03)]' : '',
                    ].join(' ')}
                  >
                    <div className="pt-0.5">
                      <TypeIcon type={n.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={[
                        'text-sm truncate',
                        !read ? 'text-white font-medium' : 'text-[#888]',
                      ].join(' ')}>
                        {n.title}
                      </p>
                      <p className="text-xs text-[#666] mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-[#444] mt-1 font-mono">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    {!read && <UnreadDot type={n.type} />}
                  </li>
                );
              })}
            </ul>
          )}

          {/* Footer */}
          {all.length > 7 && (
            <div className="px-4 py-2 border-t border-[rgba(255,255,255,0.04)] text-center">
              <span className="text-[10px] text-[#444]">
                +{all.length - 7} más
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
