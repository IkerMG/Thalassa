import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FlaskConical,
  Zap,
  ShoppingBag,
  Heart,
  Bot,
  User,
  LogOut,
  Settings,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import NotificationBell from '../shared/NotificationBell';

// ── Helpers ───────────────────────────────────────────────────────────────────

function NavSection({ label }: { label: string }) {
  return (
    <p className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-widest text-[#383838] uppercase select-none">
      {label}
    </p>
  );
}

function navLinkClass(isActive: boolean, withIndicator = true) {
  return [
    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm relative',
    isActive
      ? [
          'text-[#59D3FF] bg-[rgba(89,211,255,0.08)]',
          withIndicator
            ? 'before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r before:bg-[#59D3FF]'
            : '',
        ].join(' ')
      : 'text-[#A0A0A0] hover:text-white hover:bg-[rgba(255,255,255,0.04)]',
  ].join(' ');
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { t } = useTranslation('nav');
  const navigate = useNavigate();
  const { logout } = useAuth();
  const plan = useAuthStore((s) => s.user?.plan ?? 'FREE');
  const isChatOpen = useUIStore((s) => s.isChatOpen);
  const openChat = useUIStore((s) => s.openChat);
  const isPro = plan !== 'FREE';

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <aside
      className="
        w-[260px] shrink-0 h-screen sticky top-0
        bg-black border-r border-[rgba(255,255,255,0.08)]
        flex flex-col
      "
    >
      {/* Logo + NotificationBell */}
      <div className="px-6 py-5 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between">
        <span className="text-lg font-bold tracking-widest text-white">THALASSA</span>
        <NotificationBell />
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">

        {/* ── INICIO ── */}
        <NavSection label={t('sectionHome')} />
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) => navLinkClass(isActive)}
        >
          <LayoutDashboard size={18} />
          <span className="flex-1">{t('dashboard')}</span>
        </NavLink>

        {/* ── HERRAMIENTAS ── */}
        <div className="mt-3">
          <NavSection label={t('sectionTools')} />
          <NavLink
            to="/dashboard/calculator/dosing"
            className={({ isActive }) => navLinkClass(isActive)}
          >
            <FlaskConical size={18} />
            <span className="flex-1">{t('dosingCalc')}</span>
            {!isPro && (
              <span className="text-[10px] font-mono text-[#59D3FF] border border-[rgba(89,211,255,0.30)] rounded px-1">
                PRO
              </span>
            )}
          </NavLink>
          <NavLink
            to="/dashboard/calculator/energy"
            className={({ isActive }) => navLinkClass(isActive)}
          >
            <Zap size={18} />
            <span className="flex-1">{t('energyCalc')}</span>
            {!isPro && (
              <span className="text-[10px] font-mono text-[#59D3FF] border border-[rgba(89,211,255,0.30)] rounded px-1">
                PRO
              </span>
            )}
          </NavLink>
          <button
            onClick={openChat}
            className={[
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm relative cursor-pointer',
              isChatOpen
                ? 'text-[#59D3FF] bg-[rgba(89,211,255,0.08)] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r before:bg-[#59D3FF]'
                : 'text-[#A0A0A0] hover:text-white hover:bg-[rgba(255,255,255,0.04)]',
            ].join(' ')}
          >
            <Bot size={18} />
            <span className="flex-1">{t('aiAssistant')}</span>
          </button>
        </div>

        {/* ── EXPLORAR ── */}
        <div className="mt-3">
          <NavSection label={t('sectionExplore')} />
          <NavLink
            to="/dashboard/market"
            className={({ isActive }) => navLinkClass(isActive)}
          >
            <ShoppingBag size={18} />
            <span className="flex-1">{t('market')}</span>
          </NavLink>
          <NavLink
            to="/dashboard/wishlist"
            className={({ isActive }) => navLinkClass(isActive)}
          >
            <Heart size={18} />
            <span className="flex-1">{t('wishlist')}</span>
          </NavLink>
        </div>

        {/* ── CONFIGURACIÓN ── */}
        <div className="mt-3">
          <NavSection label={t('sectionConfig')} />
          <NavLink
            to="/dashboard/profile"
            end
            className={({ isActive }) => navLinkClass(isActive)}
          >
            <User size={18} />
            <span className="flex-1">{t('profile')}</span>
          </NavLink>
          <NavLink
            to="/dashboard/profile/settings"
            className={({ isActive }) => navLinkClass(isActive)}
          >
            <Settings size={18} />
            <span className="flex-1">{t('settings')}</span>
          </NavLink>
        </div>
      </nav>

      {/* Logout at bottom */}
      <div className="px-3 py-4 border-t border-[rgba(255,255,255,0.08)]">
        <button
          onClick={handleLogout}
          className="
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-[#666] hover:text-[#F87171] hover:bg-[rgba(248,113,113,0.06)]
            transition-all duration-150 text-sm cursor-pointer
          "
        >
          <LogOut size={18} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}
