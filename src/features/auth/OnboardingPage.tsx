import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Baby, Scale, Calendar, User, ArrowRight, Sparkles, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/common/Logo';
import { useAuth, getDashboardPath } from '@/contexts/AuthContext';

const MONTHS = Array.from({ length: 9 }, (_, i) => i + 1);

export default function OnboardingPage() {
  const { t } = useTranslation();
  const { user, needsOnboarding, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [gestationalMonth, setGestationalMonth] = useState(user?.gestationalMonth?.toString() || '');
  const [weight, setWeight] = useState(user?.weight?.toString() || '');
  const [symptoms, setSymptoms] = useState<string[]>(user?.symptoms || []);
  const [additionalInfo, setAdditionalInfo] = useState(user?.additionalInfo || '');
  const [previousReports, setPreviousReports] = useState(user?.previousReports || '');

  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  if (!needsOnboarding && user.onboardingComplete) {
    navigate(getDashboardPath(user.role), { replace: true });
    return null;
  }

  const steps = [
    {
      title: t('onboarding.step1Title', { defaultValue: 'About You' }),
      subtitle: t('onboarding.step1Subtitle', { defaultValue: 'Tell us a little about yourself' }),
      icon: User,
    },
    {
      title: t('onboarding.step2Title', { defaultValue: 'Your Pregnancy' }),
      subtitle: t('onboarding.step2Subtitle', { defaultValue: 'How far along are you?' }),
      icon: Baby,
    },
    {
      title: t('onboarding.step3Title', { defaultValue: 'Health Details' }),
      subtitle: t('onboarding.step3Subtitle', { defaultValue: 'Help us personalise your care' }),
      icon: Scale,
    },
    {
      title: t('onboarding.step4Title', { defaultValue: 'Symptoms & Reports' }),
      subtitle: t('onboarding.step4Subtitle', { defaultValue: 'How are you feeling today?' }),
      icon: Activity,
    },
  ];

  const canProceed = () => {
    if (step === 0) return name.trim().length >= 2 && Number(age) >= 15 && Number(age) <= 55;
    if (step === 1) return gestationalMonth !== '' && Number(gestationalMonth) >= 1 && Number(gestationalMonth) <= 9;
    if (step === 2) return Number(weight) >= 30 && Number(weight) <= 200;
    if (step === 3) return true;
    return false;
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      completeOnboarding({
        name: name.trim(),
        age: Number(age),
        gestationalMonth: Number(gestationalMonth),
        weight: Number(weight),
        symptoms,
        additionalInfo,
        previousReports,
      });
      navigate(getDashboardPath(user.role), { replace: true });
    }
  };

  const CurrentIcon = steps[step].icon;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary-200/25 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-purple-200/25 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="mb-8 text-center">
          <Logo size="md" className="mx-auto" />
          <div className="mt-6 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-primary-500" />
            <p className="text-sm font-medium text-primary-600">
              {t('onboarding.welcome', { defaultValue: "Let's set up your health profile" })}
            </p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="mb-8 flex justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === step
                  ? 'w-8 bg-gradient-to-r from-primary-500 to-purple-600'
                  : i < step
                  ? 'w-2 bg-primary-400'
                  : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="glass-card-premium p-8">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-purple-100">
              <CurrentIcon className="h-7 w-7 text-primary-600" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900">{steps[step].title}</h2>
              <p className="text-sm text-gray-500">{steps[step].subtitle}</p>
            </div>
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            {step === 0 && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t('onboarding.yourName', { defaultValue: 'Your Name' })}
                  </label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="h-12 rounded-xl text-base"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t('onboarding.yourAge', { defaultValue: 'Your Age' })}
                  </label>
                  <Input
                    type="number"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    placeholder="e.g. 28"
                    min={15}
                    max={55}
                    className="h-12 rounded-xl text-base"
                  />
                </div>
              </>
            )}

            {step === 1 && (
              <div>
                <label className="mb-3 block text-sm font-medium text-gray-700">
                  {t('onboarding.pregnancyMonth', { defaultValue: 'Which month of pregnancy are you in?' })}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {MONTHS.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setGestationalMonth(String(m))}
                      className={`flex flex-col items-center rounded-2xl border-2 p-4 transition-all ${
                        gestationalMonth === String(m)
                          ? 'border-primary-500 bg-primary-50 shadow-md shadow-primary-100'
                          : 'border-gray-100 bg-white hover:border-primary-200'
                      }`}
                    >
                      <Calendar
                        className={`mb-1 h-5 w-5 ${
                          gestationalMonth === String(m) ? 'text-primary-600' : 'text-gray-400'
                        }`}
                      />
                      <span className="text-lg font-bold">{m}</span>
                      <span className="text-xs text-gray-500">
                        {t('onboarding.month', { defaultValue: 'month' })}
                      </span>
                    </button>
                  ))}
                </div>
                {gestationalMonth && (
                  <p className="mt-4 text-center text-sm text-gray-500">
                    ≈ Week {Number(gestationalMonth) * 4} of pregnancy
                  </p>
                )}
              </div>
            )}

            {step === 2 && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t('onboarding.yourWeight', { defaultValue: 'Your current weight' })}
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    placeholder="e.g. 62"
                    min={30}
                    max={200}
                    className="h-12 rounded-xl pr-16 text-base"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                    kg
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  {t('onboarding.weightHint', { defaultValue: 'Used to personalise your nutrition and health plan' })}
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Select any pre-existing conditions:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'High Blood Pressure (BP)',
                      'Diabetes',
                      'Thyroid Disorders',
                      'Asthma',
                      'Anemia',
                      'Heart Disease',
                      'Epilepsy',
                      'Kidney Disease',
                      'Autoimmune Disorders',
                      'PCOS',
                      'Previous Pregnancy Complications',
                      'None',
                    ].map(sym => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => {
                          if (sym === 'None') {
                            setSymptoms(['None']);
                          } else {
                            const newSyms = symptoms.filter(s => s !== 'None');
                            if (newSyms.includes(sym)) {
                              setSymptoms(newSyms.filter(s => s !== sym));
                            } else {
                              setSymptoms([...newSyms, sym]);
                            }
                          }
                        }}
                        className={`rounded-full px-4 py-2 text-sm transition-all ${
                          symptoms.includes(sym)
                            ? 'bg-primary-500 text-white shadow-md'
                            : 'border border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                        }`}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Additional Information
                  </label>
                  <textarea
                    value={additionalInfo}
                    onChange={e => setAdditionalInfo(e.target.value)}
                    placeholder="Any other notes or feelings..."
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Upload Previous Reports (Optional)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={e => {
                      if (e.target.files && e.target.files.length > 0) {
                        const fileNames = Array.from(e.target.files)
                          .map(f => f.name)
                          .join(', ');
                        setPreviousReports(fileNames);
                      } else {
                        setPreviousReports('');
                      }
                    }}
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-700 hover:file:bg-primary-100 focus:border-primary-500 focus:outline-none"
                  />
                  {previousReports && (
                    <p className="mt-2 text-xs text-gray-500">Selected: {previousReports}</p>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          <div className="mt-8 flex gap-3">
            {step > 0 && (
              <Button
                variant="outline"
                className="flex-1 rounded-2xl"
                onClick={() => setStep(step - 1)}
              >
                {t('common.cancel', { defaultValue: 'Back' })}
              </Button>
            )}
            <Button
              className="flex-1 rounded-2xl"
              size="lg"
              disabled={!canProceed()}
              onClick={handleNext}
            >
              {step < 3 ? (
                <>
                  {t('common.getStarted', { defaultValue: 'Continue' })}{' '}
                  <ArrowRight className="h-5 w-5" />
                </>
              ) : (
                <>
                  {t('onboarding.startJourney', { defaultValue: 'Analyse & Start Journey' })}{' '}
                  <Sparkles className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
