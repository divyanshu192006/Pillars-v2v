import { useTranslation } from 'react-i18next';
import { DEMO_ANALYTICS } from '@/lib/demo-data';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskTrendChart } from '@/components/charts/RiskCharts';
import { Badge } from '@/components/ui/badge';

export default function DistrictAnalytics() {
  const { t } = useTranslation();
  const { pregnancies } = useData();

  // These insights are data-driven; for full i18n they'd come from the backend.
  // For now we keep them in English as they contain dynamic district data.
  const insights = [
    'RED cases increased by 20% in week 25 — primarily in Chomu and Sanganer villages',
    'ASHA follow-up compliance at 87% — above district target of 80%',
    'Voice reporting adoption increased 35% since MaaRaksha deployment',
    'Preeclampsia early detection rate improved by 40% compared to paper register baseline',
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{t('district.analytics')}</h2>

      <Card>
        <CardHeader><CardTitle>{t('district.sixWeekTrend')}</CardTitle></CardHeader>
        <CardContent>
          <RiskTrendChart
            labels={DEMO_ANALYTICS.map(a => a.week.replace('2026-', ''))}
            green={DEMO_ANALYTICS.map(a => a.greenCount)}
            yellow={DEMO_ANALYTICS.map(a => a.yellowCount)}
            red={DEMO_ANALYTICS.map(a => a.redCount)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t('district.aiInsights')}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl bg-indigo-50 p-4">
              <Badge>{i + 1}</Badge>
              <p className="text-sm">{insight}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t('district.trimesterBreakdown')}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map(tri => {
              const count = pregnancies.filter(p => p.trimester === tri).length;
              const red = pregnancies.filter(p => p.trimester === tri && p.riskLevel === 'RED').length;
              return (
                <div key={tri} className="rounded-xl bg-gray-50 p-4 text-center">
                  <p className="text-2xl font-bold">T{tri}</p>
                  <p className="text-sm text-gray-500">{count} {t('district.pregnancies')}</p>
                  <p className="text-xs text-red-500 mt-1">{red} {t('common.high').toLowerCase()} {t('common.riskLevel').toLowerCase()}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
