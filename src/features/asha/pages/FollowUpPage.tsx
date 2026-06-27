import { useTranslation } from 'react-i18next';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, MapPin, Phone } from 'lucide-react';
import { formatDateTime, getRiskColor } from '@/lib/utils';

export default function FollowUpPage() {
  const { t } = useTranslation();
  const { pregnancies } = useData();
  const needsFollowUp = pregnancies.filter(p => p.riskLevel !== 'GREEN');

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t('asha.followUpTitle')}</h2>
      <p className="text-sm text-gray-500">{t('asha.casesRequiring', { count: needsFollowUp.length })}</p>

      {needsFollowUp.map(p => (
        <Card key={p.id}>
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{p.womanName}</h4>
                  <Badge variant={p.riskLevel === 'RED' ? 'red' : 'yellow'}>{p.riskLevel}</Badge>
                </div>
                <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />{p.villageName} · {t('common.week')} {p.gestationalWeek}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />{t('pregnancyCard.lastReport')} {formatDateTime(p.lastReportAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm"><Phone className="h-4 w-4" /> {t('common.call')}</Button>
                <Button size="sm"><CheckCircle className="h-4 w-4" /> {t('common.markVisited')}</Button>
              </div>
            </div>
            <div className={`mt-3 rounded-lg border px-3 py-2 text-xs ${getRiskColor(p.riskLevel)}`}>
              {p.riskLevel === 'RED' ? t('asha.urgentVisit') : t('asha.scheduleVisit')}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
