import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameDay, isBefore, addDays,
} from 'date-fns';
import {
  CheckCircle, Circle, ChevronLeft, ChevronRight, X,
  Droplets, Pill, Calendar, Baby, AlertTriangle, Heart,
  TrendingUp, Activity, Clock, MapPin,
  Sparkles, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PREGNANCY_MILESTONES } from '@/lib/demo-data';

// ─── Types ───────────────────────────────────────────────────────────────────

type RiskLv = 'GREEN' | 'YELLOW' | 'RED';

interface DayData {
  date: string;           // YYYY-MM-DD
  submitted: boolean;
  riskLevel?: RiskLv;
  riskScore?: number;
  symptoms?: string[];
  medicines?: { name: string; taken: boolean }[];
  waterIntake?: number;   // glasses
  appointment?: { title: string; location: string; status: string };
  notes?: string;
  aiRecommendation?: string;
  milestone?: { week: number; title: string; description: string };
}

// ─── Demo Data Generator ─────────────────────────────────────────────────────

function generateMonthData(year: number, month: number, gestWeek: number): Record<string, DayData> {
  // For the demo June 2026 month show rich demo data; for real current month use real today
  const today = (year === 2026 && month === 5) ? new Date(2026, 5, 23) : new Date();
  const start = startOfMonth(new Date(year, month));
  const end   = endOfMonth(new Date(year, month));
  const days  = eachDayOfInterval({ start, end });
  const data: Record<string, DayData> = {};

  const symptomsPool = [
    ['Mild nausea', 'Fatigue'],
    ['Back pain', 'Swollen ankles'],
    ['Headache', 'Dizziness'],
    ['Heartburn', 'Leg cramps'],
    ['Shortness of breath', 'Pelvic pressure'],
    ['Good day — no major symptoms'],
    ['Braxton Hicks contractions', 'Fatigue'],
    ['Reduced fetal movement'],
    ['Severe headache', 'Blurred vision'],
  ];
  const medicinesPool = [
    { name: 'Iron + Folic Acid', taken: true },
    { name: 'Calcium Supplement', taken: true },
    { name: 'Vitamin D3', taken: false },
  ];
  const aiPool = [
    'Stay hydrated and rest. Avoid prolonged standing.',
    'Your symptoms are common at this stage. Continue medications.',
    'Elevated risk detected. Contact your ASHA worker today.',
    'Great progress! Keep up with medicines and rest.',
    'Moderate risk. Monitor BP and fetal movement closely.',
    'Ensure you attend the upcoming ANC appointment.',
    'Sleep on your left side to improve circulation.',
    'Light walking 15 min/day is safe and beneficial.',
  ];

  days.forEach((day, idx) => {
    const key = format(day, 'yyyy-MM-dd');
    const isPast = isBefore(day, today) || isSameDay(day, today);
    const dayOfMonth = day.getDate();

    // Find milestone
    const milestone = PREGNANCY_MILESTONES.find(m => {
      const milestoneDate = addDays(today, (m.week - gestWeek) * 7);
      return isSameDay(day, milestoneDate);
    });

    if (!isPast) {
      // Future days — show upcoming reminders or appointments
      const hasAppt = dayOfMonth === 25 || dayOfMonth === 30;
      data[key] = {
        date: key,
        submitted: false,
        appointment: hasAppt ? { title: dayOfMonth === 25 ? 'ANC Visit - Week 29' : 'Blood Test', location: 'Bassi PHC', status: 'upcoming' } : undefined,
        milestone,
      };
      return;
    }

    // Past / today — generate realistic data
    const missed = !isSameDay(day, today) && (dayOfMonth % 7 === 0 || dayOfMonth % 13 === 0);
    const riskPool: RiskLv[] = dayOfMonth <= 5 ? ['GREEN'] : dayOfMonth <= 15 ? ['GREEN', 'GREEN', 'YELLOW'] : ['YELLOW', 'GREEN', 'RED', 'YELLOW'];
    const riskLevel = riskPool[idx % riskPool.length];
    const riskScore = riskLevel === 'GREEN' ? 10 + (idx % 25) : riskLevel === 'YELLOW' ? 45 + (idx % 25) : 75 + (idx % 20);

    const hasAppt = dayOfMonth === 5 || dayOfMonth === 15 || dayOfMonth === 22;
    const apptStatus = dayOfMonth === 15 ? 'missed' : 'completed';

    data[key] = {
      date: key,
      submitted: !missed,
      riskLevel: missed ? undefined : riskLevel,
      riskScore: missed ? undefined : riskScore,
      symptoms: missed ? undefined : symptomsPool[idx % symptomsPool.length],
      medicines: missed ? undefined : [
        { ...medicinesPool[0], taken: dayOfMonth % 3 !== 0 },
        { ...medicinesPool[1], taken: true },
        { ...medicinesPool[2], taken: dayOfMonth % 5 !== 0 },
      ],
      waterIntake: missed ? undefined : 4 + (idx % 5),
      appointment: hasAppt ? { title: dayOfMonth === 5 ? 'ANC Visit - Week 24' : dayOfMonth === 15 ? 'Anomaly Follow-up' : 'BP Check', location: 'Bassi PHC', status: apptStatus } : undefined,
      notes: !missed && dayOfMonth % 4 === 0 ? 'Felt baby move strongly today. Taking rest as advised.' : undefined,
      aiRecommendation: missed ? undefined : aiPool[idx % aiPool.length],
      milestone,
    };
  });

  return data;
}

// ─── Color helpers ────────────────────────────────────────────────────────────

const riskConfig: Record<RiskLv, { bg: string; text: string; border: string; dot: string; labelKey: string }> = {
  GREEN:  { bg: 'bg-emerald-50',  text: 'text-emerald-700',  border: 'border-emerald-200', dot: 'bg-emerald-500',  labelKey: 'risk.green' },
  YELLOW: { bg: 'bg-amber-50',    text: 'text-amber-700',    border: 'border-amber-200',   dot: 'bg-amber-500',    labelKey: 'risk.yellow' },
  RED:    { bg: 'bg-red-50',      text: 'text-red-700',      border: 'border-red-200',     dot: 'bg-red-500',      labelKey: 'risk.red' },
};

// ─── Day Detail Panel ─────────────────────────────────────────────────────────

function DayDetailPanel({ day, data, onClose }: { day: Date; data: DayData; onClose: () => void }) {
  const { t } = useTranslation();
  const cfg = data.riskLevel ? riskConfig[data.riskLevel] : null;
  const medicinesTaken = data.medicines?.filter(m => m.taken).length ?? 0;
  const totalMeds = data.medicines?.length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-white shadow-2xl md:inset-y-4 md:right-4 md:rounded-3xl"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-r from-primary-500 to-pink-500 px-6 py-5">
        <div>
          <p className="text-xs font-medium text-white/70 uppercase tracking-wide">{t('journey.dailyReport')}</p>
          <h2 className="text-xl font-bold text-white">{format(day, 'MMMM d, yyyy')}</h2>
          {data.milestone && (
            <p className="mt-1 text-xs text-white/80">👶 {data.milestone.title}</p>
          )}
        </div>
        <button onClick={onClose} className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4 p-5">
        {/* Status banner */}
        {!data.submitted ? (
          <div className="flex items-center gap-3 rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <AlertTriangle className="h-8 w-8 text-amber-400 shrink-0" />
            <div>
              <p className="font-semibold text-gray-700">{t('journey.noReportSubmitted')}</p>
              <p className="text-sm text-gray-500">{t('journey.missedTracking')}</p>
            </div>
          </div>
        ) : (
          <div className={`flex items-center gap-3 rounded-2xl border p-4 ${cfg?.bg} ${cfg?.border}`}>
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${cfg?.bg}`}>
              <Activity className={`h-6 w-6 ${cfg?.text}`} />
            </div>
            <div>
              <p className={`text-xs font-medium uppercase tracking-wide ${cfg?.text}`}>{t('risk.assessment')}</p>
              <p className={`text-xl font-bold ${cfg?.text}`}>{cfg ? t(cfg.labelKey) : ''}</p>
              <p className="text-sm text-gray-500">{t('risk.score')}: {data.riskScore}/100</p>
            </div>
          </div>
        )}

        {/* Appointment */}
        {data.appointment && (
          <div className={`rounded-2xl border p-4 ${data.appointment.status === 'missed' ? 'bg-red-50 border-red-100' : data.appointment.status === 'upcoming' ? 'bg-blue-50 border-blue-100' : 'bg-emerald-50 border-emerald-100'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className={`h-4 w-4 ${data.appointment.status === 'missed' ? 'text-red-500' : data.appointment.status === 'upcoming' ? 'text-blue-500' : 'text-emerald-500'}`} />
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('journey.appointment')}</span>
            </div>
            <p className="font-semibold text-gray-800">{data.appointment.title}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {data.appointment.location}</p>
            <span className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${data.appointment.status === 'missed' ? 'bg-red-100 text-red-700' : data.appointment.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {data.appointment.status === 'missed' ? t('appointments.missed') : data.appointment.status === 'upcoming' ? t('appointments.upcoming') : t('appointments.completed')}
            </span>
          </div>
        )}

        {/* Symptoms */}
        {data.symptoms && (
          <div className="rounded-2xl bg-primary-50 border border-primary-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 mb-3 flex items-center gap-1.5"><Heart className="h-3.5 w-3.5" /> {t('journey.symptomsReported')}</p>
            <div className="flex flex-wrap gap-2">
              {data.symptoms.map((s, i) => (
                <span key={i} className="rounded-full bg-white border border-primary-200 px-3 py-1 text-xs font-medium text-primary-700">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Medicines + Water row */}
        {data.medicines && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-purple-50 border border-purple-100 p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Pill className="h-4 w-4 text-purple-500" />
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">{t('journey.medicines')}</p>
              </div>
              <p className="text-2xl font-bold text-purple-700">{medicinesTaken}/{totalMeds}</p>
              <p className="text-xs text-purple-500">{t('journey.takenToday')}</p>
              <div className="mt-2 space-y-1">
                {data.medicines.map((m, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className={`h-1.5 w-1.5 rounded-full ${m.taken ? 'bg-purple-500' : 'bg-gray-300'}`} />
                    <span className={`text-xs ${m.taken ? 'text-purple-700' : 'text-gray-400 line-through'}`}>{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-cyan-50 border border-cyan-100 p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Droplets className="h-4 w-4 text-cyan-500" />
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600">{t('journey.hydration')}</p>
              </div>
              <p className="text-2xl font-bold text-cyan-700">{data.waterIntake}</p>
              <p className="text-xs text-cyan-500">{t('journey.glassesOfWater')}</p>
              <div className="mt-2 flex gap-1 flex-wrap">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={`h-3 w-3 rounded-full ${i < (data.waterIntake ?? 0) ? 'bg-cyan-400' : 'bg-cyan-100'}`} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {data.notes && (
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">{t('journey.notes')}</p>
            <p className="text-sm text-gray-700 leading-relaxed">{data.notes}</p>
          </div>
        )}

        {/* AI Recommendation */}
        {data.aiRecommendation && (
          <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-primary-50 border border-violet-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-primary-500 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">{t('journey.aiRecommendation')}</p>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{data.aiRecommendation}</p>
          </div>
        )}

        {/* Milestone detail */}
        {data.milestone && (
          <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-primary-50 border border-pink-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Baby className="h-5 w-5 text-pink-500" />
              <p className="font-semibold text-pink-700">{t('journey.pregnancyMilestone')}</p>
            </div>
            <p className="text-sm font-medium text-gray-700">{data.milestone.title}</p>
            <p className="text-sm text-gray-500 mt-1">{data.milestone.description}</p>
          </div>
        )}

        {!data.submitted && !data.appointment && !data.milestone && (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
              <Clock className="h-7 w-7 text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">{t('journey.noDataDay')}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Calendar Legend ──────────────────────────────────────────────────────────

function CalendarLegend() {
  const { t } = useTranslation();
  const items = [
    { color: 'bg-emerald-500', label: t('journey.legend.lowRisk') },
    { color: 'bg-amber-500',   label: t('journey.legend.mediumRisk') },
    { color: 'bg-red-500',     label: t('journey.legend.highRisk') },
    { color: 'bg-gray-200',    label: t('journey.legend.missed') },
    { label: '📅', text: true, labelText: t('journey.legend.appointment') },
    { label: '👶', text: true, labelText: t('journey.legend.milestone') },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-1.5">
          {it.text ? (
            <span className="text-sm">{it.label}</span>
          ) : (
            <div className={`h-2.5 w-2.5 rounded-full ${it.color}`} />
          )}
          <span>{it.text ? it.labelText : it.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Calendar Cell ────────────────────────────────────────────────────────────

function CalendarCell({
  day, data, isCurrentMonth, selected, onClick,
}: {
  day: Date;
  data?: DayData;
  isCurrentMonth: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  const todayDate = new Date();
  const _isToday = isSameDay(day, todayDate);
  const _isFuture = !isBefore(day, todayDate) && !_isToday;

  const riskDot = data?.riskLevel ? riskConfig[data.riskLevel].dot : null;
  const hasMilestone = !!data?.milestone;
  const hasAppt = !!data?.appointment;
  const submitted = data?.submitted;
  const missed = !_isFuture && !submitted && isCurrentMonth;

  return (
    <button
      onClick={onClick}
      className={[
        'relative flex flex-col items-center justify-start rounded-xl p-1 transition-all duration-200 min-h-[52px] text-left w-full',
        !isCurrentMonth ? 'opacity-20 cursor-default pointer-events-none' : 'hover:bg-primary-50 cursor-pointer',
        selected ? 'ring-2 ring-primary-400 bg-primary-50 shadow-md' : '',
        _isToday ? 'ring-2 ring-primary-500 bg-gradient-to-br from-primary-50 to-pink-50' : '',
      ].join(' ')}
    >
      {/* Day number */}
      <span className={[
        'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
        _isToday ? 'bg-gradient-to-br from-primary-500 to-pink-500 text-white shadow-lg' : '',
        !_isToday && isCurrentMonth ? 'text-gray-700' : 'text-gray-300',
      ].join(' ')}>
        {format(day, 'd')}
      </span>

      {/* Indicators row */}
      <div className="mt-0.5 flex items-center justify-center gap-0.5 flex-wrap">
        {/* Submitted checkmark */}
        {submitted && !_isFuture && (
          <div className={`h-1.5 w-1.5 rounded-full ${riskDot ?? 'bg-emerald-500'}`} />
        )}
        {/* Missed */}
        {missed && (
          <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
        )}
        {/* Appointment */}
        {hasAppt && (
          <span className="text-[8px] leading-none">📅</span>
        )}
        {/* Milestone */}
        {hasMilestone && (
          <span className="text-[8px] leading-none">👶</span>
        )}
      </div>
    </button>
  );
}

// ─── Monthly Calendar ─────────────────────────────────────────────────────────

function MonthlyCalendar({
  year, month, monthData, selectedDay, onSelectDay,
}: {
  year: number;
  month: number;
  monthData: Record<string, DayData>;
  selectedDay: Date | null;
  onSelectDay: (d: Date) => void;
}) {
  const { t } = useTranslation();
  const weekDays: string[] = t('journey.weekDays', { returnObjects: true }) as string[];
  const start = startOfMonth(new Date(year, month));
  const end   = endOfMonth(new Date(year, month));
  const days  = eachDayOfInterval({ start, end });

  // Pad start: 0=Sun
  const startPad = getDay(start); // 0-6
  const prevDays = Array.from({ length: startPad }, (_, i) =>
    addDays(start, -(startPad - i))
  );
  // Pad end to complete last row
  const totalCells = prevDays.length + days.length;
  const endPad = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const nextDays = Array.from({ length: endPad }, (_, i) => addDays(end, i + 1));

  const allCells = [...prevDays, ...days, ...nextDays];

  return (
    <div className="w-full">
      {/* Day headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekDays.map(d => (
          <div key={d} className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400">{d}</div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {allCells.map((day, i) => {
          const key = format(day, 'yyyy-MM-dd');
          const inMonth = day.getMonth() === month;
          return (
            <CalendarCell
              key={i}
              day={day}
              data={monthData[key]}
              isCurrentMonth={inMonth}
              selected={selectedDay ? isSameDay(day, selectedDay) : false}
              onClick={() => inMonth && onSelectDay(day)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Month Stats Strip ────────────────────────────────────────────────────────

function MonthStats({ monthData }: { monthData: Record<string, DayData> }) {
  const { t } = useTranslation();
  const values = Object.values(monthData);
  const submitted = values.filter(d => d.submitted).length;
  const total = values.length;
  const highRisk = values.filter(d => d.riskLevel === 'RED').length;
  const medRisk  = values.filter(d => d.riskLevel === 'YELLOW').length;
  const appts    = values.filter(d => d.appointment).length;
  const pct = Math.round((submitted / total) * 100);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        { icon: CheckCircle, label: t('journey.daysTracked'), value: `${submitted}/${total}`, sub: `${pct}% ${t('journey.complete')}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { icon: AlertTriangle, label: t('journey.highRiskDays'), value: highRisk, sub: t('journey.mediumRiskCount', { count: medRisk }), color: 'text-red-500', bg: 'bg-red-50' },
        { icon: TrendingUp, label: t('journey.mediumRisk'), value: medRisk, sub: t('journey.daysFlagged'), color: 'text-amber-600', bg: 'bg-amber-50' },
        { icon: Calendar, label: t('journey.appointments'), value: appts, sub: t('journey.thisMonth'), color: 'text-blue-600', bg: 'bg-blue-50' },
      ].map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className={`rounded-2xl border p-4 ${s.bg} border-white`}
        >
          <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
          <p className="text-2xl font-bold text-gray-800">{s.value}</p>
          <p className="text-xs font-semibold text-gray-600">{s.label}</p>
          <p className="text-xs text-gray-400">{s.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Enhanced Timeline ────────────────────────────────────────────────────────

function EnhancedTimeline({ currentWeek }: { currentWeek: number }) {
  const { t } = useTranslation();
  const [expandedTrimester, setExpandedTrimester] = useState<number | null>(
    currentWeek <= 12 ? 1 : currentWeek <= 27 ? 2 : 3
  );

  const TRIMESTER_INFO = [
    {
      trimester: 1, label: t('journey.trimester1.label'), weeks: t('journey.trimester1.weeks'),
      description: t('journey.trimester1.description'),
      color: 'from-violet-400 to-purple-500', bg: 'bg-violet-50', border: 'border-violet-100', icon: '🌱',
    },
    {
      trimester: 2, label: t('journey.trimester2.label'), weeks: t('journey.trimester2.weeks'),
      description: t('journey.trimester2.description'),
      color: 'from-primary-400 to-pink-500', bg: 'bg-pink-50', border: 'border-pink-100', icon: '🌸',
    },
    {
      trimester: 3, label: t('journey.trimester3.label'), weeks: t('journey.trimester3.weeks'),
      description: t('journey.trimester3.description'),
      color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50', border: 'border-amber-100', icon: '✨',
    },
  ];

  return (
    <div className="space-y-4">
      {TRIMESTER_INFO.map(tri => {
        const milestones = PREGNANCY_MILESTONES.filter(m => {
          if (tri.trimester === 1) return m.week <= 12;
          if (tri.trimester === 2) return m.week >= 13 && m.week <= 27;
          return m.week >= 28;
        });
        const isExpanded = expandedTrimester === tri.trimester;
        const isCurrent = (tri.trimester === 1 && currentWeek <= 12) ||
                          (tri.trimester === 2 && currentWeek > 12 && currentWeek <= 27) ||
                          (tri.trimester === 3 && currentWeek > 27);

        return (
          <motion.div
            key={tri.trimester}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: tri.trimester * 0.1 }}
            className={`rounded-3xl border overflow-hidden ${tri.bg} ${tri.border}`}
          >
            {/* Trimester Header */}
            <button
              className="w-full flex items-center justify-between p-5 text-left"
              onClick={() => setExpandedTrimester(isExpanded ? null : tri.trimester)}
            >
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${tri.color} flex items-center justify-center text-2xl shadow-md`}>
                  {tri.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800">{tri.label}</h3>
                    {isCurrent && (
                      <span className="rounded-full bg-gradient-to-r from-primary-500 to-pink-500 px-2.5 py-0.5 text-xs font-semibold text-white">{t('common.current')}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{t('common.week')} {tri.weeks}</p>
                </div>
              </div>
              {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
            </button>

            {/* Progress bar */}
            {isCurrent && (
              <div className="px-5 pb-3">
                <div className="h-1.5 rounded-full bg-white/60">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: tri.trimester === 1 ? `${Math.min(100, (currentWeek / 12) * 100)}%`
                        : tri.trimester === 2 ? `${Math.min(100, ((currentWeek - 12) / 15) * 100)}%`
                        : `${Math.min(100, ((currentWeek - 27) / 13) * 100)}%`
                    }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${tri.color}`}
                  />
                </div>
              </div>
            )}

            {/* Milestones */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-3">
                    <p className="text-sm text-gray-500 italic">{tri.description}</p>
                    {milestones.map((m, i) => {
                      const passed = currentWeek >= m.week;
                      const current = Math.abs(currentWeek - m.week) <= 2;
                      return (
                        <motion.div
                          key={m.week}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className={`flex gap-3 rounded-2xl p-4 border transition-all ${
                            current ? 'bg-white shadow-md border-primary-200' :
                            passed ? 'bg-white/60 border-white/80' : 'bg-white/30 border-transparent'
                          }`}
                        >
                          <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            passed ? `bg-gradient-to-br ${tri.color} text-white shadow-sm` : 'bg-white/60 text-gray-300 border border-gray-200'
                          }`}>
                            {passed ? <CheckCircle className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={passed ? 'default' : 'outline'} className="text-[10px]">{t('common.week')} {m.week}</Badge>
                              {current && <Badge variant="yellow" className="text-[10px]">{t('journey.youAreHere')}</Badge>}
                            </div>
                            <p className="mt-1 font-semibold text-gray-800 text-sm">{m.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JourneyPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pregnancies, dailyEntries } = useData();
  const pregnancy = pregnancies.find(p => p.id === user?.linkedPregnancyId) || pregnancies[0];
  const currentWeek = pregnancy?.gestationalWeek ?? 28;

  // Use real today
  const realToday = new Date();
  // Demo "today" fallback if real today has no data
  const demoToday = new Date(2026, 5, 23);
  const initialToday = dailyEntries.length > 0 ? realToday : demoToday;

  const [viewYear,  setViewYear]  = useState(initialToday.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialToday.getMonth());
  const [selectedDay, setSelectedDay] = useState<Date | null>(initialToday);

  // Build base demo data then overlay real entries
  const monthData = useMemo(() => {
    const base = generateMonthData(viewYear, viewMonth, currentWeek);

    // Overlay real DailyEntry records for this month
    if (pregnancy) {
      dailyEntries
        .filter(e => e.pregnancyId === pregnancy.id && e.date.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`))
        .forEach(e => {
          base[e.date] = {
            date: e.date,
            submitted: true,
            riskLevel: (e.riskLevel || 'GREEN') as RiskLv,
            riskScore: e.riskScore,
            symptoms: e.symptoms,
            medicines: e.medicineTaken !== undefined
              ? [{ name: 'Daily medicines', taken: e.medicineTaken }]
              : base[e.date]?.medicines,
            waterIntake: e.waterIntake ?? base[e.date]?.waterIntake,
            notes: e.notes,
            aiRecommendation: e.aiRecommendation,
            appointment: base[e.date]?.appointment,
            milestone: base[e.date]?.milestone,
          };
        });
    }

    return base;
  }, [viewYear, viewMonth, currentWeek, dailyEntries, pregnancy]);

  const selectedData = selectedDay
    ? monthData[format(selectedDay, 'yyyy-MM-dd')]
    : null;

  const [panelOpen, setPanelOpen] = useState(false);

  function handleDayClick(d: Date) {
    setSelectedDay(d);
    setPanelOpen(true);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const dueDate = pregnancy?.dueDate ? new Date(pregnancy.dueDate) : null;
  const weeksLeft = dueDate ? Math.max(0, 40 - currentWeek) : null;

  return (
    <div className="space-y-6 pb-10">
      {/* ── Hero Header ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-pink-500 to-rose-400 p-6 md:p-8 text-white"
      >
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -right-4 top-12 h-24 w-24 rounded-full bg-white/10" />
        <div className="absolute left-1/2 -bottom-6 h-20 w-20 rounded-full bg-white/10" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white/70">{t('journey.title')}</p>
            <h1 className="text-3xl font-bold">{user?.name?.split(' ')[0]}{t('journey.story')}</h1>
            <p className="mt-1 text-white/80">{t('journey.of40', { trimester: pregnancy?.trimester })}</p>
          </div>
          <div className="flex gap-4">
            <div className="rounded-2xl bg-white/20 px-5 py-3 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold">{currentWeek}</p>
              <p className="text-xs text-white/80">{t('journey.weeksAlong')}</p>
            </div>
            {weeksLeft !== null && (
              <div className="rounded-2xl bg-white/20 px-5 py-3 text-center backdrop-blur-sm">
                <p className="text-2xl font-bold">{weeksLeft}</p>
                <p className="text-xs text-white/80">{t('journey.weeksLeft')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative mt-5">
          <div className="h-2 rounded-full bg-white/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (currentWeek / 40) * 100)}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full bg-white shadow-sm"
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] font-medium text-white/60">
            <span>{t('journey.week1')}</span><span>{t('journey.week12')}</span><span>{t('journey.week28')}</span><span>{t('journey.week40')}</span>
          </div>
        </div>
      </motion.div>

      {/* ── Month Stats ─────────────────────────────────────────────── */}
      <MonthStats monthData={monthData} />

      {/* ── Calendar Card ───────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="overflow-hidden">
          <CardHeader className="pb-0">
            {/* Month nav */}
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">
                  {format(new Date(viewYear, viewMonth), 'MMMM yyyy')}
                </CardTitle>
                <p className="mt-0.5 text-sm text-gray-400">{t('journey.clickDate')}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="rounded-xl border border-gray-200 p-2 hover:bg-gray-50 transition-colors">
                  <ChevronLeft className="h-4 w-4 text-gray-500" />
                </button>
                <button onClick={() => { setViewYear(initialToday.getFullYear()); setViewMonth(initialToday.getMonth()); setSelectedDay(initialToday); }}
                  className="rounded-xl border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-600 hover:bg-primary-100 transition-colors">
                  {t('common.today')}
                </button>
                <button onClick={nextMonth} className="rounded-xl border border-gray-200 p-2 hover:bg-gray-50 transition-colors">
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
            {/* Legend */}
            <div className="mt-3 pb-1">
              <CalendarLegend />
            </div>
          </CardHeader>

          <CardContent className="pt-3">
            <MonthlyCalendar
              year={viewYear}
              month={viewMonth}
              monthData={monthData}
              selectedDay={selectedDay}
              onSelectDay={handleDayClick}
            />

            {/* Selected day quick peek */}
            {selectedDay && selectedData && !panelOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center justify-between rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${selectedData.riskLevel ? riskConfig[selectedData.riskLevel].dot : selectedData.submitted ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{format(selectedDay, 'EEEE, MMMM d')}</p>
                    <p className="text-xs text-gray-400">
                      {!selectedData.submitted ? t('journey.noReportSubmitted') : `${selectedData.riskLevel ? t(riskConfig[selectedData.riskLevel].labelKey) : t('journey.dailyReport')} · ${t('risk.score')} ${selectedData.riskScore ?? '-'}/100`}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setPanelOpen(true)} className="rounded-xl text-xs">
                  {t('common.viewDetails')}
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Timeline Section ─────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center">
            <Baby className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">{t('journey.milestones')}</h2>
            <p className="text-sm text-gray-500">{t('journey.byTrimester')}</p>
          </div>
        </div>
        <EnhancedTimeline currentWeek={currentWeek} />
      </motion.div>

      {/* ── Day Detail Panel Overlay ──────────────────────────────────── */}
      <AnimatePresence>
        {panelOpen && selectedDay && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setPanelOpen(false)}
            />
            <DayDetailPanel
              day={selectedDay}
              data={selectedData ?? { date: format(selectedDay, 'yyyy-MM-dd'), submitted: false }}
              onClose={() => setPanelOpen(false)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
