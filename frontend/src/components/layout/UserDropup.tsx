import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';

const MENU_ITEM_CLASS =
  'w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#A0A0A0] ' +
  'hover:text-white hover:bg-[rgba(255,255,255,0.04)] ' +
  'transition-colors duration-100 cursor-pointer';

export default function UserDropup() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef        = useRef<HTMLDivElement>(null);
  const navigate            = useNavigate();
  const { logout }          = useAuth();
  const user                = useAuthStore((s) => s.user);
  const initial             = user?.username?.[0]?.toUpperCase() ?? 'U';

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setIsOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const go = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div ref={containerRef} className="relative px-3 py-4 border-t border-[rgba(255,255,255,0.08)]">

      {/* Floating panel — opens upward */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute bottom-full left-0 right-0 mx-0 mb-2
                       bg-[#111] border border-[rgba(255,255,255,0.08)]
                       rounded-xl shadow-2xl z-50 overflow-hidden py-1"
          >
            <button onClick={() => go('/dashboard/profile')} className={MENU_ITEM_CLASS}>
              <User size={15} />
              <span>Mi Perfil</span>
            </button>

            <button onClick={() => go('/dashboard/profile/settings')} className={MENU_ITEM_CLASS}>
              <Settings size={15} />
              <span>Configuración</span>
            </button>

            <div className="my-1 border-t border-[rgba(255,255,255,0.08)]" />

            <button
              onClick={handleLogout}
              className={
                'w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#666] ' +
                'hover:text-[#F87171] hover:bg-[rgba(248,113,113,0.06)] ' +
                'transition-colors duration-100 cursor-pointer'
              }
            >
              <LogOut size={15} />
              <span>Cerrar Sesión</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                   hover:bg-[rgba(255,255,255,0.04)] transition-all duration-150 cursor-pointer"
      >
        {/* Initials avatar */}
        <div className="w-8 h-8 rounded-full bg-[rgba(89,211,255,0.10)]
                        border border-[rgba(89,211,255,0.25)]
                        flex items-center justify-center shrink-0">
          <span className="text-[#59D3FF] text-xs font-bold">{initial}</span>
        </div>

        {/* Username + email */}
        <div className="flex-1 text-left overflow-hidden">
          <p className="text-sm text-white font-medium truncate">{user?.username}</p>
          <p className="text-xs text-[#666] truncate">{user?.email}</p>
        </div>

        {/* ChevronUp — rotates to down when panel is open */}
        <ChevronUp
          size={14}
          className={`text-[#555] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  );
}
