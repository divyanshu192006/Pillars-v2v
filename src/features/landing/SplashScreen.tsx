import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, getDashboardPath } from '@/contexts/AuthContext';
import { Shield, Heart, Wifi } from 'lucide-react';

const SPLASH_DURATION = 10000;
const LOGO_SIZE = 150;

interface FlowLine {
  id: number;
  top: string;
  width: number;
}

function FlowingLines() {
  const [lines, setLines] = useState<FlowLine[]>([]);

  const spawn = useCallback(() => {
    const positions = ['4%', '8%', '12%'];
    setLines(prev => [
      ...prev,
      { id: Date.now() + Math.random(), top: positions[Math.floor(Math.random() * positions.length)], width: 60 + Math.random() * 100 },
    ].slice(-4));
  }, []);

  useEffect(() => {
    spawn();
    const interval = setInterval(spawn, 900);
    return () => clearInterval(interval);
  }, [spawn]);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[30vh] overflow-hidden">
      <AnimatePresence>
        {lines.map(line => (
          <motion.div
            key={line.id}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0, 0.7, 0] }}
            transition={{ duration: 2 }}
            className="absolute left-1/2 h-px origin-center -translate-x-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent"
            style={{ top: line.top, width: line.width }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function SplashScreen() {
  const navigate = useNavigate();
  const { user, needsOnboarding } = useAuth();
  const [progress, setProgress] = useState(0);
  const [showTitle, setShowTitle] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowTitle(true), 1400);
    const t2 = setTimeout(() => setShowTagline(true), 2800);
    const t3 = setTimeout(() => setShowDescription(true), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setProgress(Math.min(((Date.now() - start) / SPLASH_DURATION) * 100, 100));
    }, 50);
    const timeout = setTimeout(() => {
      if (user) {
        navigate(needsOnboarding ? '/onboarding' : getDashboardPath(user.role), { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }, SPLASH_DURATION);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [navigate, user, needsOnboarding]);

  const handleSkip = () => {
    if (user) {
      navigate(needsOnboarding ? '/onboarding' : getDashboardPath(user.role), { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary-700/30 via-transparent to-primary-300/20" />
      <FlowingLines />

      {/* Glow — fixed behind logo area, never moves */}
      <motion.div
        animate={{ opacity: [0.35, 0.85, 0.35], scale: [0.95, 1.1, 0.95] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute left-1/2 top-[22vh] z-0 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 blur-3xl"
      />
      <motion.div
        animate={{ opacity: [0.2, 0.55, 0.2], scale: [1, 1.15, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        className="pointer-events-none absolute left-1/2 top-[22vh] z-0 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 blur-2xl"
      />

      {/* Logo — pinned position */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-1/2 top-[14vh] z-20 -translate-x-1/2"
        style={{ width: LOGO_SIZE + 40, height: LOGO_SIZE + 40 }}
      >
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${LOGO_SIZE + 40} ${LOGO_SIZE + 40}`}>
          <motion.circle
            cx={(LOGO_SIZE + 40) / 2} cy={(LOGO_SIZE + 40) / 2} r={LOGO_SIZE / 2 + 14}
            fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeDasharray="4 6"
            animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
          <motion.circle
            cx={(LOGO_SIZE + 40) / 2} cy={(LOGO_SIZE + 40) / 2} r={LOGO_SIZE / 2 + 6}
            fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2"
            animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0.8] }}
            transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 3.5 }}
          />
        </svg>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={{
              boxShadow: [
                '0 0 30px 10px rgba(255,255,255,0.5), 0 0 60px 25px rgba(255,255,255,0.25)',
                '0 0 45px 15px rgba(255,255,255,0.85), 0 0 90px 35px rgba(255,255,255,0.45)',
                '0 0 30px 10px rgba(255,255,255,0.5), 0 0 60px 25px rgba(255,255,255,0.25)',
              ],
            }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-full"
            style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
          >
            <img
              src="/logo.png"
              alt="MaaRaksha"
              className="h-full w-full rounded-full object-cover ring-4 ring-white/90 brightness-110"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* MaaRaksha — pinned position, opacity only (no layout shift) */}
      <div className="absolute left-1/2 top-[42vh] z-20 w-full -translate-x-1/2 px-6 text-center">
        <motion.h1
          animate={showTitle ? {
            opacity: 1,
            textShadow: [
              '0 0 20px rgba(255,255,255,0.3)',
              '0 0 40px rgba(255,255,255,0.7)',
              '0 0 20px rgba(255,255,255,0.3)',
            ],
          } : { opacity: 0 }}
          transition={{ opacity: { duration: 0.9 }, textShadow: { duration: 1.4, repeat: Infinity } }}
          className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl"
        >
          MaaRaksha
        </motion.h1>
        <div className="mt-3 flex items-center justify-center gap-3">
          <motion.div
            animate={showTitle ? { scaleX: [0, 1, 1, 0], opacity: [0, 1, 1, 0] } : { scaleX: 0, opacity: 0 }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="h-px w-12 origin-center bg-gradient-to-r from-transparent to-white/90 sm:w-16"
          />
          <motion.div
            animate={showTitle ? { scale: [0.8, 1.2, 0.8] } : { scale: 0 }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="h-1.5 w-1.5 rounded-full bg-white"
          />
          <motion.div
            animate={showTitle ? { scaleX: [0, 1, 1, 0], opacity: [0, 1, 1, 0] } : { scaleX: 0, opacity: 0 }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.2 }}
            className="h-px w-12 origin-center bg-gradient-to-l from-transparent to-white/90 sm:w-16"
          />
        </div>
      </div>

      {/* Bottom text — pinned box, fixed height, opacity fade only */}
      <div className="absolute bottom-[68px] left-0 right-0 z-10 h-[30vh] px-6 text-center">
        <motion.p
          animate={{ opacity: showTagline ? 1 : 0 }}
          transition={{ duration: 0.8 }}
          className="text-xs font-medium uppercase tracking-[0.2em] text-white/85 sm:text-sm"
        >
          AI-Powered Maternal Health Network
        </motion.p>

        <motion.div
          animate={{ opacity: showDescription ? 1 : 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto mt-3 max-w-sm space-y-3 sm:max-w-md"
        >
          <motion.div
            animate={showDescription ? { scaleX: [0, 1, 1, 0], opacity: [0, 0.7, 0.7, 0] } : {}}
            transition={{ duration: 3, repeat: Infinity }}
            className="mx-auto h-px w-36 origin-center bg-gradient-to-r from-transparent via-white/60 to-transparent sm:w-48"
          />
          <p className="text-sm leading-relaxed text-white/85 sm:text-base">
            Protecting every mother&apos;s journey through early detection, voice reporting, and intelligent risk assessment.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { icon: Heart, label: 'Care & Compassion' },
              { icon: Shield, label: 'Smart Protection' },
              { icon: Wifi, label: 'Connected Health' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5 text-white" />
                <span className="text-[11px] font-semibold text-white sm:text-xs">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Progress bar — pinned bottom */}
      <div className="absolute bottom-4 left-1/2 z-20 w-full max-w-xs -translate-x-1/2 px-6">
        <div className="h-1 overflow-hidden rounded-full bg-white/25">
          <motion.div
            className="h-full rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <button
          onClick={handleSkip}
          className="mt-3 w-full text-center text-sm text-white/70 transition-colors hover:text-white"
        >
          Tap to continue
        </button>
      </div>
    </div>
  );
}
