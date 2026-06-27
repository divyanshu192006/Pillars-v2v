import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Heart, ClipboardCheck, Calendar, AlertTriangle, Activity, Baby,
  CheckCircle, Clock, TrendingDown, TrendingUp, Minus,
  ChevronLeft, ChevronRight, Sparkles, Pill, Syringe, Apple,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameDay, isBefore, addDays, differenceInDays,
} from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RiskProgressionChart } from '@/components/charts/RiskCharts';
import { getRiskColor, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import welcomeIllustration from '@/assets/illustrations/welcome-home.svg';
import { getFetalData } from '@/lib/fetalData';

// ─── Section 1: Professional Medical Pregnancy Summary Card ──────────────────
function PregnancySummaryCard({ pregnancy }: { pregnancy: NonNullable<ReturnType<typeof usePregData>> }) {
  const { t } = useTranslation();
  const fetalData = getFetalData(pregnancy.gestationalWeek);
  const daysLeft = pregnancy.dueDate
    ? Math.max(0, differenceInDays(new Date(pregnancy.dueDate), new Date()))
    : null;
  const progressPct = Math.min(100, Math.round((pregnancy.gestationalWeek / 40) * 100));
  const weeksLeft = Math.max(0, 40 - pregnancy.gestationalWeek);
  const [showInsight, setShowInsight] = useState(false);

  const devStatus = [
    { label: 'Brain Growth',     value: fetalData.brainDevelopment, icon: '🧠' },
    { label: 'Hearing',          value: fetalData.hearing,          icon: '👂' },
    { label: 'Lung Development', value: fetalData.lungs,            icon: '🫁' },
    { label: 'Fetal Movement',   value: fetalData.movement,         icon: '💪' },
  ];

  const trimesterLabel = fetalData.trimester === 1 ? 'First Trimester'
    : fetalData.trimester === 2 ? 'Second Trimester' : 'Third Trimester';

  const riskBg = pregnancy.riskLevel === 'RED'
    ? 'from-red-600 via-rose-600 to-pink-600'
    : pregnancy.riskLevel === 'YELLOW'
    ? 'from-primary-500 via-pink-500 to-rose-400'
    : 'from-primary-500 via-pink-500 to-rose-400';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
      <Card className="overflow-hidden border-0 shadow-lg">

        {/* ── Top gradient band ── */}
        <div className={`relative bg-gradient-to-br ${riskBg} px-6 pt-5 pb-4 text-white overflow-hidden`}>
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/8" />
          <div className="absolute right-6 bottom-0 h-28 w-28 rounded-full bg-white/8" />

          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">
              {t('woman.pregnancySummary')}
            </p>

            {/* Two-column layout */}
            <div className="grid grid-cols-2 gap-6">

              {/* ── Left: week + progress ── */}
              <div className="space-y-3">
                <div>
                  <span className="text-4xl font-bold tracking-tight">Wk {pregnancy.gestationalWeek}</span>
                  <p className="text-white/75 text-xs mt-0.5 font-medium">{trimesterLabel} · {pregnancy.villageName}</p>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[10px] text-white/55 mb-1 font-medium">
                    <span>{t('woman.progress')}</span>
                    <span>{progressPct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 1.3, ease: 'easeOut' }}
                      className="h-full rounded-full bg-white shadow-sm"
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-white/45 mt-1">
                    <span>Wk 1</span><span>Wk 12</span><span>Wk 28</span><span>Wk 40</span>
                  </div>
                </div>

                {/* Key stats */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { label: t('woman.weeksLeft'), value: String(weeksLeft) },
                    { label: t('woman.daysLeft'),  value: daysLeft !== null ? String(daysLeft) : '—' },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl bg-white/15 backdrop-blur-sm p-2.5 text-center">
                      <p className="text-xl font-bold">{s.value}</p>
                      <p className="text-[10px] text-white/65 font-medium">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Right: baby development data panel ── */}
              <div className="space-y-2">
                <div className="rounded-xl bg-white/15 backdrop-blur-sm px-3 py-2.5 space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/55 mb-1.5">
                    {t('woman.babyDevelopment')}
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <div>
                      <p className="text-[9px] text-white/55 font-medium">{t('woman.weight')}</p>
                      <p className="text-base font-bold leading-tight">{fetalData.weightDisplay}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-white/55 font-medium">{t('woman.length')}</p>
                      <p className="text-base font-bold leading-tight">{fetalData.lengthCm} cm</p>
                    </div>
                  </div>
                  <div className="pt-1 border-t border-white/20">
                    <p className="text-[9px] text-white/55 font-medium">{t('woman.stage')}</p>
                    <p className="text-xs font-bold">{fetalData.stage}</p>
                  </div>
                </div>

                {/* Development status ticks */}
                <div className="rounded-xl bg-white/15 backdrop-blur-sm px-3 py-2.5 space-y-1.5">
                  {devStatus.map(d => (
                    <div key={d.label} className="flex items-start gap-1.5">
                      <span className="text-emerald-300 font-bold text-xs mt-0.5">✓</span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-white leading-tight truncate">{d.label}</p>
                        <p className="text-[9px] text-white/55 leading-tight truncate">{d.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Clinical milestones strip ── */}
        <div className="bg-white px-5 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {t('woman.weekDevelopment', { week: pregnancy.gestationalWeek })}
            </p>
            <button
              onClick={() => setShowInsight(v => !v)}
              className="text-[10px] font-semibold text-primary-500 hover:text-primary-700 transition-colors"
            >
              {showInsight ? t('woman.hideInsight') : t('woman.weeklyInsight')}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {fetalData.milestones.map((m, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-primary-400 shrink-0 mt-0.5" />
                <span className="text-xs text-gray-700 leading-snug">{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Weekly insight (collapsible) ── */}
        <AnimatePresence>
          {showInsight && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-5 py-3 bg-primary-50 border-t border-primary-100">
                <div className="flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-primary-600 mb-1">
                      {t('woman.clinicalInsight', { week: pregnancy.gestationalWeek })}
                    </p>
                    <p className="text-xs text-gray-700 leading-relaxed">{fetalData.insight}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </Card>
    </motion.div>
  );
}

// Helper hook alias for type inference
function usePregData() {
  const { pregnancies } = useData();
  return pregnancies[0];
}

// ─── Section 2: Mini Calendar ─────────────────────────────────────────────────
type CalDayStatus = 'complete-green' | 'complete-yellow' | 'complete-red' | 'partial' | 'none' | 'future';

function MiniCalendar({ pregnancyId }: { pregnancyId: string }) {
  const { t } = useTranslation();
  const { dailyEntries, getDailyEntry } = useData();
  const today = new Date();
  const [viewDate, setViewDate] = useState(today);
  const [selected, setSelected] = useState<string | null>(format(today, 'yyyy-MM-dd'));

  const yr = viewDate.getFullYear();
  const mo = viewDate.getMonth();
  const start = startOfMonth(new Date(yr, mo));
  const end = endOfMonth(new Date(yr, mo));
  const days = eachDayOfInterval({ start, end });
  const startPad = getDay(start);
  const prevDays = Array.from({ length: startPad }, (_, i) => addDays(start, -(startPad - i)));
  const allCells = [...prevDays, ...days];

  const getDayStatus = (date: Date): CalDayStatus => {
    if (!isBefore(date, today) && !isSameDay(date, today)) return 'future';
    const key = format(date, 'yyyy-MM-dd');
    const entry = getDailyEntry(pregnancyId, key);
    if (!entry) return 'none';
    if (entry.riskLevel === 'RED') return 'complete-red';
    if (entry.riskLevel === 'YELLOW') return 'complete-yellow';
    return 'complete-green';
  };

  const statusClass: Record<CalDayStatus, string> = {
    'complete-green': 'bg-emerald-500 text-white',
    'complete-yellow': 'bg-amber-400 text-white',
    'complete-red': 'bg-red-500 text-white',
    'partial': 'bg-primary-200 text-primary-700',
    'none': 'bg-gray-100 text-gray-500',
    'future': 'text-gray-300',
  };

  const selectedEntry = selected ? getDailyEntry(pregnancyId, selected) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t('woman.monthlyCheckinCalendar')}</CardTitle>
            <div className="flex items-center gap-1">
              <button onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1))}
                className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors">
                <ChevronLeft className="h-4 w-4 text-gray-500" />
              </button>
              <span className="text-xs font-semibold text-gray-600 w-20 text-center">
                {format(viewDate, 'MMM yyyy')}
              </span>
              <button onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1))}
                className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors">
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-2">
            {[['bg-emerald-500',t('journey.legend.lowRisk')],['bg-amber-400',t('journey.legend.mediumRisk')],['bg-red-500',t('journey.legend.highRisk')],['bg-gray-100 border',t('journey.noReportSubmitted')]].map(([c, l]) => (
              <div key={l} className="flex items-center gap-1">
                <div className={cn('h-2.5 w-2.5 rounded-full border border-gray-200', c)} />
                <span className="text-[10px] text-gray-500">{l}</span>
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={i} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {allCells.map((day, i) => {
              const inMonth = day.getMonth() === mo;
              const key = format(day, 'yyyy-MM-dd');
              const status = inMonth ? getDayStatus(day) : 'future';
              const isToday = isSameDay(day, today);
              const isSel = key === selected;
              return (
                <button key={i}
                  onClick={() => inMonth && status !== 'future' && setSelected(key)}
                  disabled={!inMonth || status === 'future'}
                  className={cn(
                    'relative aspect-square rounded-lg flex items-center justify-center text-[11px] font-semibold transition-all',
                    inMonth ? statusClass[status] : 'text-gray-200',
                    isToday && inMonth ? 'ring-2 ring-primary-500 ring-offset-1' : '',
                    isSel && inMonth ? 'ring-2 ring-primary-600 ring-offset-1 scale-110 shadow-md z-10' : '',
                    inMonth && status !== 'future' ? 'cursor-pointer hover:scale-105' : 'cursor-default',
                  )}>
                  {inMonth ? format(day, 'd') : ''}
                </button>
              );
            })}
          </div>

          {/* Selected day detail */}
          <AnimatePresence mode="wait">
            {selected && (
              <motion.div key={selected} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-3">
                {selectedEntry ? (
                  <div className={cn('rounded-2xl border p-3 space-y-2', selectedEntry.riskLevel === 'RED' ? 'bg-red-50 border-red-200' : selectedEntry.riskLevel === 'YELLOW' ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200')}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-700">{format(new Date(selected), 'dd MMM yyyy')}</p>
                      <Badge variant={selectedEntry.riskLevel === 'RED' ? 'red' : selectedEntry.riskLevel === 'YELLOW' ? 'yellow' : 'green'}>
                        {selectedEntry.riskLevel} · {selectedEntry.riskScore}/100
                      </Badge>
                    </div>
                    {selectedEntry.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {selectedEntry.symptoms.slice(0, 4).map(s => (
                          <span key={s} className="rounded-full bg-white border border-gray-200 px-2 py-0.5 text-[10px] text-gray-600">{s}</span>
                        ))}
                      </div>
                    )}
                    {selectedEntry.aiRecommendation && (
                      <p className="text-xs text-gray-600 flex items-start gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary-500 shrink-0 mt-0.5" />
                        {selectedEntry.aiRecommendation.slice(0, 100)}{selectedEntry.aiRecommendation.length > 100 ? '…' : ''}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-3 flex items-center justify-between">
                    <p className="text-xs text-gray-500">{format(new Date(selected), 'dd MMM')} {t('woman.noCheckin')}</p>
                    {selected === format(today, 'yyyy-MM-dd') && (
                      <Link to="/dashboard/woman/checkin">
                        <Button size="sm" className="text-xs h-7 rounded-xl">Add Entry</Button>
                      </Link>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <Link to="/dashboard/woman/checkin" className="mt-3 block">
            <Button className="w-full bg-gradient-to-r from-primary-500 to-pink-500 rounded-2xl" size="sm">
              <ClipboardCheck className="h-4 w-4 mr-1.5" /> {t('woman.addEntry')}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Section 3: AI Health Insights ───────────────────────────────────────────
function AIHealthInsights({ pregnancy, riskHistory }: {
  pregnancy: { riskScore: number; riskLevel: string; gestationalWeek: number };
  riskHistory: { week: number; riskScore: number; riskLevel: string }[];
}) {
  const { t } = useTranslation();
  const score = pregnancy.riskScore;
  const history = riskHistory.slice(-5);

  // Compute trend
  const trend: 'improving' | 'stable' | 'worsening' = useMemo(() => {
    if (history.length < 2) return 'stable';
    const last = history[history.length - 1].riskScore;
    const prev = history[history.length - 2].riskScore;
    if (last < prev - 3) return 'improving';
    if (last > prev + 3) return 'worsening';
    return 'stable';
  }, [history]);

  const predicted7 = trend === 'improving' ? Math.max(5, score - 4) : trend === 'worsening' ? Math.min(95, score + 5) : score;
  const predicted30 = trend === 'improving' ? Math.max(5, score - 10) : trend === 'worsening' ? Math.min(95, score + 12) : score + 2;

  const TrendIcon = trend === 'improving' ? TrendingDown : trend === 'worsening' ? TrendingUp : Minus;
  const trendStyle = trend === 'improving'
    ? { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-500', label: t('woman.improving') }
    : trend === 'worsening'
    ? { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: 'text-red-500', label: t('woman.worsening') }
    : { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: 'text-amber-500', label: t('woman.stable') };

  const scoreColor = score >= 65 ? '#ef4444' : score >= 35 ? '#f59e0b' : '#10b981';

  // Gauge ring
  const r = 38, c = 2 * Math.PI * r;
  const fill = (score / 100) * c;

  const demoFactors = score < 35
    ? ['Good hydration', 'Regular medicines', 'Normal BP']
    : score < 65
    ? ['Mild headache reported', 'Low water intake', 'Borderline BP']
    : ['Elevated blood pressure', 'Reduced fetal movement', 'Severe headache'];

  const demoRec = score < 35
    ? 'Continue routine care and daily check-ins. You are doing great!'
    : score < 65
    ? 'Increase hydration to 8+ glasses/day. Monitor BP daily. Contact ASHA if headache persists.'
    : 'Visit PHC immediately. Contact your ASHA worker. Avoid physical exertion.';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-indigo-50 to-violet-50">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            {t('woman.aiHealthInsights')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {/* Score + Trend row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Gauge */}
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-500">{t('woman.currentRiskScore')}</p>
              <div className="relative h-24 w-24">
                <svg className="rotate-[-90deg]" width="96" height="96" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <motion.circle cx="48" cy="48" r={r} fill="none" stroke={scoreColor} strokeWidth="8"
                    strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c - fill }}
                    transition={{ duration: 1.2, ease: 'easeOut' }} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-800">{score}</span>
                  <span className="text-[10px] text-gray-400">/ 100</span>
                </div>
              </div>
              <Badge variant={pregnancy.riskLevel === 'RED' ? 'red' : pregnancy.riskLevel === 'YELLOW' ? 'yellow' : 'green'} className="text-xs">
                {pregnancy.riskLevel === 'GREEN' ? 'Low Risk' : pregnancy.riskLevel === 'YELLOW' ? 'Medium Risk' : 'High Risk'}
              </Badge>
            </div>

            {/* Trend + predictions */}
            <div className="space-y-2">
              <div className={cn('rounded-2xl border p-3', trendStyle.bg)}>
                <p className="text-[10px] font-semibold text-gray-500 mb-1">{t('woman.trend')}</p>
                <div className="flex items-center gap-2">
                  <TrendIcon className={cn('h-5 w-5', trendStyle.icon)} />
                  <span className={cn('text-sm font-bold', trendStyle.text)}>{trendStyle.label}</span>
                </div>
              </div>
              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-3">
                <p className="text-[10px] font-semibold text-gray-500 mb-1.5">{t('woman.forecast')}</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{t('woman.next7Days')}</span>
                    <span className="text-xs font-bold text-blue-700">{predicted7}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-blue-100">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${predicted7}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full rounded-full bg-blue-400" />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-600">{t('woman.next30Days')}</span>
                    <span className="text-xs font-bold text-indigo-700">{predicted30}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-indigo-100">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${predicted30}%` }}
                      transition={{ duration: 1, delay: 0.7 }}
                      className="h-full rounded-full bg-indigo-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk factors */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">{t('woman.mainRiskFactors')}</p>
            <div className="flex flex-wrap gap-1.5">
              {demoFactors.map(f => (
                <span key={f} className={cn('rounded-full border px-2.5 py-1 text-xs font-medium',
                  score >= 65 ? 'bg-red-50 border-red-200 text-red-700' :
                  score >= 35 ? 'bg-amber-50 border-amber-200 text-amber-700' :
                  'bg-emerald-50 border-emerald-200 text-emerald-700')}>
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* AI recommendation */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-primary-50 border border-violet-100 p-3">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold text-violet-600 mb-0.5">{t('woman.aiRecommendation')}</p>
                <p className="text-xs text-gray-700 leading-relaxed">{demoRec}</p>
              </div>
            </div>
          </div>

          {/* Mini risk chart */}
          {riskHistory.length > 1 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">{t('woman.riskHistory')}</p>
              <RiskProgressionChart weeks={riskHistory.map(h => h.week)} scores={riskHistory.map(h => h.riskScore)} />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Section 4: Upcoming Actions & Events ────────────────────────────────────
function UpcomingActions({ pregnancyId }: { pregnancyId: string }) {
  const { t } = useTranslation();
  const { appointments, medicines } = useData();
  const today = new Date();

  const myAppts = appointments
    .filter(a => a.pregnancyId === pregnancyId && a.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  const pendingMeds = medicines
    .filter(m => m.pregnancyId === pregnancyId && !m.taken)
    .slice(0, 2);

  // Build unified timeline
  type ActionItem = {
    id: string; date: Date; label: string; sublabel: string;
    icon: React.ElementType; iconBg: string; iconColor: string; type: string;
  };

  const items: ActionItem[] = [
    // Today's medicines
    ...pendingMeds.map(m => ({
      id: m.id, date: today, label: m.name, sublabel: `${m.dosage} · ${m.frequency} at ${m.time}`,
      icon: Pill, iconBg: 'bg-purple-100', iconColor: 'text-purple-600', type: 'medicine',
    })),
    // Appointments
    ...myAppts.map(a => ({
      id: a.id, date: new Date(a.date), label: a.title, sublabel: a.location,
      icon: a.type === 'lab' ? Activity : a.type === 'ultrasound' ? Heart : Calendar,
      iconBg: a.type === 'lab' ? 'bg-blue-100' : a.type === 'ultrasound' ? 'bg-pink-100' : 'bg-emerald-100',
      iconColor: a.type === 'lab' ? 'text-blue-600' : a.type === 'ultrasound' ? 'text-pink-600' : 'text-emerald-600',
      type: 'appointment',
    })),
    // Demo nutrition + vaccination if list is short
    ...(myAppts.length < 2 ? [{
      id: 'nutr-1', date: new Date(today.getTime() + 7 * 86400000),
      label: 'Nutrition Review', sublabel: 'Weekly diet & supplement check',
      icon: Apple, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', type: 'task',
    }] : []),
    ...(pendingMeds.length === 0 ? [{
      id: 'vacc-1', date: new Date(today.getTime() + 14 * 86400000),
      label: 'Tetanus Toxoid (TT) Dose', sublabel: 'Check with ASHA worker',
      icon: Syringe, iconBg: 'bg-rose-100', iconColor: 'text-rose-600', type: 'vaccine',
    }] : []),
  ].sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 6);

  const typeLabel: Record<string, string> = {
    appointment: t('woman.actionTypes.appointment'),
    medicine: t('woman.actionTypes.medicine'),
    task: t('woman.actionTypes.task'),
    vaccine: t('woman.actionTypes.vaccine'),
  };
  const typeVariant: Record<string, 'default' | 'outline' | 'green' | 'yellow' | 'red'> = {
    appointment: 'default', medicine: 'yellow', task: 'green', vaccine: 'red',
  };

  const isToday = (d: Date) => isSameDay(d, today);
  const isTomorrow = (d: Date) => isSameDay(d, new Date(today.getTime() + 86400000));

  const dayLabel = (d: Date) => {
    if (isToday(d)) return t('common.today');
    if (isTomorrow(d)) return t('common.tomorrow');
    return format(d, 'd MMM');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary-500" />
              {t('woman.upcomingActions')}
            </span>
            <Link to="/dashboard/woman/medical">
              <Button variant="ghost" size="sm" className="text-xs h-7 text-primary-600 hover:text-primary-700">View all</Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {items.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle className="h-10 w-10 mx-auto text-emerald-300 mb-2" />
              <p className="text-sm text-gray-400">{t('woman.allCaughtUp')}</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline vertical line */}
              <div className="absolute left-[22px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary-200 via-pink-200 to-transparent" />
              <div className="space-y-0">
                {items.map((item, i) => (
                  <motion.div key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="relative flex items-start gap-4 py-3">
                    {/* Icon circle on timeline */}
                    <div className={cn('relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white shadow-sm', item.iconBg)}>
                      <item.icon className={cn('h-5 w-5', item.iconColor)} />
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{item.label}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{item.sublabel}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-bold',
                            isToday(item.date) ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
                          )}>
                            {dayLabel(item.date)}
                          </span>
                          <Badge variant={typeVariant[item.type] || 'outline'} className="text-[9px] py-0">
                            {typeLabel[item.type]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main WomanHome ───────────────────────────────────────────────────────────
export default function WomanHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pregnancies, riskHistory, notifications, triggerSOS, getDailyEntry } = useData();
  const pregnancy = pregnancies.find(p => p.id === user?.linkedPregnancyId) || pregnancies[0];
  const myHistory = riskHistory.filter(r => r.pregnancyId === pregnancy?.id);
  const unread = notifications.filter(n => n.userId === user?.id && !n.read).length;
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayEntry = pregnancy ? getDailyEntry(pregnancy.id, today) : undefined;

  const riskStyleMap: Record<string, string> = {
    GREEN:  'bg-emerald-50 border-emerald-200 text-emerald-700',
    YELLOW: 'bg-amber-50 border-amber-200 text-amber-700',
    RED:    'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div className="space-y-6">

      {/* ── SECTION 1: Pregnancy Summary ──────────────────────────────── */}
      {pregnancy && <PregnancySummaryCard pregnancy={pregnancy} />}

      {/* ── Today's check-in / SOS row ────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Check-in status */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          {todayEntry ? (
            <div className={cn('rounded-2xl border-2 p-4 flex items-center gap-3 h-full', riskStyleMap[todayEntry.riskLevel || 'GREEN'])}>
              <CheckCircle className="h-7 w-7 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{t('woman.checkInComplete')}</p>
                <p className="text-xs opacity-80 truncate">{todayEntry.riskLevel} · {todayEntry.riskScore}/100</p>
              </div>
              <Link to="/dashboard/woman/checkin">
                <Button size="sm" variant="outline" className="shrink-0 text-xs">{t('woman.viewAction')}</Button>
              </Link>
            </div>
          ) : (
            <Link to="/dashboard/woman/checkin">
              <motion.div whileHover={{ scale: 1.01 }}
                className="rounded-2xl border-2 border-dashed border-primary-300 bg-primary-50/60 p-4 flex items-center gap-3 h-full cursor-pointer group hover:bg-primary-50 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                  <ClipboardCheck className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-primary-700 text-sm">{t('woman.dailyCheckin')}</p>
                  <p className="text-xs text-primary-500 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" /> {t('woman.tapToReport')}
                  </p>
                </div>
                <Badge className="bg-primary-500 text-white shrink-0 text-xs">Start</Badge>
              </motion.div>
            </Link>
          )}
        </motion.div>

        {/* SOS */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Button variant="destructive" size="lg"
            className="w-full h-full min-h-[68px] text-base font-bold rounded-2xl animate-pulse"
            onClick={() => pregnancy && triggerSOS(pregnancy.id)}>
            <AlertTriangle className="h-6 w-6 mr-2" /> {t('sos.button')}
          </Button>
        </motion.div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title={t('woman.gestationalWeek')} value={pregnancy?.gestationalWeek || 0} icon={Baby} color="from-pink-500 to-rose-500" />
          <StatCard title={t('woman.dueDate')} value={pregnancy ? formatDate(pregnancy.dueDate) : '-'} icon={Calendar} color="from-primary-500 to-pink-500" />
          <StatCard title={t('common.trimester')} value={`T${pregnancy?.trimester}`} icon={Heart} color="from-purple-500 to-pink-500" />
          <StatCard title={t('woman.notifications')} value={unread} subtitle={t('woman.unread')} icon={Activity} color="from-amber-500 to-orange-500" />
        </div>
      </motion.div>

      {/* ── SECTION 2 + 3 side by side on large screens ────────────────── */}
      <div className="grid gap-6 xl:grid-cols-2">
        {pregnancy && <MiniCalendar pregnancyId={pregnancy.id} />}
        {pregnancy && <AIHealthInsights pregnancy={pregnancy} riskHistory={myHistory} />}
      </div>

      {/* ── SECTION 4: Upcoming Actions ─────────────────────────────────── */}
      {pregnancy && <UpcomingActions pregnancyId={pregnancy.id} />}

      {/* ── Quick Actions ────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
        <Card>
          <CardHeader><CardTitle>{t('woman.quickActions')}</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { to: '/dashboard/woman/checkin',   label: t('woman.dailyCheckin'),  icon: ClipboardCheck, color: 'bg-primary-100 text-primary-600' },
              { to: '/dashboard/woman/journey',   label: t('woman.myJourney'), icon: Heart,          color: 'bg-pink-100 text-pink-600' },
              { to: '/dashboard/woman/predict',   label: t('nav.aiRiskForecast'), icon: Activity,       color: 'bg-indigo-100 text-indigo-600' },
              { to: '/dashboard/woman/assistant', label: t('woman.askAI'),     icon: Sparkles,       color: 'bg-purple-100 text-purple-600' },
            ].map(a => (
              <Link key={a.to} to={a.to} className="flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors hover:bg-gray-50">
                <div className={cn('rounded-xl p-3', a.color)}><a.icon className="h-6 w-6" /></div>
                <span className="text-xs font-medium text-center">{a.label}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── High-risk warning ────────────────────────────────────────────── */}
      {pregnancy?.isHighRisk && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-4 p-6">
            <AlertTriangle className="h-10 w-10 text-red-500 shrink-0" />
            <div>
              <p className="font-semibold text-red-700">{t('woman.highRiskActive')}</p>
              <p className="text-sm text-red-600">{t('woman.ashaNotified')}</p>
              <Link to="/dashboard/woman/emergency">
                <Button variant="destructive" size="sm" className="mt-2">{t('woman.viewHighRisk')}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
