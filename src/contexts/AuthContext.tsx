import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User, UserRole, Language } from '@/types';
import { DEMO_USERS } from '@/lib/demo-data';
import { isFirebaseConfigured, auth } from '@/lib/firebase';
import { isClerkConfigured } from '@/lib/clerk';
import { signInWithEmailAndPassword, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import i18n from '@/lib/i18n';

// ─── Onboarding / Clerk types ────────────────────────────────────────────────

export interface ClerkUserData {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface OnboardingData {
  name: string;
  age: number;
  gestationalMonth: number;
  weight: number;
  symptoms: string[];
  additionalInfo: string;
  previousReports: string;
}

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDemo: boolean;
  needsOnboarding: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginDemo: (role: UserRole) => void;
  loginWithClerkUser: (clerkUser: ClerkUserData) => void;
  completeOnboarding: (profile: OnboardingData) => void;
  logout: () => Promise<void>;
  setLanguage: (lang: Language) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_PASSWORD = 'demo123';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function gestationalWeekFromMonth(month: number): number {
  return Math.min(month * 4, 40);
}

function trimesterFromWeek(week: number): 1 | 2 | 3 {
  if (week <= 13) return 1;
  if (week <= 27) return 2;
  return 3;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // isDemo = true only when neither Clerk nor Firebase is configured
  const [isDemo, setIsDemo] = useState(!isFirebaseConfigured && !isClerkConfigured);

  useEffect(() => {
    // Restore persisted session
    const saved = localStorage.getItem('maaraksha_user');
    if (saved) {
      const parsedUser: User = JSON.parse(saved);
      setUser(parsedUser);
      setIsDemo(localStorage.getItem('maaraksha_demo') === 'true');
      if (parsedUser.language) {
        localStorage.setItem('maaraksha_lang', parsedUser.language);
        i18n.changeLanguage(parsedUser.language);
      }
    }

    // When Clerk is configured it manages its own session —
    // ClerkAuthSync handles calling loginWithClerkUser after Clerk loads.
    if (!isClerkConfigured) {
      setLoading(false);

      if (isFirebaseConfigured && auth) {
        return onAuthStateChanged(auth, (fbUser) => {
          if (fbUser) {
            const demoUser = DEMO_USERS.find(u => u.email === fbUser.email);
            if (demoUser) persistUser(demoUser, true);
          }
          setLoading(false);
        });
      }
    } else {
      // Clerk will call loginWithClerkUser once its session loads
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const persistUser = (u: User | null, demo: boolean) => {
    if (u) {
      localStorage.setItem('maaraksha_user', JSON.stringify(u));
      localStorage.setItem('maaraksha_demo', String(demo));
    } else {
      localStorage.removeItem('maaraksha_user');
      localStorage.removeItem('maaraksha_demo');
    }
    setUser(u);
    setIsDemo(demo);
  };

  // ── Demo / Firebase login (used when Clerk is NOT configured) ──────────────
  const login = useCallback(async (email: string, password: string) => {
    const demoUser = DEMO_USERS.find(u => u.email === email);
    if (password === DEMO_PASSWORD && demoUser) {
      persistUser({ ...demoUser, onboardingComplete: true }, true);
      return;
    }
    if (isFirebaseConfigured && auth) {
      await signInWithEmailAndPassword(auth, email, password);
      return;
    }
    throw new Error('Invalid credentials. Use demo accounts with password: demo123');
  }, []);

  const loginDemo = useCallback((role: UserRole) => {
    const demoUser = DEMO_USERS.find(u => u.role === role);
    if (demoUser) persistUser({ ...demoUser, onboardingComplete: true }, true);
  }, []);

  // ── Clerk login (called by ClerkAuthSync once Clerk session loads) ─────────
  const loginWithClerkUser = useCallback((clerkUser: ClerkUserData) => {
    // If we already have this exact user persisted, just restore it
    const existing = localStorage.getItem('maaraksha_user');
    if (existing) {
      const parsed: User = JSON.parse(existing);
      if (parsed.id === clerkUser.id) {
        setUser(parsed);
        setIsDemo(false);
        return;
      }
    }

    // New Clerk user — create a MaaRaksha user record
    // Default role is 'woman'; role selection can be added to onboarding if needed
    const newUser: User = {
      id: clerkUser.id,
      email: clerkUser.email,
      name: clerkUser.name || 'New User',
      role: 'woman',
      avatar: clerkUser.avatar,
      language: (localStorage.getItem('maaraksha_lang') as Language) || 'en',
      villageId: 'v1',
      districtId: 'd1',
      linkedPregnancyId: `p-${clerkUser.id}`,
      createdAt: new Date().toISOString(),
      onboardingComplete: false,
    };
    persistUser(newUser, false);
  }, []);

  // ── Onboarding completion ──────────────────────────────────────────────────
  const completeOnboarding = useCallback((profile: OnboardingData) => {
    if (!user) return;
    const week = gestationalWeekFromMonth(profile.gestationalMonth);
    const updated: User = {
      ...user,
      name: profile.name,
      age: profile.age,
      weight: profile.weight,
      gestationalMonth: profile.gestationalMonth,
      gestationalWeek: week,
      symptoms: profile.symptoms,
      additionalInfo: profile.additionalInfo,
      previousReports: profile.previousReports,
      onboardingComplete: true,
    };
    persistUser(updated, isDemo);

    const pregnancyProfile = {
      userId: user.id,
      name: profile.name,
      gestationalWeek: week,
      gestationalMonth: profile.gestationalMonth,
      trimester: trimesterFromWeek(week),
      weight: profile.weight,
      age: profile.age,
      pregnancyId: user.linkedPregnancyId || `p-${user.id}`,
    };
    localStorage.setItem('maaraksha_pregnancy_profile', JSON.stringify(pregnancyProfile));
    window.dispatchEvent(
      new CustomEvent('maaraksha:onboarding-complete', { detail: pregnancyProfile }),
    );
  }, [user, isDemo]);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    if (auth) await fbSignOut(auth).catch(() => {});
    persistUser(null, false);
    localStorage.removeItem('maaraksha_pregnancy_profile');
  }, []);

  // ── Language ───────────────────────────────────────────────────────────────
  const setLanguage = useCallback((lang: Language) => {
    if (user) persistUser({ ...user, language: lang }, isDemo);
    localStorage.setItem('maaraksha_lang', lang);
    i18n.changeLanguage(lang);
  }, [user, isDemo]);

  // needsOnboarding: only for real (non-demo) women who haven't completed onboarding
  const needsOnboarding = Boolean(
    user && user.role === 'woman' && !user.onboardingComplete && !isDemo,
  );

  return (
    <AuthContext.Provider value={{
      user, loading, isDemo, needsOnboarding,
      login, loginDemo, loginWithClerkUser, completeOnboarding, logout, setLanguage,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getDashboardPath(role: UserRole): string {
  const paths: Record<UserRole, string> = {
    woman: '/dashboard/woman',
    asha: '/dashboard/asha',
    family: '/dashboard/family',
    phc: '/dashboard/phc',
    district: '/dashboard/district',
  };
  return paths[role];
}
