import { useTranslation } from 'react-i18next';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, Smartphone, Bell } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

const typeIcons = { email: Mail, sms: Smartphone, whatsapp: MessageSquare, in_app: Bell };

export default function AlertsPage() {
  const { t } = useTranslation();
  const { alerts } = useData();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t('alerts.title')}</h2>
      <p className="text-sm text-gray-500">{t('alerts.subtitle')}</p>

      {alerts.map(alert => {
        const Icon = typeIcons[alert.type] || Bell;
        return (
          <Card key={alert.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl p-2 ${alert.riskLevel === 'RED' ? 'bg-red-100' : 'bg-amber-100'}`}>
                    <Icon className={`h-5 w-5 ${alert.riskLevel === 'RED' ? 'text-red-600' : 'text-amber-600'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{alert.womanName}</h4>
                      <Badge variant={alert.riskLevel === 'RED' ? 'red' : 'yellow'}>{alert.riskLevel}</Badge>
                      <Badge variant="outline">{alert.type.toUpperCase()}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
                    <p className="mt-1 text-xs text-gray-400">{formatDateTime(alert.createdAt)}</p>
                  </div>
                </div>
                <Badge variant={alert.status === 'delivered' ? 'green' : alert.status === 'failed' ? 'red' : 'yellow'}>
                  {alert.status}
                </Badge>
              </div>

              <div className="mt-4 border-t pt-3">
                <p className="text-xs font-medium text-gray-500 mb-2">{t('alerts.recipients')}</p>
                <div className="space-y-2">
                  {alert.recipients.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span>{r.name} ({r.role}) — {r.contact}</span>
                      <Badge variant={r.status === 'delivered' ? 'green' : 'outline'}>{r.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Card className="border-dashed">
        <CardContent className="p-6 text-center text-sm text-gray-500">
          <MessageSquare className="mx-auto h-8 w-8 mb-2 text-gray-300" />
          {t('alerts.smsReady')}
        </CardContent>
      </Card>
    </div>
  );
}
