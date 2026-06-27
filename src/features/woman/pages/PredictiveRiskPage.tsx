import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp, TrendingDown, Minus, Sparkles, Loader2,
  AlertTriangle, ShieldCheck, Activity, RefreshCw, Info,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RiskProgressionChart } from '@/components/charts/RiskCharts';
import { api } from '@/lib/api';
import type { PredictiveRisk } from '@/types';
import { cn } from '@/lib/utils';
import { Line } from 'react-chartjs-2';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const trendIcon = (t: string) =>
  t === 'improving' ? TrendingDown :
  t === 'worsening' ? TrendingUp : Minus;

const trendColor = (t: string) =>
  t === 'improving' ? 'text-emerald-600' :
  t === 'worsening' ? 'text-red-600' : 'text-amber-600';

const trendBg = (t: string) =>
  t === 'improving' ? 'bg-emerald-50 border-emerald-200' :
  t === 'worsening' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200';

const severityColor = (s: string) =>
  s === 'high' ? 'bg-red-100 text-red-700 border-red-200' :
  s === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
  'bg-emerald-100 text-emerald-700 border-emerald-200';

// ─── Confidence Ring ─────────────────────────────────────────────────────────

function ConfidenceRing({ value, label }: { value: number; label: string }) {
  const r = 28, c = 2 * Math.PI * r;
  const fill = (value / 100) * c;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-16 w-16">
        <svg className="rotate-[-90deg]" width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
          <circle cx="32" cy="32" r={r} fill="none" stroke="#ec4899" strokeWidth="6"
            strokeDasharray={c} strokeDashoffset={c - fill} strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-800">{value}%</span>
      </div>
      <p className="text-xs text-gray-500 text-center">{label}</p>
    </div>
  );
}

// ─── Probability Bar ──────────────────────────────────────────────────────────

function ProbabilityBar({ name, probability, severity }: { name: string; probability: number; severity: string }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{name}</span>
        <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold', severityColor(severity))}>
          {severity}
        </span>
      </div>
      <div className="relative h-2.5 rounded-full bg-gray-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${probability}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn('h-full rounded-full', probability > 50 ? 'bg-red-500' : probability > 25 ? 'bg-amber-500' : 'bg-emerald-500')}
        />
      </div>
      <p className="text-xs text-gray-400">{probability}% {t('predictiveRisk.probability')}</p>
    </div>
  );
}

// ─── Future Projection Chart ──────────────────────────────────────────────────

function ProjectionChart({ actual, predicted }: { actual: {week: number; score: number}[]; predicted: {week: number; predictedScore: number}[] }) {
  const allWeeks = [
    ...actual.map(a => `W${a.week}`),
    ...predicted.map(p => `W${p.week} (pred)`),
  ];
  const actualScores = [...actual.map(a => a.score), ...new Array(predicted.length).fill(null)];
  const predictedScores = [...new Array(actual.length).fill(null), ...predicted.map(p => p.predictedScore)];
  // Bridge: last actual point connects to first predicted
  if (actual.length > 0) predictedScores[actual.length - 1] = actual[actual.length - 1].score;

  return (
    <div className="h-56">
      <Line
        data={{
          labels: allWeeks,
          datasets: [
            { label: 'Actual Risk', data: actualScores, borderColor: '#ec4899', backgroundColor: 'rgba(236,72,153,0.1)', fill: true, tension: 0.4, pointBackgroundColor: '#ec4899', spanGaps: false },
            { label: 'Predicted Risk', data: predictedScores, borderColor: '#94a3b8', backgroundColor: 'rgba(148,163,184,0.08)', borderDash: [6, 3], fill: true, tension: 0.4, pointBackgroundColor: '#94a3b8', spanGaps: false },
          ],
        }}
        options={{
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: true, position: 'bottom' } },
          scales: { y: { beginAtZero: true, max: 100, title: { display: true, text: 'Risk Score' } } },
        }}
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PredictiveRiskPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { pregnancies, riskHistory, symptoms } = useData();
  const pregnancy = pregnancies.find(p => p.id === user?.linkedPregnancyId) || pregnancies[0];
  const myHistory = riskHistory.filter(r => r.pregnancyId === pregnancy?.id);
  const mySymptoms = symptoms.filter(s => s.pregnancyId === pregnancy?.id);

  const [prediction, setPrediction] = useState<PredictiveRisk | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFactors, setShowFactors] = useState(false);

  const loadPrediction = async () => {
    if (!pregnancy) return;
    setLoading(true);
    try {
      const res = await api.predictRisk({
        pregnancyId: pregnancy.id,
        riskHistory: myHistory.map(h => ({ week: h.week, score: h.riskScore })),
        currentRisk: { level: pregnancy.riskLevel, score: pregnancy.riskScore },
        gestationalWeek: pregnancy.gestationalWeek,
        symptoms: mySymptoms.slice(0, 3).flatMap(s => s.extractedSymptoms),
        complications: pregnancy.previousComplications,
      });
      setPrediction(res.prediction);
    } catch {
      // silently fail — no prediction available
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPrediction(); }, []);

  const TrendIcon7 = prediction ? trendIcon(prediction.next7Days.trend) : Minus;
  const TrendIcon30 = prediction ? trendIcon(prediction.next30Days.trend) : Minus;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">{t('predictiveRisk.aiPowered')}</p>
          <h1 className="text-2xl font-bold">{t('predictiveRisk.title')}</h1>
          <p className="text-white/80 text-sm mt-1">{t('predictiveRisk.subtitle')}</p>
          <div className="mt-4 flex items-center gap-3">
            <div className="rounded-2xl bg-white/20 px-4 py-2 text-center backdrop-blur-sm">
              <p className="text-lg font-bold">{pregnancy?.riskScore}/100</p>
              <p className="text-xs text-white/70">Current Score</p>
            </div>
            <div className="rounded-2xl bg-white/20 px-4 py-2 text-center backdrop-blur-sm">
              <p className="text-lg font-bold">Week {pregnancy?.gestationalWeek}</p>
              <p className="text-xs text-white/70">Gestation</p>
            </div>
            <Button size="sm" variant="outline" onClick={loadPrediction} disabled={loading}
              className="ml-auto border-white/30 text-white hover:bg-white/20 bg-transparent">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center gap-4">
            <div className="relative h-16 w-16">
              <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-indigo-500" />
              </div>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500" />
            </div>
            <p className="text-gray-600 font-medium">{t('predictiveRisk.analyzing')}</p>
            <p className="text-sm text-gray-400">{t('predictiveRisk.reviewingPoints', { count: myHistory.length })}</p>
          </CardContent>
        </Card>
      ) : prediction ? (
        <>
          {/* 7-day and 30-day forecast cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: t('predictiveRisk.next7Days'), data: prediction.next7Days, Icon: TrendIcon7 },
              { label: t('predictiveRisk.next30Days'), data: prediction.next30Days, Icon: TrendIcon30 },
            ].map(({ label, data, Icon }) => (
              <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className={cn('rounded-3xl border-2 p-5', trendBg(data.trend))}>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">{label}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-4xl font-bold text-gray-800">{data.probability}%</p>
                    <p className="text-sm text-gray-500 mt-1">{t('predictiveRisk.riskProbability')}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Icon className={cn('h-8 w-8', trendColor(data.trend))} />
                    <span className={cn('text-xs font-bold', trendColor(data.trend))}>
                      {data.trend.charAt(0).toUpperCase() + data.trend.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <ConfidenceRing value={data.confidence} label={t('predictiveRisk.aiConfidence')} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* AI Summary */}
          <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-indigo-800 mb-1">{t('predictiveRisk.geminiAnalysis')}</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{prediction.aiSummary}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Projection Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-500" /> {t('predictiveRisk.riskForecast')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectionChart
                actual={myHistory.map(h => ({ week: h.week, score: h.riskScore }))}
                predicted={prediction.futureRiskProjection || []}
              />
              <p className="mt-2 text-xs text-gray-400 text-center">{t('predictiveRisk.chartNote')}</p>
            </CardContent>
          </Card>

          {/* Complication probabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" /> {t('predictiveRisk.complicationForecast')}
              </CardTitle>
              <p className="text-xs text-gray-400">{t('predictiveRisk.complicationNote')}</p>
            </CardHeader>
            <CardContent className="space-y-5">
              {prediction.complications.map(c => (
                <ProbabilityBar key={c.name} name={c.name} probability={c.probability} severity={c.severity} />
              ))}
            </CardContent>
          </Card>

          {/* Key risk factors */}
          {prediction.keyFactors?.length > 0 && (
            <Card>
              <CardHeader>
                <button className="flex items-center justify-between w-full" onClick={() => setShowFactors(v => !v)}>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Info className="h-5 w-5 text-blue-500" /> Key Risk Factors
                  </CardTitle>
                  {showFactors ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </button>
              </CardHeader>
              <AnimatePresence>
                {showFactors && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <CardContent className="pt-0 flex flex-wrap gap-2">
                      {prediction.keyFactors.map(f => (
                        <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                      ))}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )}

          {/* Disclaimer */}
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <p className="text-xs text-gray-400 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" />
              {t('predictiveRisk.disclaimer')}
            </p>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-indigo-400" />
            </div>
            <p className="text-gray-500">{t('predictiveRisk.noData')}</p>
            <Button onClick={loadPrediction} variant="outline">{t('predictiveRisk.generateBtn')}</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
