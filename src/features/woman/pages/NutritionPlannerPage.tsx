import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Utensils, Sparkles, Loader2, RefreshCw, Sun, Sunset, Moon, Coffee, Pill } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { NutritionPlan } from '@/types';
import nutritionIllustration from '@/assets/illustrations/nutrition-planner.svg';

interface Meal { item: string; portion: string; nutrients: string }

function MealCard({ icon: Icon, title, color, meals }: { icon: React.ElementType; title: string; color: string; meals: Meal[] }) {
  return (
    <Card className={`border-l-4 ${color}`}>
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="flex items-center gap-2 text-sm font-bold">
          <Icon className="h-4 w-4" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4 space-y-3">
        {meals.map((m, i) => (
          <div key={i} className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{m.item}</p>
              <p className="text-xs text-gray-500 mt-0.5">{m.nutrients}</p>
            </div>
            <span className="shrink-0 rounded-full bg-white border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-600">{m.portion}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function NutritionPlannerPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pregnancies } = useData();
  const pregnancy = pregnancies.find(p => p.id === user?.linkedPregnancyId) || pregnancies[0];
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const loadPlan = async () => {
    setLoading(true);
    try {
      const res = await api.getNutritionPlan({
        week: pregnancy?.gestationalWeek || 28,
        riskLevel: pregnancy?.riskLevel || 'YELLOW',
        symptoms: [],
        region: 'Rajasthan',
      });
      setPlan(res.plan as NutritionPlan);
    } catch { /* use fallback */ } finally { setLoading(false); }
  };

  if (!plan && !loading) loadPlan();

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6 text-white">
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
        {/* Illustration */}
        <img src={nutritionIllustration} alt="" aria-hidden="true"
          className="absolute right-0 bottom-0 h-32 w-auto opacity-30 pointer-events-none select-none" />
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">{t('nutrition.aiPowered')}</p>
          <h1 className="text-2xl font-bold">{t('nutrition.title')}</h1>
          <p className="text-white/80 text-sm mt-1">{t('nutrition.subtitle', { week: pregnancy?.gestationalWeek })}</p>
          <div className="mt-3 flex gap-3">
            <div className="rounded-2xl bg-white/20 px-4 py-2 backdrop-blur-sm text-center">
              <p className="text-lg font-bold">T{pregnancy?.trimester}</p>
              <p className="text-xs text-white/70">{t('nutrition.trimester')}</p>
            </div>
            <div className="rounded-2xl bg-white/20 px-4 py-2 backdrop-blur-sm text-center">
              <p className="text-lg font-bold">{pregnancy?.riskLevel}</p>
              <p className="text-xs text-white/70">{t('nutrition.riskLevel')}</p>
            </div>
            <Button size="sm" variant="outline" onClick={loadPlan} disabled={loading}
              className="ml-auto border-white/30 text-white bg-transparent hover:bg-white/20">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {t('nutrition.refresh')}
            </Button>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <Card><CardContent className="py-16 flex flex-col items-center gap-4">
          <div className="relative h-16 w-16">
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <Utensils className="h-8 w-8 text-emerald-500" />
            </div>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500" />
          </div>
          <p className="text-gray-600 font-medium">{t('nutrition.generating')}</p>
        </CardContent></Card>
      ) : plan ? (
        <>
          <div className="space-y-4">
            <MealCard icon={Sun}    title={t('nutrition.breakfast')} color="border-amber-400"   meals={plan.breakfast || []} />
            <MealCard icon={Sunset} title={t('nutrition.lunch')}      color="border-emerald-400" meals={plan.lunch || []} />
            <MealCard icon={Coffee} title={t('nutrition.snacks')}     color="border-orange-400"  meals={plan.snacks || []} />
            <MealCard icon={Moon}   title={t('nutrition.dinner')}     color="border-indigo-400"  meals={plan.dinner || []} />
          </div>

          {plan.supplements?.length > 0 && (
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Pill className="h-4 w-4 text-purple-500" /> {t('nutrition.supplements')}</CardTitle></CardHeader>
              <CardContent className="pb-4 space-y-2">
                {plan.supplements.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl bg-white border border-purple-100 px-3 py-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    <p className="text-sm text-gray-700">{s}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {plan.tips?.length > 0 && (
            <Card className="border-teal-200 bg-teal-50">
              <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Sparkles className="h-4 w-4 text-teal-500" /> {t('nutrition.tips')}</CardTitle></CardHeader>
              <CardContent className="pb-4 space-y-2">
                {plan.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-teal-500 font-bold mt-0.5">✓</span>
                    <p className="text-sm text-gray-700">{tip}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <p className="text-center text-xs text-gray-400">
          {plan.aiGenerated ? t('nutrition.aiGenerated') : t('nutrition.standardPlan')} · {t('nutrition.disclaimer')}
          </p>
        </>
      ) : null}
    </div>
  );
}
