import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { notifications, markNotificationRead } = useData();

  const filtered = notifications.filter(n =>
    n.userId === user?.id || n.userId === 'all' ||
    user?.role === 'asha' || user?.role === 'phc' || user?.role === 'district'
  );

  const markAllRead = () => filtered.forEach(n => { if (!n.read) markNotificationRead(n.id); });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('notifications.title')}</h2>
        <Button variant="secondary" size="sm" onClick={markAllRead}>
          <CheckCheck className="h-4 w-4" /> {t('notifications.markAllRead')}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            <Bell className="mx-auto h-8 w-8 mb-2" />
            {t('notifications.empty')}
          </CardContent>
        </Card>
      ) : (
        filtered.map(n => (
          <Card key={n.id} className={!n.read ? 'ring-2 ring-primary-100' : 'opacity-80'}>
            <CardContent className="flex items-start gap-4 p-5">
              <div className={`rounded-xl p-2 ${n.type === 'alert' ? 'bg-red-100' : n.type === 'reminder' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                <Bell className={`h-5 w-5 ${n.type === 'alert' ? 'text-red-600' : n.type === 'reminder' ? 'text-amber-600' : 'text-blue-600'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{n.title}</h4>
                  <Badge variant="outline">{n.type}</Badge>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-primary-500" />}
                </div>
                <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                <p className="mt-2 text-xs text-gray-400">{formatDateTime(n.createdAt)}</p>
              </div>
              {!n.read && (
                <Button variant="ghost" size="sm" onClick={() => markNotificationRead(n.id)}>
                  {t('common.read')}
                </Button>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
