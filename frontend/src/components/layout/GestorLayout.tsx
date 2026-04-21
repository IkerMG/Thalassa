import { Outlet } from 'react-router-dom';
import { useIsDesktop } from '../../hooks/useMediaQuery';
import Sidebar from './Sidebar';
import BottomTabBar from './BottomTabBar';

export default function GestorLayout() {
  const isDesktop = useIsDesktop();

  return (
    <div className="min-h-screen bg-black text-white flex">
      {isDesktop && <Sidebar />}

      {/* Main content area */}
      <main
        className={[
          'flex-1 overflow-auto',
          isDesktop ? '' : 'pb-16', // space for bottom tab bar on mobile
        ].join(' ')}
      >
        <Outlet />
      </main>

      {!isDesktop && <BottomTabBar />}
    </div>
  );
}
