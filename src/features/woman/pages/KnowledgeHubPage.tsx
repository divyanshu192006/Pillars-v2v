import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { BookOpen, ChevronDown, ChevronUp, Baby, Apple, AlertTriangle, TestTube, Heart, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import knowledgeIllustration from '@/assets/illustrations/knowledge-hub.svg';

interface Article {
  week: number; title: string; emoji: string;
  category: 'development' | 'nutrition' | 'tests' | 'warnings' | 'general';
  content: string; keyPoints: string[];
}

const ARTICLES: Article[] = [
  { week: 4, emoji: '🌱', title: 'Your Pregnancy Begins', category: 'development', content: 'The embryo implants in the uterine wall. The placenta begins forming to nourish your baby.', keyPoints: ['Start folic acid immediately', 'Avoid alcohol and smoking', 'Schedule first ANC visit', 'Rest and reduce stress'] },
  { week: 8, emoji: '💓', title: 'Heartbeat Detectable', category: 'development', content: 'Your baby\'s heart is beating and all major organs are beginning to form. The baby is about the size of a kidney bean.', keyPoints: ['First ultrasound recommended', 'Morning sickness peaks now', 'Avoid raw foods', 'Stay hydrated'] },
  { week: 12, emoji: '🎉', title: 'End of First Trimester', category: 'development', content: 'Risk of miscarriage drops significantly. Baby can now move fingers and toes. Nausea usually improves.', keyPoints: ['Blood tests: CBC, Blood group, HIV, HBsAg', 'Urine test for infection', 'BP monitoring begins', 'Weight check'] },
  { week: 16, emoji: '🤸', title: 'Baby Starts Moving', category: 'development', content: 'You may feel subtle flutters — these are your baby\'s first movements. Baby can now hear sounds.', keyPoints: ['Start counting fetal movements', 'Iron supplementation important', 'Calcium intake increases', 'Sleep on left side'] },
  { week: 20, emoji: '🔍', title: 'Anomaly Scan — Critical', category: 'tests', content: 'The Level 2 ultrasound checks baby\'s organs, brain, spine, and heart. This is the most important scan of pregnancy.', keyPoints: ['Anomaly scan (Level 2 ultrasound) due', 'Check placental position', 'Baby\'s sex can be determined', 'Report any reduced movement'] },
  { week: 24, emoji: '🌟', title: 'Viability Milestone', category: 'development', content: 'Your baby now has a chance of survival if born prematurely. Lungs are developing rapidly.', keyPoints: ['Glucose tolerance test (GTT) for GDM screening', 'Monitor for preeclampsia signs', 'Pelvic floor exercises', 'Discuss birth plan with doctor'] },
  { week: 28, emoji: '⭐', title: 'Third Trimester Begins', category: 'warnings', content: 'Increased risk period. Baby gains weight rapidly. Blood pressure monitoring is critical.', keyPoints: ['Weekly BP monitoring mandatory', 'Count kicks: 10 in 2 hours', 'Watch for swelling in face/hands', 'Rhesus-negative mothers need anti-D injection'] },
  { week: 32, emoji: '🧠', title: 'Rapid Brain Development', category: 'development', content: 'Baby\'s brain is growing fast. Most babies turn head-down now. Practice breathing movements begin.', keyPoints: ['Third trimester ultrasound', 'Antenatal class enrollment', 'Prepare hospital bag', 'Review birth plan'] },
  { week: 36, emoji: '🏥', title: 'Prepare for Birth', category: 'general', content: 'Baby is nearly full-term. Weekly check-ups begin. Watch for signs of labour.', keyPoints: ['Weekly ANC visits now', 'Pack hospital bag', 'Learn labour warning signs', 'Arrange transport to hospital'] },
  { week: 40, emoji: '👶', title: 'Due Date — Baby Ready', category: 'development', content: 'Your baby is ready to meet the world! If no labour by 41 weeks, induction may be discussed.', keyPoints: ['Daily fetal movement monitoring', 'Watch for labour signs: contractions, water breaking', 'Go to hospital if contractions 5 min apart', 'Breastfeed within 1 hour of birth'] },
];

const WARNING_SIGNS = [
  { sign: 'Severe headache + vision changes', urgency: 'emergency', action: 'Go to hospital immediately — possible preeclampsia' },
  { sign: 'Vaginal bleeding (any amount)', urgency: 'emergency', action: 'Call ASHA worker and go to hospital NOW' },
  { sign: 'No fetal movement for 12+ hours', urgency: 'emergency', action: 'Emergency — go to hospital immediately' },
  { sign: 'Severe abdominal pain', urgency: 'emergency', action: 'Do not wait — go to PHC/hospital' },
  { sign: 'Sudden swelling of face/hands', urgency: 'urgent', action: 'Contact ASHA worker within 2 hours' },
  { sign: 'Fever above 38°C', urgency: 'urgent', action: 'Contact ASHA worker today' },
  { sign: 'Reduced fetal movement', urgency: 'urgent', action: 'Count kicks, contact ASHA if fewer than 10 in 2 hours' },
  { sign: 'Leaking fluid from vagina', urgency: 'urgent', action: 'Go to PHC to check if membranes have ruptured' },
];

const categoryConfig = {
  development: { color: 'bg-pink-100 text-pink-700 border-pink-200', icon: Baby },
  nutrition: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Apple },
  tests: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: TestTube },
  warnings: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
  general: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Sparkles },
};

function ArticleCard({ article, isCurrent }: { article: Article; isCurrent: boolean }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(isCurrent);
  const cfg = categoryConfig[article.category];
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-2xl border overflow-hidden transition-all', isCurrent ? 'border-primary-300 shadow-md' : 'border-gray-100')}>
      <button onClick={() => setOpen(v => !v)}
        className={cn('w-full flex items-center gap-3 p-4 text-left', isCurrent ? 'bg-primary-50' : 'bg-white hover:bg-gray-50')}>
        <span className="text-2xl">{article.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-800">Week {article.week}: {article.title}</span>
            {isCurrent && <Badge className="bg-primary-500 text-white text-[10px]">{t('knowledge.youAreHere')}</Badge>}
          </div>
          <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium mt-1', cfg.color)}>
            {article.category}
          </span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-2 space-y-3 border-t border-gray-100">
              <p className="text-sm text-gray-700 leading-relaxed">{article.content}</p>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">{t('knowledge.keyActions')}</p>
                <ul className="space-y-1.5">
                  {article.keyPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-primary-500 font-bold shrink-0">✓</span> {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function KnowledgeHubPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pregnancies } = useData();
  const pregnancy = pregnancies.find(p => p.id === user?.linkedPregnancyId) || pregnancies[0];
  const currentWeek = pregnancy?.gestationalWeek || 28;
  const [tab, setTab] = useState<'timeline' | 'warnings'>('timeline');

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 p-6 text-white">
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
        {/* Illustration */}
        <img src={knowledgeIllustration} alt="" aria-hidden="true"
          className="absolute right-0 bottom-0 h-28 w-auto opacity-25 pointer-events-none select-none" />
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">{t('knowledge.education')}</p>
          <h1 className="text-2xl font-bold">{t('knowledge.title')}</h1>
          <p className="text-white/80 text-sm mt-1">{t('knowledge.subtitle', { week: currentWeek })}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1">
        {[['timeline', BookOpen, t('knowledge.weekGuide')], ['warnings', AlertTriangle, t('knowledge.warningSigns')]].map(([id, Icon, label]) => (
          <button key={id as string} onClick={() => setTab(id as 'timeline' | 'warnings')}
            className={cn('flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all',
              tab === id ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
            <Icon className="h-4 w-4" /> {label as string}
          </button>
        ))}
      </div>

      {tab === 'timeline' ? (
        <div className="space-y-3">
          {ARTICLES.map(a => (
            <ArticleCard key={a.week} article={a} isCurrent={Math.abs(a.week - currentWeek) <= 2} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">{t('knowledge.seekHelp')}</p>
          {WARNING_SIGNS.map((w, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className={cn('rounded-2xl border p-4', w.urgency === 'emergency' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200')}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={cn('h-5 w-5 shrink-0 mt-0.5', w.urgency === 'emergency' ? 'text-red-500' : 'text-amber-500')} />
                <div>
                  <p className={cn('font-semibold text-sm', w.urgency === 'emergency' ? 'text-red-700' : 'text-amber-700')}>{w.sign}</p>
                  <p className="text-xs text-gray-600 mt-1">{w.action}</p>
                  <span className={cn('inline-flex mt-2 rounded-full px-2 py-0.5 text-[10px] font-bold', w.urgency === 'emergency' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white')}>
                    {w.urgency === 'emergency' ? t('knowledge.emergency') : t('knowledge.urgent')}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
          <Card className="border-emerald-200 bg-emerald-50 mt-4">
            <CardContent className="p-4 flex items-start gap-3">
              <Heart className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-700">{t('knowledge.whenInDoubt')}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
