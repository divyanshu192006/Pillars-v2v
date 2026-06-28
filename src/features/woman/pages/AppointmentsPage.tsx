import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function AppointmentsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { appointments, pregnancies } = useData();
  const pregnancy = pregnancies.find(p => p.id === user?.linkedPregnancyId);
  const myAppts = appointments.filter(a => a.pregnancyId === pregnancy?.id);

  const statusIcon = { upcoming: Clock, completed: CheckCircle, missed: XCircle };
  const statusVariant = { upcoming: 'default' as const, completed: 'green' as const, missed: 'red' as const };

  const statusLabel = (s: string) => {
    if (s === 'upcoming') return t('appointments.upcoming');
    if (s === 'completed') return t('appointments.completed');
    return t('appointments.missed');
  };

  const sectionLabel = (s: string) => {
    if (s === 'upcoming') return t('appointments.upcomingVisits');
    if (s === 'completed') return t('appointments.completedVisits');
    return t('appointments.missedVisits');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t('appointments.title')}</h2>
      {(['upcoming', 'completed', 'missed'] as const).map(status => {
        const filtered = myAppts.filter(a => a.status === status);
        if (!filtered.length) return null;
        return (
          <div key={status}>
            <h3 className="mb-3 text-sm font-semibold text-gray-500">{sectionLabel(status)}</h3>
            <div className="space-y-3">
              {filtered.map(a => {
                const Icon = statusIcon[a.status];
                return (
                  <Card key={a.id}>
                    <CardContent className="flex items-start gap-4 p-5">
                      <div className={`rounded-xl p-3 ${a.status === 'upcoming' ? 'bg-blue-100' : a.status === 'completed' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        <Icon className={`h-5 w-5 ${a.status === 'upcoming' ? 'text-blue-600' : a.status === 'completed' ? 'text-emerald-600' : 'text-red-600'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{a.title}</h4>
                          <Badge variant={statusVariant[a.status]}>{a.type}</Badge>
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-3.5 w-3.5" />{formatDateTime(a.date)}
                        </p>
                        <p className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-3.5 w-3.5" />{a.location}
                        </p>
                        {a.notes && <p className="mt-2 text-xs text-blue-600 bg-blue-50 rounded-lg px-2 py-1">📋 {a.notes}</p>}
                      </div>
                      <Badge variant={statusVariant[a.status]}>{statusLabel(a.status)}</Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
