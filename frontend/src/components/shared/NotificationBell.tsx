import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { useNotifications } from '../../hooks/queries/useNotifications';
import type { NotificationItem } from '../../api/notificationApi';

function timeAgo(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function TypeIcon({ type }: { type: NotificationItem['type'] }) {
  if (type === 'SUCCESS') return <CheckCircle2 size={14} className="text-[#59D3FF] shrink-0" />;
  if (type === 'WARNING') return <AlertTriangle size={14} className="text-amber-400 shrink-0" />;
  return <Info size={14} className="text-[#A0A0A0] shrink-0" />;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: notifications = [] } = useNotifications();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const latest = notifications.slice(0, 5);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg text-[#A0A0A0] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-all duration-150"
        aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span
            className="absolute top-0.5 right-0.5 min-w-[14px] h-[14px] rounded-full bg-[#59D3FF] text-black text-[9px] font-bold flex items-center justify-center px-0.5"
            aria-hidden="true"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute left-0 top-10 w-72 bg-[#111] border border-[rgba(255,255,255,0.08)] rounded-xl shadow-2xl z-50 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
            <span className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">
              Notifications
            </span>
          </div>

          {latest.length === 0 ? (
            <div className="px-4 py-6 text-center text-[#666] text-sm">No notifications</div>
          ) : (
            <ul>
              {latest.map((n) => (
                <li
                  key={n.id}
                  className={[
                    'flex gap-3 px-4 py-3 border-b border-[rgba(255,255,255,0.04)] last:border-0',
                    !n.read ? 'bg-[rgba(89,211,255,0.03)]' : '',
                  ].join(' ')}
                >
                  <div className="pt-0.5">
                    <TypeIcon type={n.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={[
                        'text-sm truncate',
                        !n.read ? 'text-white font-medium' : 'text-[#ccc]',
                      ].join(' ')}
                    >
                      {n.title}
                    </p>
                    <p className="text-xs text-[#777] mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-[#555] mt-1 font-mono">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#59D3FF] mt-1.5" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
