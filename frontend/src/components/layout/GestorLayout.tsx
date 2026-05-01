import { Outlet } from 'react-router-dom';
import { useIsDesktop } from '../../hooks/useMediaQuery';
import Sidebar from './Sidebar';
import BottomTabBar from './BottomTabBar';
import ChatDrawer from '../../features/chat/ChatDrawer';

export default function GestorLayout() {
  const isDesktop = useIsDesktop();

  return (
    <div className="min-h-screen bg-black text-white flex">
      {isDesktop && <Sidebar />}

      {/* Main content area */}
      <main
        id="main-content"
        className={[
          'flex-1 overflow-auto',
          isDesktop ? '' : 'pb-16',
        ].join(' ')}
      >
        <Outlet />
      </main>

      {!isDesktop && <BottomTabBar />}

      {/* Chat drawer — always mounted so history persists across navigation */}
      <ChatDrawer />
    </div>
  );
}
