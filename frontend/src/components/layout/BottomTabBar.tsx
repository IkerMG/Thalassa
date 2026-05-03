import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wrench, ShoppingBag, Bot, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../../store/uiStore';

export default function BottomTabBar() {
  const { t } = useTranslation('nav');
  const isChatOpen = useUIStore((s) => s.isChatOpen);
  const openChat = useUIStore((s) => s.openChat);

  const tabs = [
    { to: '/dashboard', icon: <LayoutDashboard size={22} />, label: t('dashboard') },
    { to: '/dashboard/calculator/dosing', icon: <Wrench size={22} />, label: t('tools') },
    { to: '/dashboard/market', icon: <ShoppingBag size={22} />, label: t('market') },
    { to: '/dashboard/profile', icon: <User size={22} />, label: t('profile') },
  ];

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50
        bg-black border-t border-[rgba(255,255,255,0.08)]
        flex items-stretch h-16
      "
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/dashboard'}
          className={({ isActive }) =>
            [
              'flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-150',
              isActive ? 'text-[#59D3FF]' : 'text-[#666] hover:text-white',
            ].join(' ')
          }
        >
          {tab.icon}
          <span className="text-[9px] font-mono tracking-wider uppercase">{tab.label}</span>
        </NavLink>
      ))}

      {/* AI tab — opens drawer, not a route */}
      <button
        onClick={openChat}
        className={[
          'flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-150 cursor-pointer',
          isChatOpen ? 'text-[#59D3FF]' : 'text-[#666] hover:text-white',
        ].join(' ')}
        aria-label="Abrir asistente IA"
      >
        <Bot size={22} />
        <span className="text-[9px] font-mono tracking-wider">AI</span>
      </button>
    </nav>
  );
}
