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
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  isPro?: boolean;
}

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const plan = useAuthStore((s) => s.user?.plan ?? 'FREE');

  const navItems: NavItem[] = [
    { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/dashboard/calculator/dosing', icon: <FlaskConical size={18} />, label: 'Dosing Calc', isPro: plan === 'FREE' },
    { to: '/dashboard/calculator/energy', icon: <Zap size={18} />, label: 'Energy Calc', isPro: plan === 'FREE' },
    { to: '/dashboard/market', icon: <ShoppingBag size={18} />, label: 'Market' },
    { to: '/dashboard/wishlist', icon: <Heart size={18} />, label: 'Wishlist' },
    { to: '/dashboard/chat', icon: <Bot size={18} />, label: 'AI Assistant' },
  ];

  const handleLogout = () => {
    logout();
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
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[rgba(255,255,255,0.08)]">
        <span className="text-lg font-bold tracking-widest text-white">THALASSA</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm relative',
                isActive
                  ? 'text-[#59D3FF] bg-[rgba(89,211,255,0.08)] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r before:bg-[#59D3FF]'
                  : 'text-[#A0A0A0] hover:text-white hover:bg-[rgba(255,255,255,0.04)]',
              ].join(' ')
            }
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {item.isPro && (
              <span className="text-[10px] font-mono text-[#59D3FF] border border-[rgba(89,211,255,0.30)] rounded px-1">
                PRO
              </span>
            )}
          </NavLink>
        ))}

        <div className="my-3 border-t border-[rgba(255,255,255,0.06)]" />

        <NavLink
          to="/dashboard/profile"
          className={({ isActive }) =>
            [
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm',
              isActive
                ? 'text-[#59D3FF] bg-[rgba(89,211,255,0.08)]'
                : 'text-[#A0A0A0] hover:text-white hover:bg-[rgba(255,255,255,0.04)]',
            ].join(' ')
          }
        >
          <User size={18} />
          <span>Profile</span>
        </NavLink>
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
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
