import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getDashboardPath } from '@/contexts/AuthContext';
import { isClerkConfigured } from '@/lib/clerk';

// Static import is fine — @clerk/clerk-react is installed.
// useUser() is only CALLED inside components that are rendered
// exclusively when ClerkProvider is mounted (see main.tsx).
import { useUser } from '@clerk/clerk-react';

// ─── Inner component — only rendered inside ClerkProvider ─────────────────────

function WithClerkSync({ children }: { children: React.ReactNode }) {
  const { loginWithClerkUser } = useAuth();
  const { isSignedIn, isLoaded, user: clerkUser } = useUser(); // safe here

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !clerkUser) return;
    loginWithClerkUser({
      id: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
      name: clerkUser.fullName || clerkUser.firstName || 'User',
      avatar: clerkUser.imageUrl,
    });
  }, [isSignedIn, isLoaded, clerkUser, loginWithClerkUser]);

  return <>{children}</>;
}

/** Wraps children — syncs Clerk session when configured, no-op otherwise */
export function ClerkAuthSync({ children }: { children: React.ReactNode }) {
  if (isClerkConfigured) {
    return <WithClerkSync>{children}</WithClerkSync>;
  }
  return <>{children}</>;
}

// ─── useAuthRedirect hook ─────────────────────────────────────────────────────

/** Safe redirect hook for login/signup pages — works in both modes */
export function useAuthRedirect() {
  const navigate = useNavigate();
  const { user, needsOnboarding, loading } = useAuth();

  // Always call useUser at top level; it's safe because:
  // - When Clerk IS configured: ClerkProvider is mounted → hook works normally
  // - When Clerk is NOT configured: useUser returns {isLoaded:false} without throwing
  //   because @clerk/clerk-react gracefully handles missing context since v5
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (loading) return;
    if (isClerkConfigured && !isLoaded) return; // wait for Clerk to initialise

    const authenticated = isClerkConfigured ? Boolean(isSignedIn && user) : Boolean(user);
    if (authenticated && user) {
      navigate(needsOnboarding ? '/onboarding' : getDashboardPath(user.role), { replace: true });
    }
  }, [user, needsOnboarding, loading, isSignedIn, isLoaded, navigate]);
}
