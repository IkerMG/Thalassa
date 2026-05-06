import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FlaskConical, Zap, ShoppingBag, Heart, User, Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../../store/uiStore';

export default function BottomTabBar() {
  const { t } = useTranslation('nav');
  const isChatOpen = useUIStore((s) => s.isChatOpen);
  const openChat = useUIStore((s) => s.openChat);

  const tabs = [
    { to: '/dashboard',                       icon: <LayoutDashboard size={20} />, label: t('dashboard'), end: true },
    { to: '/dashboard/calculator/dosing',     icon: <FlaskConical size={20} />,    label: t('dosingCalc') },
    { to: '/dashboard/calculator/energy',     icon: <Zap size={20} />,             label: t('energyCalc') },
    { to: '/dashboard/market',                icon: <ShoppingBag size={20} />,     label: t('market') },
    { to: '/dashboard/wishlist',              icon: <Heart size={20} />,           label: t('wishlist') },
    { to: '/dashboard/profile',               icon: <User size={20} />,            label: t('profile') },
  ];

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50
        bg-black border-t border-[rgba(255,255,255,0.08)]
        flex items-stretch h-16
        overflow-x-auto scrollbar-none
      "
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            [
              'flex-1 min-w-[52px] flex flex-col items-center justify-center gap-0.5 transition-colors duration-150',
              isActive ? 'text-[#59D3FF]' : 'text-[#666] hover:text-white',
            ].join(' ')
          }
        >
          {tab.icon}
          <span className="text-[8px] font-mono tracking-wider uppercase leading-tight text-center px-0.5">
            {tab.label}
          </span>
        </NavLink>
      ))}

      {/* AI tab — opens drawer, not a route */}
      <button
        onClick={openChat}
        className={[
          'flex-1 min-w-[52px] flex flex-col items-center justify-center gap-0.5 transition-colors duration-150 cursor-pointer',
          isChatOpen ? 'text-[#59D3FF]' : 'text-[#666] hover:text-white',
        ].join(' ')}
        aria-label="Abrir asistente IA"
      >
        <Bot size={20} />
        <span className="text-[8px] font-mono tracking-wider uppercase leading-tight">AI</span>
      </button>
    </nav>
  );
}
