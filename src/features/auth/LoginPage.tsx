import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SignIn } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/common/Logo';
import { useAuth, getDashboardPath } from '@/contexts/AuthContext';
import { useAuthRedirect } from '@/components/auth/ClerkAuthSync';
import { DEMO_USERS } from '@/lib/demo-data';
import { isClerkConfigured, clerkAppearance } from '@/lib/clerk';
import type { UserRole } from '@/types';

const ROLE_EMOJIS: Record<UserRole, string> = {
  woman: '🤰', asha: '👩‍⚕️', family: '👨‍👩‍👧', phc: '🏥', district: '📊',
};

// ── Demo section (shown only when Clerk is NOT configured) ────────────────────
function DemoLoginSection() {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();
  const roles: UserRole[] = ['woman', 'asha', 'family', 'phc', 'district'];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const found = DEMO_USERS.find(u => u.email === email);
      navigate(found ? getDashboardPath(found.role) : '/dashboard/woman');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    loginDemo(role);
    navigate(getDashboardPath(role));
  };

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-center gap-2 text-sm text-gray-400 transition-colors hover:text-primary-600"
      >
        {t('login.orTryDemo')}
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
              <form onSubmit={handleLogin} className="space-y-3">
                <Input type="email" placeholder={t('login.emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} />
                <Input type="password" placeholder={t('login.passwordPlaceholder')} value={password} onChange={e => setPassword(e.target.value)} />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" variant="outline" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('login.signIn')}
                </Button>
              </form>
              <p className="text-center text-xs text-gray-400">
                Password for all demo accounts: <code className="rounded bg-gray-100 px-1">demo123</code>
              </p>
              <div className="space-y-2">
                {roles.map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleDemoLogin(role)}
                    className="flex w-full items-center gap-3 rounded-xl border border-white bg-white p-3 text-left transition-all hover:border-primary-200 hover:shadow-sm"
                  >
                    <span className="text-xl">{ROLE_EMOJIS[role]}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{t(`login.roles.${role}.label`)}</p>
                      <p className="text-xs text-gray-500">{t(`login.roles.${role}.desc`)}</p>
                    </div>
                    <Badge variant="outline">Demo</Badge>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { t } = useTranslation();
  useAuthRedirect();

  return (
    <div className="flex min-h-screen">
      {/* Left hero panel */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-center lg:px-16 xl:px-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-purple-50" />
        <div className="absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-primary-200/30 blur-3xl" />
        <div className="absolute -right-10 bottom-1/4 h-64 w-64 rounded-full bg-purple-200/30 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <Logo size="lg" />
          <h2 className="mt-10 font-display text-4xl font-bold leading-tight text-gray-900 xl:text-5xl">
            Your pregnancy,<br />
            <span className="gradient-text">supported every step</span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-gray-600">
            Track your health, report symptoms by voice, and get AI-powered risk assessments — all in one caring platform built for mothers.
          </p>
          <div className="mt-10 grid gap-4">
            {[
              { emoji: '💗', title: 'Personalized Care', desc: 'Tailored health insights for your pregnancy journey' },
              { emoji: '🔒', title: 'Private & Secure', desc: 'Your health data stays protected and confidential' },
              { emoji: '🩺', title: 'Doctor-Backed AI', desc: 'Intelligent risk detection you can trust' },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-4 rounded-2xl bg-white/60 p-4 backdrop-blur-sm">
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right login panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="absolute inset-0 -z-10 lg:hidden">
          <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-primary-200/20 blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 h-48 w-48 rounded-full bg-purple-200/20 blur-3xl" />
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <Logo size="md" className="mx-auto" />
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="font-display text-3xl font-bold text-gray-900">{t('login.welcome')}</h1>
            <p className="mt-2 text-gray-500">{t('login.subtitle')}</p>

            <div className="mt-8">
              {isClerkConfigured ? (
                /* Clerk: Email/Password + Google + Phone */
                <SignIn
                  routing="hash"
                  appearance={clerkAppearance}
                  signUpUrl="/signup"
                  fallbackRedirectUrl="/onboarding"
                  forceRedirectUrl="/onboarding"
                />
              ) : (
                /* Demo mode */
                <div className="space-y-4">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <p className="font-semibold">Clerk not configured</p>
                    <p className="mt-1 text-xs">
                      Add <code className="rounded bg-amber-100 px-1">VITE_CLERK_PUBLISHABLE_KEY</code> in{' '}
                      <code className="rounded bg-amber-100 px-1">.env.local</code> to enable real authentication.
                    </p>
                  </div>
                  <DemoLoginSection />
                </div>
              )}

              <p className="mt-6 text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700">
                  Create one
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
