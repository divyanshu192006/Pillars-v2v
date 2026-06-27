import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Bell, AlertTriangle, Activity } from 'lucide-react';
import { RiskProgressionChart } from '@/components/charts/RiskCharts';
import { getRiskColor, formatDateTime } from '@/lib/utils';

export default function FamilyHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pregnancies, alerts, notifications, riskHistory } = useData();
  const pregnancy = pregnancies.find(p => p.id === user?.linkedPregnancyId) || pregnancies[0];
  const relatedAlerts = alerts.filter(a => a.pregnancyId === pregnancy?.id);
  const myNotifs = notifications.filter(n => n.userId === user?.id);
  const history = riskHistory.filter(r => r.pregnancyId === pregnancy?.id);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary-50 to-pink-50">
        <CardContent className="p-6">
          <p className="text-sm text-gray-500">{t('family.monitoringHealth')}</p>
          <h2 className="text-2xl font-bold">{pregnancy?.womanName}</h2>
          <div className={`mt-3 inline-flex rounded-xl border px-4 py-2 ${getRiskColor(pregnancy?.riskLevel || 'GREEN')}`}>
            {t('family.currentRisk')} <strong className="ml-2">{pregnancy?.riskLevel}</strong>
            <span className="ml-3">{t('risk.score')}: {pregnancy?.riskScore}/100</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title={t('family.riskLevel')} value={pregnancy?.riskLevel || '-'} icon={Heart} />
        <StatCard title={t('family.activeAlerts')} value={relatedAlerts.length} icon={Bell} color="from-red-500 to-rose-500" />
        <StatCard title={t('nav.notifications')} value={myNotifs.filter(n => !n.read).length} icon={Activity} />
      </div>

      {pregnancy?.riskLevel === 'RED' && (
        <Card className="border-red-300 bg-red-50 animate-pulse">
          <CardContent className="flex items-center gap-4 p-6">
            <AlertTriangle className="h-10 w-10 text-red-600" />
            <div>
              <p className="font-bold text-red-700">{t('sos.alertActive')}</p>
              <p className="text-sm text-red-600">{t('sos.ensureCare', { name: pregnancy.womanName })}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>{t('risk.trend')}</CardTitle></CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <RiskProgressionChart weeks={history.map(h => h.week)} scores={history.map(h => h.riskScore)} />
          ) : <p className="text-center text-gray-400 py-8">{t('common.noData')}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t('family.recentUpdates')}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {myNotifs.slice(0, 5).map(n => (
            <div key={n.id} className="rounded-xl bg-gray-50 p-4">
              <div className="flex items-center gap-2">
                <Badge variant={n.type === 'alert' ? 'red' : 'outline'}>{n.type}</Badge>
                {!n.read && <span className="h-2 w-2 rounded-full bg-primary-500" />}
              </div>
              <p className="mt-2 font-medium text-sm">{n.title}</p>
              <p className="text-xs text-gray-500">{n.message}</p>
              <p className="mt-1 text-xs text-gray-400">{formatDateTime(n.createdAt)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
