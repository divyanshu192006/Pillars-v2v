import { useTranslation } from 'react-i18next';
import { useData } from '@/contexts/DataContext';
import { getDemoStats } from '@/lib/demo-data';
import { StatCard } from '@/components/common/StatCard';
import { PregnancyCard } from '@/components/common/PregnancyCard';
import { RiskDistributionChart } from '@/components/charts/RiskCharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, AlertTriangle, FileText, Activity } from 'lucide-react';
import { sortByRisk } from '@/lib/utils';

export default function PhcHome() {
  const { t } = useTranslation();
  const { pregnancies, alerts, riskReports } = useData();
  const stats = getDemoStats('phc');
  const highRisk = sortByRisk(pregnancies.filter(p => p.riskLevel !== 'GREEN')).slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('phc.totalPatients')} value={stats.totalPregnancies} icon={Users} />
        <StatCard title={t('phc.highRiskCases')} value={stats.highRisk} icon={AlertTriangle} color="from-red-500 to-rose-500" />
        <StatCard title={t('phc.reportsGenerated')} value={riskReports.length} icon={FileText} />
        <StatCard title={t('phc.alertsToday')} value={stats.alertsToday} icon={Activity} color="from-amber-500 to-orange-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{t('phc.riskDistribution')}</CardTitle></CardHeader>
          <CardContent>
            <RiskDistributionChart green={stats.lowRisk} yellow={stats.mediumRisk} red={stats.highRisk} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t('phc.recentAlerts')}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {alerts.slice(0, 4).map(a => (
              <div key={a.id} className="rounded-xl bg-gray-50 p-3 text-sm">
                <p className="font-medium">{a.womanName} — {a.riskLevel}</p>
                <p className="text-xs text-gray-500 mt-1">{a.message.slice(0, 80)}...</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold">{t('phc.casesAttention')}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {highRisk.map(p => <PregnancyCard key={p.id} pregnancy={p} />)}
      </div>
    </div>
  );
}
