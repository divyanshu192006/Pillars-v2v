import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Heart, Activity, Pill, Calendar, TrendingUp, TrendingDown, Minus, Sparkles, Loader2, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { DigitalTwin } from '@/types';
import { cn } from '@/lib/utils';
import { Line } from 'react-chartjs-2';

function ScoreRing({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 36, c = 2 * Math.PI * r;
  const fill = (value / 100) * c;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-20 w-20">
        <svg className="rotate-[-90deg]" width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" stroke="#e5e7eb" strokeWidth="7" />
          <motion.circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c - fill }}
            transition={{ duration: 1.2, ease: 'easeOut' }} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-gray-800">{value}</span>
        </div>
      </div>
      <p className="text-xs font-medium text-gray-600 text-center">{label}</p>
    </div>
  );
}

export default function DigitalTwinPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { pregnancies, riskHistory, medicines, appointments, dailyEntries } = useData();
  const pregnancy = pregnancies.find(p => p.id === user?.linkedPregnancyId) || pregnancies[0];
  const myHistory = riskHistory.filter(r => r.pregnancyId === pregnancy?.id);
  const myMeds = medicines.filter(m => m.pregnancyId === pregnancy?.id);
  const myAppts = appointments.filter(a => a.pregnancyId === pregnancy?.id);
  const myEntries = dailyEntries.filter(e => e.pregnancyId === pregnancy?.id);

  const [twin, setTwin] = useState<DigitalTwin | null>(null);
  const [loading, setLoading] = useState(false);

  const loadTwin = async () => {
    if (!pregnancy) return;
    setLoading(true);
    try {
      const res = await api.getDigitalTwin({
        pregnancyId: pregnancy.id,
        riskHistory: myHistory.map(h => ({ week: h.week, score: h.riskScore })),
        dailyEntries: myEntries,
        medicines: myMeds,
        appointments: myAppts,
      });
      setTwin(res.twin);
    } catch { /* silently degrade */ } finally { setLoading(false); }
  };

  useEffect(() => { loadTwin(); }, []);

  const trendIcon = twin?.riskTrajectory === 'improving' ? TrendingDown :
    twin?.riskTrajectory === 'worsening' ? TrendingUp : Minus;
  const trendColor = twin?.riskTrajectory === 'improving' ? '#10b981' :
    twin?.riskTrajectory === 'worsening' ? '#ef4444' : '#f59e0b';
  const TrendIcon = trendIcon;

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 p-6 text-white">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">{t('digitalTwin.aiIntelligence')}</p>
          <h1 className="text-2xl font-bold">{t('digitalTwin.title')}</h1>
          <p className="text-white/80 text-sm mt-1">{t('digitalTwin.subtitle')}</p>
          <div className="mt-4 flex items-center gap-3">
            {twin && (
              <div className="rounded-2xl bg-white/20 px-4 py-2 text-center backdrop-blur-sm">
                <p className="text-2xl font-bold">{twin.healthScore}</p>
                <p className="text-xs text-white/70">{t('digitalTwin.healthScore')}</p>
              </div>
            )}
            <Button size="sm" variant="outline" onClick={loadTwin} disabled={loading}
              className="ml-auto border-white/30 text-white bg-transparent hover:bg-white/20">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} {t('digitalTwin.refresh')}
            </Button>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <Card><CardContent className="py-16 flex flex-col items-center gap-4">
          <div className="relative h-16 w-16">
            <div className="h-16 w-16 rounded-full bg-pink-100 flex items-center justify-center">
              <Heart className="h-8 w-8 text-pink-500" />
            </div>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500" />
          </div>
          <p className="text-gray-600 font-medium">{t('digitalTwin.building')}</p>
        </CardContent></Card>
      ) : twin ? (
        <>
          {/* Score rings */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-5 w-5 text-pink-500" /> {t('digitalTwin.healthScores')}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <ScoreRing value={twin.healthScore} label={t('digitalTwin.overallHealth')} color="#ec4899" />
                <ScoreRing value={twin.complianceScore} label={t('digitalTwin.checkinRate')} color="#10b981" />
                <ScoreRing value={twin.medicineScore} label={t('digitalTwin.medicines')} color="#8b5cf6" />
                <ScoreRing value={twin.nutritionScore} label={t('digitalTwin.nutritionEst')} color="#f59e0b" />
              </div>
              <div className="mt-5 flex items-center justify-center gap-3">
                <TrendIcon className="h-6 w-6" style={{ color: trendColor }} />
                <span className="text-sm font-semibold" style={{ color: trendColor }}>
                  {t('digitalTwin.trajectory')} {twin.riskTrajectory === 'improving' ? t('digitalTwin.improving') : twin.riskTrajectory === 'worsening' ? t('digitalTwin.worsening') : t('digitalTwin.stable')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Future risk projection */}
          {twin.futureRiskProjection?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Activity className="h-5 w-5 text-indigo-500" /> {t('digitalTwin.futureProjection')}</CardTitle></CardHeader>
              <CardContent>
                <div className="h-48">
                  <Line data={{
                    labels: [...myHistory.map(h => `W${h.week}`), ...twin.futureRiskProjection.map(p => `W${p.week}`)],
                    datasets: [
                      { label: 'Actual', data: [...myHistory.map(h => h.riskScore), ...new Array(twin.futureRiskProjection.length).fill(null)], borderColor: '#ec4899', fill: false, tension: 0.4, spanGaps: false },
                      { label: 'Predicted', data: [...new Array(myHistory.length > 0 ? myHistory.length - 1 : 0).fill(null), myHistory[myHistory.length-1]?.riskScore || null, ...twin.futureRiskProjection.map(p => p.predictedScore)], borderColor: '#94a3b8', borderDash: [5,3], fill: false, tension: 0.4, spanGaps: false },
                    ],
                  }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom' } }, scales: { y: { beginAtZero: true, max: 100 } } }} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Insights */}
          {twin.insights?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-5 w-5 text-amber-500" /> {t('digitalTwin.aiInsights')}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {twin.insights.map((insight, i) => {
                  const isPositive = insight.toLowerCase().includes('excellent') || insight.toLowerCase().includes('good');
                  return (
                    <div key={i} className={cn('flex items-start gap-3 rounded-2xl p-4', isPositive ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100')}>
                      {isPositive ? <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" /> : <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />}
                      <p className="text-sm text-gray-700">{insight}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Activity, label: t('digitalTwin.checkins'), value: myEntries.length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: Pill, label: t('digitalTwin.medsTaken'), value: myMeds.filter(m => m.taken).length, color: 'text-purple-600', bg: 'bg-purple-50' },
              { icon: Calendar, label: t('digitalTwin.appointments'), value: myAppts.filter(a => a.status === 'completed').length, color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: Heart, label: t('digitalTwin.riskReports'), value: myHistory.length, color: 'text-pink-600', bg: 'bg-pink-50' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className={cn('rounded-2xl border p-4', s.bg, 'border-white')}>
                <s.icon className={cn('h-5 w-5 mb-2', s.color)} />
                <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400">{t('digitalTwin.lastUpdated', { date: new Date(twin.lastUpdated).toLocaleString() })}</p>
        </>
      ) : (
        <Card><CardContent className="py-12 text-center space-y-4">
          <Heart className="h-12 w-12 mx-auto text-gray-200" />
          <p className="text-sm text-gray-400">{t('digitalTwin.noData')}</p>
          <Button onClick={loadTwin} variant="outline">{t('digitalTwin.generateBtn')}</Button>
        </CardContent></Card>
      )}
    </div>
  );
}
