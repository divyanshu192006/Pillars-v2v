import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Mic, Type, CheckSquare, Sparkles, Loader2, AlertTriangle,
  Heart, Droplets, Moon, Scale, Pill, SmilePlus,
  ChevronDown, ChevronUp, CheckCircle, ArrowRight,
  Activity, FileText, Zap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VoiceRecorder } from '@/components/voice/VoiceRecorder';
import { api } from '@/lib/api';
import type { DailyEntry, RiskLevel, Symptom, RiskReport } from '@/types';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const QUICK_SYMPTOMS = [
  { id: 'headache',   labelKey: 'checkin.symptoms_list.headache',   emoji: '🤕', risk: 'medium' },
  { id: 'fever',      labelKey: 'checkin.symptoms_list.fever',      emoji: '🌡️', risk: 'medium' },
  { id: 'bleeding',   labelKey: 'checkin.symptoms_list.bleeding',   emoji: '🩸', risk: 'high' },
  { id: 'dizziness',  labelKey: 'checkin.symptoms_list.dizziness',  emoji: '💫', risk: 'medium' },
  { id: 'swelling',   labelKey: 'checkin.symptoms_list.swelling',   emoji: '🦶', risk: 'medium' },
  { id: 'reduced_fm', labelKey: 'checkin.symptoms_list.reduced_fm', emoji: '👶', risk: 'high' },
  { id: 'vomiting',   labelKey: 'checkin.symptoms_list.vomiting',   emoji: '🤢', risk: 'low' },
  { id: 'high_bp',    labelKey: 'checkin.symptoms_list.high_bp',    emoji: '❤️', risk: 'high' },
  { id: 'ab_pain',    labelKey: 'checkin.symptoms_list.ab_pain',    emoji: '😣', risk: 'medium' },
  { id: 'fatigue',    labelKey: 'checkin.symptoms_list.fatigue',    emoji: '😴', risk: 'low' },
  { id: 'vision',     labelKey: 'checkin.symptoms_list.vision',     emoji: '👁️', risk: 'high' },
  { id: 'no_symptoms',labelKey: 'checkin.symptoms_list.no_symptoms',emoji: '✅', risk: 'none' },
];

const MOODS = [
  { id: 'great', emoji: '😄', labelKey: 'checkin.moods.great' },
  { id: 'good',  emoji: '🙂', labelKey: 'checkin.moods.good' },
  { id: 'okay',  emoji: '😐', labelKey: 'checkin.moods.okay' },
  { id: 'poor',  emoji: '😟', labelKey: 'checkin.moods.poor' },
  { id: 'bad',   emoji: '😢', labelKey: 'checkin.moods.bad' },
] as const;

type InputMode = 'chips' | 'voice' | 'text';
type Step = 'symptoms' | 'vitals' | 'analyzing' | 'result';

// ─── Risk colour helpers ──────────────────────────────────────────────────────

const riskStyle: Record<RiskLevel, { card: string; badge: string; text: string; icon: string }> = {
  GREEN:  { card: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-500', text: 'text-emerald-700', icon: '🟢' },
  YELLOW: { card: 'bg-amber-50 border-amber-200',     badge: 'bg-amber-500',   text: 'text-amber-700',   icon: '🟡' },
  RED:    { card: 'bg-red-50 border-red-200',          badge: 'bg-red-500',     text: 'text-red-700',     icon: '🔴' },
};

// ─── Local risk assessment fallback ──────────────────────────────────────────

function localRiskAssess(symptoms: string[], week: number): { score: number; level: RiskLevel; reasoning: string; action: string; precautions: string[]; warnings: string[] } {
  let score = 10;
  const warnings: string[] = [];
  const precautions: string[] = [];

  const highRiskSigns = ['Bleeding', 'Reduced Fetal Movement', 'High Blood Pressure', 'Blurred Vision'];
  const medRiskSigns  = ['Headache', 'Swelling', 'Dizziness', 'Abdominal Pain', 'Fever'];

  for (const s of symptoms) {
    if (highRiskSigns.some(h => s.toLowerCase().includes(h.toLowerCase().split(' ')[0].toLowerCase()))) {
      score += 25; warnings.push(`${s} requires immediate attention`);
    } else if (medRiskSigns.some(m => s.toLowerCase().includes(m.toLowerCase().split(' ')[0].toLowerCase()))) {
      score += 12;
    } else if (!s.includes('No Symptoms')) {
      score += 5;
    }
  }
  if (week >= 36) score += 5;
  if (week >= 28) score += 3;
  score = Math.min(100, score);

  const level: RiskLevel = score >= 65 ? 'RED' : score >= 35 ? 'YELLOW' : 'GREEN';

  if (level === 'GREEN') {
    precautions.push('Continue taking prescribed medicines', 'Drink 8+ glasses of water daily', 'Rest adequately and avoid heavy lifting');
  } else if (level === 'YELLOW') {
    precautions.push('Contact your ASHA worker within 24 hours', 'Monitor symptoms closely', 'Check blood pressure if possible', 'Increase rest periods');
    warnings.push('If symptoms worsen, go to PHC immediately');
  } else {
    precautions.push('Seek medical attention TODAY', 'Do not delay — contact ASHA worker immediately', 'Have family member accompany you to PHC');
    warnings.push('URGENT: Visit PHC or hospital today', 'Call emergency services if symptoms are severe');
  }

  return {
    score, level,
    reasoning: `Based on ${symptoms.length} symptom(s) at ${week} weeks gestation, risk score is ${score}/100.`,
    action: level === 'RED' ? 'URGENT: Visit PHC/hospital today' : level === 'YELLOW' ? 'Contact ASHA within 24 hours' : 'Continue routine care',
    precautions, warnings,
  };
}

// ─── AI Analysis via Gemini ───────────────────────────────────────────────────

async function analyzeWithAI(params: {
  symptoms: string[];
  transcription: string;
  weight?: number;
  bp?: string;
  water?: number;
  sleep?: number;
  medicineTaken?: boolean;
  mood?: string;
  notes?: string;
  week: number;
  language: string;
}): Promise<{ score: number; level: RiskLevel; reasoning: string; action: string; precautions: string[]; warnings: string[]; nextSteps: string }> {
  try {
    const prompt = `You are a maternal health AI. Analyze this daily pregnancy health check-in and return a JSON risk assessment.

Patient data:
- Gestational week: ${params.week}
- Symptoms reported: ${params.symptoms.join(', ') || 'None'}
- Description: "${params.transcription}"
- Weight: ${params.weight ? params.weight + ' kg' : 'not recorded'}
- Blood pressure: ${params.bp || 'not recorded'}
- Water intake: ${params.water ? params.water + ' glasses' : 'not recorded'}
- Sleep: ${params.sleep ? params.sleep + ' hours' : 'not recorded'}
- Medicines taken today: ${params.medicineTaken !== undefined ? (params.medicineTaken ? 'Yes' : 'No') : 'not recorded'}
- Mood: ${params.mood || 'not recorded'}
- Notes: "${params.notes || ''}"

Return ONLY valid JSON (no markdown) in this exact format:
{
  "score": <0-100 integer>,
  "level": <"GREEN" | "YELLOW" | "RED">,
  "reasoning": "<2 sentence clinical explanation>",
  "action": "<single recommended action>",
  "precautions": ["<precaution 1>", "<precaution 2>", "<precaution 3>"],
  "warnings": ["<warning sign to watch for>"],
  "nextSteps": "<what to do in next 24 hours>"
}

Scoring: 0-34=GREEN, 35-64=YELLOW, 65-100=RED. Be conservative — maternal safety is priority.`;

    const result = await api.extractSymptoms(prompt, params.language);
    // extractSymptoms is a generic API call — we use it for raw Gemini JSON
    // Actually use assessRisk endpoint for structured output
    const riskRes = await api.assessRisk({
      symptoms: params.symptoms,
      gestationalWeek: params.week,
      bloodPressure: params.bp,
      transcription: params.transcription,
    });
    const r = riskRes.report;
    return {
      score: r.riskScore,
      level: r.riskLevel as RiskLevel,
      reasoning: r.clinicalReasoning,
      action: r.suggestedAction,
      precautions: r.riskFactors.length ? r.riskFactors : ['Continue medications', 'Stay hydrated', 'Rest adequately'],
      warnings: r.symptoms,
      nextSteps: r.followUpRecommendation,
    };
  } catch {
    return localRiskAssess(params.symptoms, params.week);
  }
}

// ─── Step 1: Symptom Input ────────────────────────────────────────────────────

function SymptomStep({
  mode, setMode, selectedChips, toggleChip, textInput, setTextInput,
  voiceTranscript, setVoiceTranscript, pregnancyId, womanId, week, language,
  onVoiceReport, onNext,
}: {
  mode: InputMode; setMode: (m: InputMode) => void;
  selectedChips: string[]; toggleChip: (id: string) => void;
  textInput: string; setTextInput: (v: string) => void;
  voiceTranscript: string; setVoiceTranscript: (v: string) => void;
  pregnancyId: string; womanId: string; week: number;
  language: string;
  onVoiceReport: (s: Symptom, r: RiskReport) => void;
  onNext: () => void;
}) {
  const { t } = useTranslation();
  const hasInput = selectedChips.length > 0 || textInput.trim() || voiceTranscript.trim();

  return (
    <div className="space-y-5">
      {/* Mode tabs */}
      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-gray-100 p-1">
        {([['chips','checkin.inputModes.chips','✓'], ['voice','checkin.inputModes.voice','🎙️'], ['text','checkin.inputModes.text','✍️']] as [InputMode, string, string][]).map(([m, labelKey, icon]) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'rounded-xl py-2 text-xs font-semibold transition-all',
              mode === m ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {icon} {t(labelKey)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Quick chips */}
        {mode === 'chips' && (
          <motion.div key="chips" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <p className="text-xs text-gray-500 mb-3">{t('checkin.selectAllSymptoms')}</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_SYMPTOMS.map(s => {
                const active = selectedChips.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleChip(s.id)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-medium transition-all',
                      active
                        ? s.risk === 'high' ? 'bg-red-100 border-red-300 text-red-700'
                          : s.risk === 'medium' ? 'bg-amber-100 border-amber-300 text-amber-700'
                          : 'bg-emerald-100 border-emerald-300 text-emerald-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-primary-200 hover:bg-primary-50'
                    )}
                  >
                    <span>{s.emoji}</span>
                    <span>{t(s.labelKey)}</span>
                    {active && <CheckCircle className="h-3 w-3" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Voice */}
        {mode === 'voice' && (
          <motion.div key="voice" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <VoiceRecorder
              pregnancyId={pregnancyId}
              womanId={womanId}
              gestationalWeek={week}
              language={language as any}
              onSymptomReported={(s, r) => {
                setVoiceTranscript(s.transcription || s.description);
                onVoiceReport(s, r);
              }}
            />
            {voiceTranscript && (
              <div className="mt-3 rounded-xl bg-primary-50 border border-primary-100 p-3">
                <p className="text-xs font-semibold text-primary-600 mb-1">{t('checkin.recordedTranscript')}</p>
                <p className="text-sm text-gray-700">{voiceTranscript}</p>
                <button onClick={() => setVoiceTranscript('')} className="mt-1 text-xs text-red-400 hover:text-red-600">{t('checkin.clear')}</button>
              </div>
            )}
          </motion.div>
        )}

        {/* Text */}
        {mode === 'text' && (
          <motion.div key="text" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <p className="text-xs text-gray-500 mb-2">{t('checkin.describeSymptoms')}</p>
            <textarea
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:bg-white transition-all resize-none"
              rows={4}
              placeholder={t('checkin.textPlaceholder')}
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={onNext}
        disabled={!hasInput && mode !== 'voice'}
        className="w-full"
        size="lg"
      >
        {t('checkin.continueToVitals')} <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ─── Step 2: Vitals Form ──────────────────────────────────────────────────────

function VitalsStep({
  weight, setWeight, bp, setBp, water, setWater,
  sleep, setSleep, medicineTaken, setMedicineTaken,
  mood, setMood, notes, setNotes, onBack, onAnalyze, isAnalyzing,
}: {
  weight: string; setWeight: (v: string) => void;
  bp: string; setBp: (v: string) => void;
  water: string; setWater: (v: string) => void;
  sleep: string; setSleep: (v: string) => void;
  medicineTaken: boolean | null; setMedicineTaken: (v: boolean) => void;
  mood: string; setMood: (v: string) => void;
  notes: string; setNotes: (v: string) => void;
  onBack: () => void; onAnalyze: () => void; isAnalyzing: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">{t('checkin.allFieldsOptional')}</p>

      {/* Weight + BP */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2">
            <Scale className="h-3.5 w-3.5 text-primary-500" /> {t('checkin.weightKg')}
          </label>
          <input type="number" className="w-full bg-transparent text-lg font-bold text-gray-800 focus:outline-none"
            placeholder="65" value={weight} onChange={e => setWeight(e.target.value)} />
        </div>
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2">
            <Heart className="h-3.5 w-3.5 text-red-500" /> {t('checkin.bloodPressure')}
          </label>
          <input className="w-full bg-transparent text-lg font-bold text-gray-800 focus:outline-none"
            placeholder="120/80" value={bp} onChange={e => setBp(e.target.value)} />
        </div>
      </div>

      {/* Water + Sleep */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-gray-100 bg-cyan-50 p-4">
          <label className="flex items-center gap-2 text-xs font-semibold text-cyan-600 mb-2">
            <Droplets className="h-3.5 w-3.5" /> {t('checkin.waterGlasses')}
          </label>
          <div className="flex items-center gap-2">
            <button onClick={() => setWater(String(Math.max(0, parseInt(water || '0') - 1)))} className="h-7 w-7 rounded-full bg-cyan-200 text-cyan-700 font-bold text-sm">−</button>
            <span className="text-2xl font-bold text-cyan-700 w-8 text-center">{water || '0'}</span>
            <button onClick={() => setWater(String(parseInt(water || '0') + 1))} className="h-7 w-7 rounded-full bg-cyan-500 text-white font-bold text-sm">+</button>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-indigo-50 p-4">
          <label className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-2">
            <Moon className="h-3.5 w-3.5" /> {t('checkin.sleepHours')}
          </label>
          <div className="flex items-center gap-2">
            <button onClick={() => setSleep(String(Math.max(0, parseInt(sleep || '0') - 1)))} className="h-7 w-7 rounded-full bg-indigo-200 text-indigo-700 font-bold text-sm">−</button>
            <span className="text-2xl font-bold text-indigo-700 w-8 text-center">{sleep || '0'}</span>
            <button onClick={() => setSleep(String(parseInt(sleep || '0') + 1))} className="h-7 w-7 rounded-full bg-indigo-500 text-white font-bold text-sm">+</button>
          </div>
        </div>
      </div>

      {/* Medicine taken */}
      <div className="rounded-2xl border border-gray-100 bg-purple-50 p-4">
        <label className="flex items-center gap-2 text-xs font-semibold text-purple-600 mb-3">
          <Pill className="h-3.5 w-3.5" /> {t('checkin.medicineTaken')}
        </label>
        <div className="flex gap-3">
          {[{ v: true, labelKey: 'checkin.yesTaken' }, { v: false, labelKey: 'checkin.notYet' }].map(({ v, labelKey }) => (
            <button key={String(v)} onClick={() => setMedicineTaken(v)}
              className={cn('flex-1 rounded-xl py-2 text-sm font-medium border transition-all',
                medicineTaken === v ? 'bg-purple-500 border-purple-500 text-white' : 'bg-white border-purple-200 text-purple-700 hover:bg-purple-100')}>
              {t(labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Mood */}
      <div className="rounded-2xl border border-gray-100 bg-pink-50 p-4">
        <label className="flex items-center gap-2 text-xs font-semibold text-pink-600 mb-3">
          <SmilePlus className="h-3.5 w-3.5" /> {t('checkin.howFeelToday')}
        </label>
        <div className="flex justify-between">
          {MOODS.map(m => (
            <button key={m.id} onClick={() => setMood(m.id)}
              className={cn('flex flex-col items-center gap-1 rounded-xl p-2 transition-all',
                mood === m.id ? 'bg-pink-500 text-white scale-110' : 'hover:bg-pink-100')}>
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[10px] font-medium">{t(m.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2">
          <FileText className="h-3.5 w-3.5" /> {t('checkin.additionalNotes')}
        </label>
        <textarea className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
          rows={2} placeholder={t('checkin.notesPlaceholder')} value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">← {t('common.back')}</Button>
        <Button onClick={onAnalyze} disabled={isAnalyzing} className="flex-2 flex-1 bg-gradient-to-r from-primary-500 to-pink-500" size="lg">
          {isAnalyzing
            ? <><Loader2 className="h-5 w-5 animate-spin" /> {t('checkin.analyzing')}</>
            : <><Sparkles className="h-5 w-5" /> {t('checkin.analyzeWithAI')}</>
          }
        </Button>
      </div>
    </div>
  );
}

// ─── Step 3: Analysis Result ──────────────────────────────────────────────────

function ResultStep({ entry, onNewEntry }: { entry: DailyEntry; onNewEntry: () => void }) {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);
  const level = entry.riskLevel || 'GREEN';
  const s = riskStyle[level];
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
      <div className={cn('rounded-3xl border-2 p-6 text-center', s.card)}>
        <p className="text-5xl mb-3">{s.icon}</p>
        <p className="text-4xl font-bold mb-1" style={{ color: level === 'GREEN' ? '#059669' : level === 'YELLOW' ? '#d97706' : '#dc2626' }}>
          {entry.riskScore}/100
        </p>
        <p className={cn('text-lg font-bold', s.text)}>
          {level === 'GREEN' ? t('checkin.riskLabels.low') : level === 'YELLOW' ? t('checkin.riskLabels.medium') : t('checkin.riskLabels.high')}
        </p>
        <p className="text-sm text-gray-600 mt-2 max-w-sm mx-auto">{entry.aiRecommendation}</p>
      </div>

      {entry.symptoms.length > 0 && (
        <div className="rounded-2xl bg-white border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">{t('journey.symptomsReported')}</p>
          <div className="flex flex-wrap gap-2">
            {entry.symptoms.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 overflow-hidden">
        <button onClick={() => setShowDetails(v => !v)}
          className="w-full flex items-center justify-between p-4 text-sm font-semibold text-gray-600 hover:bg-gray-50">
          <span className="flex items-center gap-2"><Activity className="h-4 w-4 text-primary-500" /> {t('checkin.fullAIAnalysis')}</span>
          {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showDetails && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
              {entry.precautions && entry.precautions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-emerald-600 mb-2">{t('checkin.recommendedPrecautions')}</p>
                  <ul className="space-y-1.5">
                    {entry.precautions.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />{p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {entry.warningSignsToWatch && entry.warningSignsToWatch.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-amber-600 mb-2">{t('checkin.warningSignsWatch')}</p>
                  <ul className="space-y-1.5">
                    {entry.warningSignsToWatch.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />{w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {entry.suggestedNextSteps && (
                <div className="rounded-xl bg-primary-50 border border-primary-100 p-3">
                  <p className="text-xs font-semibold text-primary-600 mb-1">{t('checkin.nextSteps')}</p>
                  <p className="text-sm text-gray-700">{entry.suggestedNextSteps}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                {entry.bloodPressure && <div className="rounded-xl bg-gray-50 p-3 text-center"><p className="text-xs text-gray-400">BP</p><p className="font-bold text-sm">{entry.bloodPressure}</p></div>}
                {entry.waterIntake !== undefined && <div className="rounded-xl bg-cyan-50 p-3 text-center"><p className="text-xs text-cyan-400">{t('checkin.waterGlasses')}</p><p className="font-bold text-sm text-cyan-700">{entry.waterIntake} 💧</p></div>}
                {entry.sleepHours !== undefined && <div className="rounded-xl bg-indigo-50 p-3 text-center"><p className="text-xs text-indigo-400">{t('checkin.sleepHours')}</p><p className="font-bold text-sm text-indigo-700">{entry.sleepHours}h</p></div>}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
        <CheckCircle className="h-6 w-6 text-emerald-500 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-emerald-700">{t('checkin.savedToCalendar')}</p>
          <p className="text-xs text-emerald-600">{t('checkin.savedDesc', { date: format(new Date(entry.date), 'dd MMM yyyy') })}</p>
        </div>
      </div>

      {level === 'RED' && (
        <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 animate-pulse">
          <p className="font-bold text-red-700 flex items-center gap-2"><Zap className="h-5 w-5" /> {t('sos.urgentAction')}</p>
          <p className="text-sm text-red-600 mt-1">{t('sos.urgentDesc')}</p>
        </div>
      )}

      <Button onClick={onNewEntry} variant="outline" className="w-full">{t('checkin.newCheckin')}</Button>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DailyCheckInPage() {
  const { user } = useAuth();
  const { pregnancies, addSymptom, addRiskReport, updatePregnancyRisk,
          addAlert, addNotification, addDailyEntry, medicines, toggleMedicineTaken } = useData();
  const { i18n, t } = useTranslation();
  const pregnancy = pregnancies.find(p => p.id === user?.linkedPregnancyId) || pregnancies[0];
  const today = format(new Date(), 'yyyy-MM-dd');
  const currentLang = i18n.language || user?.language || 'en';

  // Step state
  const [step, setStep] = useState<Step>('symptoms');

  // Input mode
  const [mode, setMode] = useState<InputMode>('chips');

  // Symptom inputs
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [textInput, setTextInput] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Vitals
  const [weight, setWeight] = useState('');
  const [bp, setBp] = useState('');
  const [water, setWater] = useState('0');
  const [sleep, setSleep] = useState('0');
  const [medicineTaken, setMedicineTaken] = useState<boolean | null>(null);
  const [mood, setMood] = useState('');
  const [notes, setNotes] = useState('');

  // Result
  const [savedEntry, setSavedEntry] = useState<DailyEntry | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const toggleChip = useCallback((id: string) => {
    setSelectedChips(prev => {
      if (id === 'no_symptoms') return prev.includes('no_symptoms') ? [] : ['no_symptoms'];
      const withoutNoSymptoms = prev.filter(x => x !== 'no_symptoms');
      return withoutNoSymptoms.includes(id)
        ? withoutNoSymptoms.filter(x => x !== id)
        : [...withoutNoSymptoms, id];
    });
  }, []);

  const handleVoiceReport = useCallback((symptom: Symptom, report: RiskReport) => {
    addSymptom(symptom);
    addRiskReport(report);
    setVoiceTranscript(symptom.transcription || symptom.description);
  }, [addSymptom, addRiskReport]);

  // Collect all symptoms into a unified list
  const getAllSymptoms = (): string[] => {
    const chips = selectedChips
      .filter(id => id !== 'no_symptoms')
      .map(id => {
        const sym = QUICK_SYMPTOMS.find(s => s.id === id);
        // Use English label for backend/AI processing regardless of display language
        const labelMap: Record<string, string> = {
          headache: 'Headache', fever: 'Fever', bleeding: 'Bleeding',
          dizziness: 'Dizziness', swelling: 'Swelling', reduced_fm: 'Reduced Fetal Movement',
          vomiting: 'Vomiting / Nausea', high_bp: 'High Blood Pressure',
          ab_pain: 'Abdominal Pain', fatigue: 'Fatigue', vision: 'Blurred Vision',
        };
        return labelMap[id] || id;
      });
    const textSymptoms: string[] = [];
    const combined = textInput || voiceTranscript;
    if (combined) textSymptoms.push(combined);
    return [...new Set([...chips, ...textSymptoms])];
  };

  const handleAnalyze = async () => {
    if (!pregnancy) return;
    setIsAnalyzing(true);
    setStep('analyzing');

    const allSymptoms = getAllSymptoms();
    const transcription = textInput || voiceTranscript || selectedChips.map(id => QUICK_SYMPTOMS.find(s => s.id === id)?.label || id).join(', ');

    try {
      const result = await analyzeWithAI({
        symptoms: allSymptoms,
        transcription,
        weight: weight ? parseFloat(weight) : undefined,
        bp: bp || undefined,
        water: water ? parseInt(water) : undefined,
        sleep: sleep ? parseInt(sleep) : undefined,
        medicineTaken: medicineTaken ?? undefined,
        mood,
        notes,
        week: pregnancy.gestationalWeek,
        language: currentLang,
      });

      const entry: DailyEntry = {
        id: `de-${Date.now()}`,
        pregnancyId: pregnancy.id,
        womanId: user?.id || pregnancy.womanId,
        date: today,
        symptoms: allSymptoms,
        transcription,
        weight: weight ? parseFloat(weight) : undefined,
        bloodPressure: bp || undefined,
        waterIntake: water ? parseInt(water) : undefined,
        sleepHours: sleep ? parseInt(sleep) : undefined,
        medicineTaken: medicineTaken ?? undefined,
        mood: mood as DailyEntry['mood'],
        notes,
        riskScore: result.score,
        riskLevel: result.level,
        aiRecommendation: result.reasoning,
        warningSignsToWatch: result.warnings,
        precautions: result.precautions,
        suggestedNextSteps: result.nextSteps,
        createdAt: new Date().toISOString(),
      };

      // Persist to context
      addDailyEntry(entry);
      updatePregnancyRisk(pregnancy.id, result.level, result.score);
      addRiskReport({
        id: `r-${Date.now()}`,
        pregnancyId: pregnancy.id,
        womanId: user?.id || pregnancy.womanId,
        riskLevel: result.level,
        riskScore: result.score,
        riskFactors: result.warnings,
        clinicalReasoning: result.reasoning,
        suggestedAction: result.action,
        followUpRecommendation: result.nextSteps || '',
        symptoms: allSymptoms,
        gestationalWeek: pregnancy.gestationalWeek,
        createdAt: new Date().toISOString(),
      });

      addNotification({
        id: `n-${Date.now()}`,
        userId: user?.id || '',
        title: `Daily Check-in: ${result.level} Risk`,
        message: result.action,
        type: result.level === 'RED' ? 'alert' : 'info',
        read: false,
        createdAt: new Date().toISOString(),
      });

      if (result.level === 'RED') {
        try {
          await api.sendAlert({
            pregnancyId: pregnancy.id,
            womanName: pregnancy.womanName,
            riskLevel: 'RED',
            message: `URGENT: ${pregnancy.womanName} daily check-in flagged RED. ${result.action}`,
          });
        } catch {
          addAlert({
            id: `a-${Date.now()}`,
            pregnancyId: pregnancy.id,
            womanName: pregnancy.womanName,
            riskLevel: 'RED',
            type: 'in_app',
            recipients: [{ name: 'ASHA Worker', role: 'ASHA', contact: '', status: 'sent' }],
            message: `RED ALERT from daily check-in: ${result.reasoning}`,
            status: 'sent',
            createdAt: new Date().toISOString(),
          });
        }
      }

      // Auto-mark medicines taken if user said yes
      if (medicineTaken === true) {
        const myMeds = medicines.filter(m => m.pregnancyId === pregnancy.id && !m.taken);
        myMeds.forEach(m => toggleMedicineTaken(m.id));
      }

      setSavedEntry(entry);
      setStep('result');
    } catch {
      setIsAnalyzing(false);
      setStep('vitals');
    }
    setIsAnalyzing(false);
  };

  const handleNewEntry = () => {
    setStep('symptoms');
    setSelectedChips([]);
    setTextInput('');
    setVoiceTranscript('');
    setWeight('');
    setBp('');
    setWater('0');
    setSleep('0');
    setMedicineTaken(null);
    setMood('');
    setNotes('');
    setSavedEntry(null);
    setMode('chips');
  };

  const STEPS = ['symptoms', 'vitals', 'analyzing', 'result'];
  const stepIdx = STEPS.indexOf(step);

  return (
    <div className="space-y-6 pb-10 max-w-2xl mx-auto">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-pink-500 to-rose-400 p-6 text-white"
      >
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute right-8 bottom-0 h-20 w-20 rounded-full bg-white/10" />
        <div className="relative">
          <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1">
            {format(new Date(), 'EEEE, d MMMM yyyy')}
          </p>
          <h1 className="text-2xl font-bold">{t('checkin.title')}</h1>
          <p className="text-white/80 text-sm mt-1">
            Week {pregnancy?.gestationalWeek} · {pregnancy?.villageName}
          </p>
        </div>
      </motion.div>

      {/* ── Progress bar ── */}
      {step !== 'result' && (
        <div className="flex items-center gap-2">
          {[t('checkin.symptoms'), t('checkin.vitals'), t('checkin.aiAnalysis')].map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={cn(
                'h-2 flex-1 rounded-full transition-all',
                i < stepIdx ? 'bg-primary-500' : i === stepIdx ? 'bg-primary-300' : 'bg-gray-200'
              )} />
              {i < 2 && <div className={cn('h-4 w-4 rounded-full text-[8px] font-bold flex items-center justify-center shrink-0',
                i < stepIdx ? 'bg-primary-500 text-white' : i === stepIdx ? 'bg-primary-200 text-primary-700' : 'bg-gray-200 text-gray-400'
              )}>{i + 1}</div>}
            </div>
          ))}
          <span className="text-xs text-gray-400 shrink-0">
            {step === 'symptoms' ? 'Step 1/3' : step === 'vitals' ? 'Step 2/3' : ''}
          </span>
        </div>
      )}

      {/* ── Main card ── */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {step === 'symptoms' && <><Heart className="h-5 w-5 text-primary-500" /> How are you feeling today?</>}
            {step === 'vitals' && <><Activity className="h-5 w-5 text-blue-500" /> Today's Vitals</>}
            {step === 'analyzing' && <><Loader2 className="h-5 w-5 text-primary-500 animate-spin" /> AI Analyzing Your Health…</>}
            {step === 'result' && <><Sparkles className="h-5 w-5 text-primary-500" /> Today's Health Report</>}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {step === 'symptoms' && (
              <motion.div key="symptoms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SymptomStep
                  mode={mode} setMode={setMode}
                  selectedChips={selectedChips} toggleChip={toggleChip}
                  textInput={textInput} setTextInput={setTextInput}
                  voiceTranscript={voiceTranscript} setVoiceTranscript={setVoiceTranscript}
                  pregnancyId={pregnancy?.id || ''} womanId={user?.id || ''}
                  week={pregnancy?.gestationalWeek || 28} language={currentLang}
                  onVoiceReport={handleVoiceReport}
                  onNext={() => setStep('vitals')}
                />
              </motion.div>
            )}

            {step === 'vitals' && (
              <motion.div key="vitals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <VitalsStep
                  weight={weight} setWeight={setWeight}
                  bp={bp} setBp={setBp}
                  water={water} setWater={setWater}
                  sleep={sleep} setSleep={setSleep}
                  medicineTaken={medicineTaken} setMedicineTaken={setMedicineTaken}
                  mood={mood} setMood={setMood}
                  notes={notes} setNotes={setNotes}
                  onBack={() => setStep('symptoms')}
                  onAnalyze={handleAnalyze}
                  isAnalyzing={isAnalyzing}
                />
              </motion.div>
            )}

            {step === 'analyzing' && (
              <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="py-16 flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-100 to-pink-100 flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-primary-500" />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500"
                  />
                </div>
                <p className="text-lg font-semibold text-gray-700">Analyzing with Gemini AI…</p>
                <p className="text-sm text-gray-400 text-center max-w-xs">
                  Processing your symptoms, vitals and health data to generate your personalized risk assessment
                </p>
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <motion.div key={i} className="h-2 w-2 rounded-full bg-primary-400"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'result' && savedEntry && (
              <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ResultStep entry={savedEntry} onNewEntry={handleNewEntry} />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
