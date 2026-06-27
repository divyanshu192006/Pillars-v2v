import { Link } from 'react-router-dom';
import { Users, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useData } from '@/contexts/DataContext';
import { getDemoStats } from '@/lib/demo-data';
import { StatCard } from '@/components/common/StatCard';
import { PregnancyCard } from '@/components/common/PregnancyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sortByRisk } from '@/lib/utils';

export default function AshaHome() {
  const { t } = useTranslation();
  const { pregnancies, notifications } = useData();
  const stats = getDemoStats('asha');
  const priority = sortByRisk(pregnancies).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('asha.totalPregnancies')} value={stats.totalPregnancies} icon={Users} />
        <StatCard title={t('asha.highRiskRed')} value={stats.highRisk} icon={AlertTriangle} color="from-red-500 to-rose-500" />
        <StatCard title={t('asha.followUpsPending')} value={stats.followUpsPending} icon={Clock} color="from-amber-500 to-orange-500" />
        <StatCard title={t('asha.alertsToday')} value={stats.alertsToday} icon={CheckCircle} color="from-emerald-500 to-teal-500" />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('asha.topPriority')}</h2>
        <Link to="/dashboard/asha/priority">
          <Button variant="secondary" size="sm">{t('common.viewAll')}</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {priority.map(p => <PregnancyCard key={p.id} pregnancy={p} />)}
      </div>

      <Card>
        <CardHeader><CardTitle>{t('asha.recentActivity')}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {notifications.slice(0, 5).map(n => (
            <div key={n.id} className="flex items-start gap-3 rounded-xl bg-gray-50 p-3">
              <AlertTriangle className={`h-4 w-4 mt-0.5 ${n.type === 'alert' ? 'text-red-500' : 'text-primary-500'}`} />
              <div>
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-gray-500">{n.message}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
