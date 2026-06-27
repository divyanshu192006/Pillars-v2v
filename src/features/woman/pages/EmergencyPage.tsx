import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, MapPin, Phone, Zap, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import NearbyHospitalsPage from './NearbyHospitalsPage';

interface Props { defaultTab?: string; }

const TABS_FN = (t: (k: string) => string) => [
  { id: 'sos',       label: t('emergency.tabs.sos'),       icon: AlertTriangle },
  { id: 'hospitals', label: t('emergency.tabs.hospitals'), icon: MapPin },
];

function SosTab() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pregnancies, triggerSOS, alerts } = useData();
  const pregnancy = pregnancies.find(p => p.id === user?.linkedPregnancyId) || pregnancies[0];
  const [activated, setActivated] = useState(false);
  const myAlerts = alerts.filter(a => a.pregnancyId === pregnancy?.id).slice(0, 5);

  const handleSOS = () => {
    if (pregnancy) {
      triggerSOS(pregnancy.id);
      setActivated(true);
      setTimeout(() => setActivated(false), 5000);
    }
  };

  return (
    <div className="space-y-5">
      {/* Big SOS button */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-500 to-rose-600 p-8 text-white text-center">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <Heart className="h-64 w-64" />
        </div>
        <div className="relative space-y-4">
          <p className="text-sm font-semibold text-red-200 uppercase tracking-widest">{t('sos.emergency')}</p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleSOS}
            className={cn(
              'mx-auto flex h-36 w-36 flex-col items-center justify-center rounded-full shadow-2xl transition-all border-4',
              activated
                ? 'bg-white border-white shadow-white/50 animate-pulse'
                : 'bg-red-600 border-red-300 hover:bg-red-700'
            )}
          >
            {activated ? (
              <>
                <Zap className="h-12 w-12 text-red-500" />
                <span className="mt-1 text-xs font-bold text-red-500">{t('sos.sent')}</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-12 w-12 text-white" />
                <span className="mt-1 text-sm font-bold text-white">SOS</span>
              </>
            )}
          </motion.button>
          <p className="text-sm text-red-100">
            {activated ? t('sos.alertSent') : t('sos.tapToSend')}
          </p>
        </div>
      </motion.div>

      {/* Quick call buttons */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { num: '108', label: t('hospitals.ambulance'),        color: 'bg-red-500',     icon: '🚑' },
          { num: '104', label: t('hospitals.healthHelpline'),    color: 'bg-blue-500',    icon: '📞' },
          { num: '1800-180-1104', label: t('hospitals.nhmHelpline'), color: 'bg-emerald-500', icon: '🏥' },
          { num: '112', label: t('hospitals.emergencyServices'), color: 'bg-purple-500',  icon: '🆘' },
        ].map(({ num, label, color, icon }) => (
          <a key={num} href={`tel:${num}`}
            className={cn('flex items-center gap-3 rounded-2xl p-4 text-white shadow-md hover:opacity-90 transition-opacity', color)}>
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="font-bold text-sm">{num}</p>
              <p className="text-xs text-white/80">{label}</p>
            </div>
            <Phone className="h-4 w-4 ml-auto text-white/70" />
          </a>
        ))}
      </div>

      {/* Warning signs */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <p className="font-semibold text-amber-700 text-sm mb-3">{t('sos.goToHospital')}</p>
          <ul className="space-y-2">
            {(t('sos.warningSigns', { returnObjects: true }) as string[]).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                <span className="text-red-500 font-bold shrink-0">•</span>{s}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recent alerts */}
      {myAlerts.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-600">{t('sos.recentAlerts')}</p>
          {myAlerts.map(a => (
            <div key={a.id} className={cn('rounded-2xl border p-4', a.riskLevel === 'RED' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200')}>
              <div className="flex items-center justify-between mb-1">
                <span className={cn('text-xs font-bold', a.riskLevel === 'RED' ? 'text-red-700' : 'text-amber-700')}>{a.riskLevel} {t('sos.alert')}</span>
                <span className="text-[10px] text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-gray-600">{a.message.slice(0, 120)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EmergencyPage({ defaultTab }: Props) {
  const { t } = useTranslation();
  const TABS = TABS_FN(t);
  const [params] = useSearchParams();
  const initial = defaultTab || params.get('tab') || 'sos';
  const [tab, setTab] = useState(initial);

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-2xl p-1.5 flex gap-1">
        {TABS.map(tabItem => {
          const active = tab === tabItem.id;
          return (
            <button key={tabItem.id} onClick={() => setTab(tabItem.id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all',
                active
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}>
              <tabItem.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tabItem.label}</span>
              <span className="sm:hidden">{tabItem.id === 'sos' ? 'SOS' : 'Hospitals'}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
          {tab === 'sos'       && <SosTab />}
          {tab === 'hospitals' && <NearbyHospitalsPage />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
