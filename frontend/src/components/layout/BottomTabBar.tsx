import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wrench, ShoppingBag, Bot, User } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

// Master Plan §8.2 — 5 items: Dashboard, Tools, Market, AI, Profile
const tabs = [
  { to: '/dashboard', icon: <LayoutDashboard size={22} />, label: 'DASHBOARD' },
  { to: '/dashboard/calculator/dosing', icon: <Wrench size={22} />, label: 'TOOLS' },
  { to: '/dashboard/market', icon: <ShoppingBag size={22} />, label: 'MARKET' },
  { label: 'AI', icon: <Bot size={22} />, isChat: true },
  { to: '/dashboard/profile', icon: <User size={22} />, label: 'PROFILE' },
];

export default function BottomTabBar() {
  const toggleChat = useUIStore((s) => s.toggleChat);

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50
        bg-black border-t border-[rgba(255,255,255,0.08)]
        flex items-stretch h-16
      "
    >
      {tabs.map((tab) => {
        if (tab.isChat) {
          return (
            <button
              key="ai"
              onClick={toggleChat}
              className="
                flex-1 flex flex-col items-center justify-center gap-1
                text-[#666] hover:text-white transition-colors duration-150 cursor-pointer
              "
            >
              {tab.icon}
              <span className="text-[9px] font-mono tracking-wider">{tab.label}</span>
            </button>
          );
        }

        return (
          <NavLink
            key={tab.to}
            to={tab.to!}
            end={tab.to === '/dashboard'}
            className={({ isActive }) =>
              [
                'flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-150',
                isActive ? 'text-[#59D3FF]' : 'text-[#666] hover:text-white',
              ].join(' ')
            }
          >
            {tab.icon}
            <span className="text-[9px] font-mono tracking-wider">{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
