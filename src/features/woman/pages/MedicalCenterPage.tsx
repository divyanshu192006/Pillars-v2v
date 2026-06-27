import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, Pill, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import ReportsPage from './ReportsPage';
import MedicalReportAnalyzerPage from './MedicalReportAnalyzerPage';
import MedicinesPage from './MedicinesPage';
import AppointmentsPage from './AppointmentsPage';

interface Props { defaultTab?: string; }

export default function MedicalCenterPage({ defaultTab }: Props) {
  const { t } = useTranslation();
  const TABS = [
    { id: 'reports',      label: t('nav.healthReports'),  icon: FileText },
    { id: 'analyzer',     label: t('nav.reportAnalyzer'), icon: Upload },
    { id: 'medicines',    label: t('nav.medicines'),      icon: Pill },
    { id: 'appointments', label: t('nav.appointments'),   icon: Calendar },
  ];
  const [params] = useSearchParams();
  const initial = defaultTab || params.get('tab') || 'reports';
  const [tab, setTab] = useState(initial);

  return (
    <div className="space-y-4">
      {/* Scrollable tab bar */}
      <div className="glass-card rounded-2xl p-1.5">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(tabItem => {
            const active = tab === tabItem.id;
            return (
              <button key={tabItem.id} onClick={() => setTab(tabItem.id)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all',
                  active
                    ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                )}>
                <tabItem.icon className="h-3.5 w-3.5" />
                {tabItem.label}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
          {tab === 'reports'      && <ReportsPage />}
          {tab === 'analyzer'     && <MedicalReportAnalyzerPage />}
          {tab === 'medicines'    && <MedicinesPage />}
          {tab === 'appointments' && <AppointmentsPage />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
