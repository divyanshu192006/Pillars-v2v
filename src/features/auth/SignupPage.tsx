import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { SignUp } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/common/Logo';
import { useAuth, getDashboardPath } from '@/contexts/AuthContext';
import { useAuthRedirect } from '@/components/auth/ClerkAuthSync';
import { isClerkConfigured, clerkAppearance } from '@/lib/clerk';
import type { UserRole } from '@/types';

const ROLES: { id: UserRole; emoji: string; label: string; desc: string }[] = [
  { id: 'woman',    emoji: '🤰', label: 'Pregnant Woman',   desc: 'Track my health & pregnancy journey' },
  { id: 'asha',     emoji: '👩‍⚕️', label: 'ASHA Worker',     desc: 'Manage my village pregnancy cases' },
  { id: 'family',   emoji: '👨‍👩‍👧', label: 'Family Member',   desc: "Monitor my family member's health" },
  { id: 'phc',      emoji: '🏥', label: 'PHC / Doctor',     desc: 'Clinical reports & analytics' },
  { id: 'district', emoji: '📊', label: 'District Officer',  desc: 'Population health monitoring' },
];

// ── Demo sign-up flow ──────────────────────────────────────────────────────────
function DemoSignupFlow() {
  const [done, setDone] = useState<UserRole | null>(null);
  const { loginDemo } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (r: UserRole) => {
    loginDemo(r);
    setDone(r);
    setTimeout(() => navigate(getDashboardPath(r)), 1600);
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl"
        >
          <CheckCircle className="h-10 w-10 text-white" />
        </motion.div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Welcome to MaaRaksha!</h3>
          <p className="text-sm text-gray-500 mt-1">Entering as {ROLES.find(r => r.id === done)?.label}…</p>
        </div>
        <div className="flex justify-center gap-1">
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="h-2 w-2 rounded-full bg-primary-400"
              animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
      <p className="text-sm font-semibold text-gray-700 mb-4">I am a:</p>
      {ROLES.map(r => (
        <motion.button key={r.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          onClick={() => handleRoleSelect(r.id)}
          className="w-full flex items-center gap-4 rounded-2xl border border-gray-100 p-4 text-left hover:border-primary-200 hover:bg-primary-50 transition-all group"
        >
          <span className="text-2xl">{r.emoji}</span>
          <div className="flex-1">
            <p className="font-semibold text-gray-800 text-sm">{r.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
        </motion.button>
      ))}
      <p className="text-center text-xs text-gray-400 pt-2">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
      </p>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SignupPage() {
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
            Join MaaRaksha,<br />
            <span className="gradient-text">protect every journey</span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-gray-600">
            Create your account in seconds. Get AI-powered maternal health monitoring tailored to your role.
          </p>
          <div className="mt-10 grid gap-3">
            {ROLES.map(r => (
              <div key={r.id} className="flex items-center gap-3 rounded-2xl bg-white/60 p-3 backdrop-blur-sm">
                <span className="text-xl">{r.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{r.label}</p>
                  <p className="text-xs text-gray-500">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right signup panel */}
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
            <h1 className="font-display text-3xl font-bold text-gray-900">Create account</h1>
            <p className="mt-2 text-gray-500">Start your maternal health journey today</p>

            <div className="mt-8">
              {isClerkConfigured ? (
                /* Clerk: Email/Password + Google + Phone */
                <SignUp
                  routing="hash"
                  appearance={clerkAppearance}
                  signInUrl="/login"
                  fallbackRedirectUrl="/onboarding"
                  forceRedirectUrl="/onboarding"
                />
              ) : (
                /* Demo mode */
                <div className="space-y-4">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <p className="font-semibold">Demo mode — select your role</p>
                    <p className="mt-1 text-xs">
                      Add <code className="rounded bg-amber-100 px-1">VITE_CLERK_PUBLISHABLE_KEY</code> in{' '}
                      <code className="rounded bg-amber-100 px-1">.env.local</code> to enable real sign-up.
                    </p>
                  </div>
                  <DemoSignupFlow />
                </div>
              )}

              <p className="mt-6 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">Sign in</Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
