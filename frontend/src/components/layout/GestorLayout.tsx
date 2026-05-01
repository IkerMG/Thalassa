import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useIsDesktop } from '../../hooks/useMediaQuery';
import Sidebar from './Sidebar';
import BottomTabBar from './BottomTabBar';
import ChatDrawer from '../../features/chat/ChatDrawer';

export default function GestorLayout() {
  const isDesktop = useIsDesktop();
  const location = useLocation();

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
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {!isDesktop && <BottomTabBar />}

      {/* Chat drawer — always mounted so history persists across navigation */}
      <ChatDrawer />
    </div>
  );
}
