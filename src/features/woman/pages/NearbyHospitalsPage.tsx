import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Navigation, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { NearbyFacility } from '@/types';
import hospitalIllustration from '@/assets/illustrations/hospital-finder.svg';

// Demo facilities for Jaipur Rural area
const DEMO_FACILITIES: NearbyFacility[] = [
  { id: 'f1', name: 'Bassi Primary Health Centre', type: 'PHC', address: 'Main Road, Bassi, Jaipur', distance: '0.8 km', phone: '0141-2771234', lat: 26.85, lng: 75.95, available24h: false, services: ['ANC', 'Normal Delivery', 'Blood Tests', 'Immunization'] },
  { id: 'f2', name: 'Chomu Community Health Centre', type: 'CHC', address: 'NH-11, Chomu, Jaipur', distance: '4.2 km', phone: '01423-220123', lat: 27.15, lng: 75.72, available24h: true, services: ['Emergency Delivery', 'C-Section', 'Blood Transfusion', 'NICU'] },
  { id: 'f3', name: 'Jaipur District Hospital', type: 'Hospital', address: 'Sawai Ram Singh Road, Jaipur', distance: '18 km', phone: '0141-2560291', lat: 26.92, lng: 75.81, available24h: true, services: ['Emergency', 'ICU', 'NICU', 'High-Risk Delivery', 'Blood Bank'] },
  { id: 'f4', name: 'Sanganer Sub-District Hospital', type: 'Hospital', address: 'Sanganer Road, Jaipur', distance: '7.5 km', phone: '0141-2790456', lat: 26.82, lng: 75.80, available24h: true, services: ['Emergency Delivery', 'ANC', 'Lab Tests', 'Ultrasound'] },
  { id: 'f5', name: 'Amer PHC', type: 'PHC', address: 'Amer Road, Jaipur', distance: '5.1 km', phone: '0141-2530789', lat: 26.99, lng: 75.85, available24h: false, services: ['ANC', 'Immunization', 'Family Planning'] },
];

const typeConfig: Record<string, { color: string; bg: string; border: string }> = {
  PHC:      { color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200' },
  CHC:      { color: 'text-blue-700',    bg: 'bg-blue-100',    border: 'border-blue-200' },
  Hospital: { color: 'text-purple-700',  bg: 'bg-purple-100',  border: 'border-purple-200' },
  Clinic:   { color: 'text-amber-700',   bg: 'bg-amber-100',   border: 'border-amber-200' },
};

function FacilityCard({ f, isNearest }: { f: NearbyFacility; isNearest: boolean }) {
  const { t } = useTranslation();
  const cfg = typeConfig[f.type] || typeConfig.Clinic;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={cn('overflow-hidden', isNearest ? 'ring-2 ring-primary-400 shadow-lg' : '')}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-800 text-sm">{f.name}</h3>
                {isNearest && <Badge className="bg-primary-500 text-white text-[10px]">{t('hospitals.nearest')}</Badge>}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold', cfg.bg, cfg.color, cfg.border)}>{f.type}</span>
                {f.available24h && <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 text-[10px] font-semibold"><CheckCircle className="h-2.5 w-2.5" />{t('hospitals.available24h')}</span>}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-bold text-primary-600">{f.distance}</p>
              <p className="text-[10px] text-gray-400">{t('hospitals.fromYou')}</p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-gray-500">
            <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{f.address}</div>
            <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /><a href={`tel:${f.phone}`} className="text-primary-600 font-medium hover:underline">{f.phone}</a></div>
            {!f.available24h && <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{t('hospitals.monToSat')}</div>}
          </div>

          <div className="mt-3 flex flex-wrap gap-1">
            {f.services.slice(0, 4).map(s => (
              <span key={s} className="rounded-full bg-gray-100 border border-gray-200 px-2 py-0.5 text-[10px] text-gray-600">{s}</span>
            ))}
            {f.services.length > 4 && <span className="rounded-full bg-gray-100 border border-gray-200 px-2 py-0.5 text-[10px] text-gray-400">+{f.services.length - 4} more</span>}
          </div>

          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => window.open(`tel:${f.phone}`)}>
              <Phone className="h-3.5 w-3.5 mr-1" /> {t('common.call')}
            </Button>
            <Button size="sm" className="flex-1 text-xs" onClick={() => window.open(`https://maps.google.com/?q=${f.lat},${f.lng}`)}>
              <Navigation className="h-3.5 w-3.5 mr-1" /> {t('common.directions')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function NearbyHospitalsPage() {
  const { t } = useTranslation();
  const { pregnancies } = useData();
  const pregnancy = pregnancies[0];
  const [locating, setLocating] = useState(false);
  const [located, setLocated] = useState(false);
  const [filter, setFilter] = useState<string>('All');

  const handleLocate = () => {
    setLocating(true);
    setTimeout(() => { setLocating(false); setLocated(true); }, 1500);
  };

  const filtered = filter === 'All' ? DEMO_FACILITIES : DEMO_FACILITIES.filter(f => f.type === filter);
  const isHighRisk = pregnancy?.riskLevel === 'RED' || pregnancy?.riskLevel === 'YELLOW';

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 p-6 text-white">
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
        {/* Map illustration */}
        <img src={hospitalIllustration} alt="" aria-hidden="true"
          className="absolute right-0 bottom-0 h-32 w-auto opacity-25 pointer-events-none select-none" />
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">{t('hospitals.emergencyCare')}</p>
          <h1 className="text-2xl font-bold">{t('hospitals.title')}</h1>
          <p className="text-white/80 text-sm mt-1">{t('hospitals.subtitle', { village: pregnancy?.villageName || 'Bassi' })}</p>
          <Button size="sm" variant="outline" onClick={handleLocate} disabled={locating}
            className="mt-3 border-white/30 text-white bg-transparent hover:bg-white/20">
            {locating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <MapPin className="h-4 w-4 mr-1" />}
            {located ? t('hospitals.locationUpdated') : t('hospitals.useLocation')}
          </Button>
        </div>
      </motion.div>

      {isHighRisk && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 text-sm">{t('hospitals.highRiskWarning')}</p>
              <p className="text-xs text-red-600 mt-1">{t('hospitals.highRiskDesc', { level: pregnancy?.riskLevel })}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['All', 'PHC', 'CHC', 'Hospital'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('shrink-0 rounded-2xl border px-4 py-1.5 text-xs font-semibold transition-all',
              filter === f ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300')}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((f, i) => <FacilityCard key={f.id} f={f} isNearest={i === 0 && filter === 'All'} />)}
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <p className="text-xs font-bold text-blue-700 mb-2">{t('hospitals.emergencyNumbers')}</p>
          <div className="grid grid-cols-2 gap-2">
            {[['108', 'Ambulance'], ['1800-180-1104', 'NHM Helpline'], ['104', 'Health Helpline'], ['112', 'Police/Emergency']].map(([num, label]) => (
              <a key={num} href={`tel:${num}`} className="flex items-center gap-2 rounded-xl bg-white border border-blue-100 p-2 hover:bg-blue-50 transition-colors">
                <Phone className="h-3.5 w-3.5 text-blue-500" />
                <div><p className="text-xs font-bold text-blue-700">{num}</p><p className="text-[10px] text-gray-500">{label}</p></div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
