import { useTranslation } from 'react-i18next';
import { useData } from '@/contexts/DataContext';
import { DEMO_DISTRICTS, DEMO_ANALYTICS, getDemoStats } from '@/lib/demo-data';
import { StatCard } from '@/components/common/StatCard';
import { RiskTrendChart, RiskDistributionChart } from '@/components/charts/RiskCharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users, AlertTriangle, TrendingUp } from 'lucide-react';

export default function DistrictHome() {
  const { t } = useTranslation();
  const { pregnancies } = useData();
  const stats = getDemoStats('district');
  const district = DEMO_DISTRICTS[0];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold">{district.name} {t('nav.dashboard')}</h2>
          <p className="text-gray-600">{district.state} · {t('common.population')}: {district.population.toLocaleString()}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('district.activePregnancies')} value={stats.totalPregnancies} icon={Users} />
        <StatCard title={t('district.highRisk')} value={stats.highRisk} icon={AlertTriangle} color="from-red-500 to-rose-500" />
        <StatCard title={t('district.villagesCovered')} value={5} icon={MapPin} color="from-blue-500 to-indigo-500" />
        <StatCard
          title={t('district.riskTrend')}
          value="+2"
          subtitle={t('district.redCasesWeek')}
          icon={TrendingUp}
          color="from-amber-500 to-orange-500"
          trend={t('district.monitoringClosely')}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{t('district.districtRiskTrend')}</CardTitle></CardHeader>
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
          <CardHeader><CardTitle>{t('district.populationRiskDist')}</CardTitle></CardHeader>
          <CardContent>
            <RiskDistributionChart green={stats.lowRisk} yellow={stats.mediumRisk} red={stats.highRisk} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
