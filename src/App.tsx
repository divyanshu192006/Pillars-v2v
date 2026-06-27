import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import { useAuth, getDashboardPath } from '@/contexts/AuthContext';
import { ClerkAuthSync } from '@/components/auth/ClerkAuthSync';
import { isClerkConfigured } from '@/lib/clerk';
import type { UserRole } from '@/types';
import SplashScreen from '@/features/landing/SplashScreen';
import LandingPage from '@/features/landing/LandingPage';
import LoginPage from '@/features/auth/LoginPage';
import SignupPage from '@/features/auth/SignupPage';
import OnboardingPage from '@/features/auth/OnboardingPage';
import WomanDashboard from '@/features/woman/WomanDashboard';
import AshaDashboard from '@/features/asha/AshaDashboard';
import FamilyDashboard from '@/features/family/FamilyDashboard';
import PhcDashboard from '@/features/phc/PhcDashboard';
import DistrictDashboard from '@/features/district/DistrictDashboard';
import { Loader2 } from 'lucide-react';

// Handles OAuth redirect (Google Sign-In callback)
function SsoCallback() {
  if (isClerkConfigured) {
    return <AuthenticateWithRedirectCallback />;
  }
  return <Navigate to="/login" replace />;
}

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: UserRole[] }) {
  const { user, loading, needsOnboarding } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (needsOnboarding) return <Navigate to="/onboarding" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={getDashboardPath(user.role)} replace />;

  return <>{children}</>;
}

export default function App() {
  return (
    <ClerkAuthSync>
      <Routes>
        {/* Pre-dashboard */}
        <Route path="/"           element={<SplashScreen />} />
        <Route path="/landing"    element={<LandingPage />} />
        <Route path="/login"      element={<LoginPage />} />
        <Route path="/signup"     element={<SignupPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Clerk Google OAuth callback */}
        <Route path="/sso-callback" element={<SsoCallback />} />

        {/* Protected dashboards */}
        <Route path="/dashboard/woman/*"    element={<ProtectedRoute roles={['woman']}><WomanDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/asha/*"     element={<ProtectedRoute roles={['asha']}><AshaDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/family/*"   element={<ProtectedRoute roles={['family']}><FamilyDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/phc/*"      element={<ProtectedRoute roles={['phc']}><PhcDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/district/*" element={<ProtectedRoute roles={['district']}><DistrictDashboard /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ClerkAuthSync>
  );
}
