import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, BookOpen, Utensils } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import JourneyPage from './JourneyPage';
import KnowledgeHubPage from './KnowledgeHubPage';
import NutritionPlannerPage from './NutritionPlannerPage';
import pregnancyJourneyIllustration from '@/assets/illustrations/pregnancy-journey.svg';
import babyDevelopmentIllustration from '@/assets/illustrations/baby-development.svg';

interface Props { defaultTab?: string; }

export default function PregnancyHubPage({ defaultTab }: Props) {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const initial = defaultTab || params.get('tab') || 'journey';
  const [tab, setTab] = useState(initial);

  const TABS = [
    { id: 'journey',   label: t('nav.journey'),          icon: Heart },
    { id: 'knowledge', label: t('nav.knowledgeHub'),     icon: BookOpen },
    { id: 'nutrition', label: t('nav.nutritionPlanner'), icon: Utensils },
  ];

  const illustrationSrc = tab === 'knowledge' ? babyDevelopmentIllustration : pregnancyJourneyIllustration;
  const illustrationAlt = tab === 'knowledge' ? t('knowledge.title') : t('journey.title');

  return (
    <div className="space-y-4">
      {/* Illustration hero banner */}
      {tab !== 'nutrition' && (
        <motion.div
          key={illustrationSrc}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-50 via-pink-50 to-rose-50 border border-primary-100"
          style={{ minHeight: 120 }}
        >
          <img
            src={illustrationSrc}
            alt={illustrationAlt}
            className="absolute right-0 top-0 h-full w-auto max-w-[55%] object-contain object-right pointer-events-none select-none"
          />
          <div className="relative z-10 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-400 mb-1">
              {tab === 'journey' ? t('nav.pregnancyJourney') : t('knowledge.title')}
            </p>
            <p className="text-xl font-bold text-gray-800">
              {tab === 'journey' ? t('nav.timelineCalendar') : t('nav.knowledgeHub')}
            </p>
            <p className="text-sm text-gray-500 mt-0.5 max-w-[55%]">
              {tab === 'journey'
                ? t('journey.byTrimester')
                : t('knowledge.subtitle', { week: '' }).replace(' · ', '')}
            </p>
          </div>
        </motion.div>
      )}

      {/* Tab bar */}
      <div className="glass-card rounded-2xl p-1.5 flex gap-1">
        {TABS.map(tabItem => {
          const active = tab === tabItem.id;
          return (
            <button key={tabItem.id} onClick={() => setTab(tabItem.id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all',
                active
                  ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}>
              <tabItem.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tabItem.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
          {tab === 'journey'   && <JourneyPage />}
          {tab === 'knowledge' && <KnowledgeHubPage />}
          {tab === 'nutrition' && <NutritionPlannerPage />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
