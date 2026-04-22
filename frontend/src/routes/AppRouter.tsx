import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Public pages — loaded immediately (landing needs fast paint)
import LandingPage from '../features/landing/LandingPage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';

// Protected pages — lazy loaded (reduces initial bundle)
const DashboardView = lazy(() => import('../features/dashboard/DashboardView'));
const AquariumDetailPage = lazy(() => import('../features/aquarium-detail/AquariumDetailPage'));
const ChatView = lazy(() => import('../features/chat/ChatView'));
const MarketPage = lazy(() => import('../features/market/MarketPage'));
const WishlistPage = lazy(() => import('../features/wishlist/WishlistPage'));
const ProfilePage = lazy(() => import('../features/profile/ProfilePage'));
const DosingCalcPage = lazy(() => import('../features/calculators/DosingCalcPage'));
const EnergyCalcPage = lazy(() => import('../features/calculators/EnergyCalcPage'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#59D3FF] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public routes (redirect to /dashboard if already logged in) ── */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* ── Protected routes (redirect to /login if not authenticated) ── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/dashboard/aquarium/:id" element={<AquariumDetailPage />} />
            <Route path="/dashboard/chat" element={<ChatView />} />
            <Route path="/dashboard/market" element={<MarketPage />} />
            <Route path="/dashboard/wishlist" element={<WishlistPage />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />
            <Route path="/dashboard/calculator/dosing" element={<DosingCalcPage />} />
            <Route path="/dashboard/calculator/energy" element={<EnergyCalcPage />} />
          </Route>

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
