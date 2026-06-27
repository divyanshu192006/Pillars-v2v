import { useTranslation } from 'react-i18next';
import { DEMO_ANALYTICS } from '@/lib/demo-data';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskTrendChart, RiskDistributionChart } from '@/components/charts/RiskCharts';

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const { pregnancies } = useData();
  const stats = {
    green: pregnancies.filter(p => p.riskLevel === 'GREEN').length,
    yellow: pregnancies.filter(p => p.riskLevel === 'YELLOW').length,
    red: pregnancies.filter(p => p.riskLevel === 'RED').length,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{t('phc.analytics')}</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{t('phc.weeklyTrend')}</CardTitle></CardHeader>
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
          <CardHeader><CardTitle>{t('phc.populationDist')}</CardTitle></CardHeader>
          <CardContent>
            <RiskDistributionChart green={stats.green} yellow={stats.yellow} red={stats.red} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>{t('phc.monthlySummary')}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-emerald-50 p-4 text-center">
              <p className="text-3xl font-bold text-emerald-600">{stats.green}</p>
              <p className="text-sm text-emerald-700">{t('phc.lowRiskGreen')}</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">{stats.yellow}</p>
              <p className="text-sm text-amber-700">{t('phc.mediumRiskYellow')}</p>
            </div>
            <div className="rounded-xl bg-red-50 p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{stats.red}</p>
              <p className="text-sm text-red-700">{t('phc.highRiskRed')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
