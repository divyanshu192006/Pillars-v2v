import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pill, Check, Clock } from 'lucide-react';

export default function MedicinesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { medicines, pregnancies, toggleMedicineTaken } = useData();
  const pregnancy = pregnancies.find(p => p.id === user?.linkedPregnancyId);
  const myMeds = medicines.filter(m => m.pregnancyId === pregnancy?.id);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t('medicines.title')}</h2>
      {myMeds.map(m => (
        <Card key={m.id} className={m.taken ? 'opacity-70' : ''}>
          <CardContent className="flex items-center gap-4 p-5">
            <div className={`rounded-xl p-3 ${m.taken ? 'bg-emerald-100' : 'bg-primary-100'}`}>
              <Pill className={`h-6 w-6 ${m.taken ? 'text-emerald-600' : 'text-primary-600'}`} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">{m.name}</h4>
              <p className="text-sm text-gray-500">{m.dosage} · {m.frequency}</p>
              {(m as any).purpose && (
                <p className="text-xs text-blue-600 mt-0.5">📋 {(m as any).purpose}</p>
              )}
              <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                <Clock className="h-3 w-3" /> {t('medicines.reminderAt', { time: m.time })}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={m.taken ? 'green' : 'yellow'}>{m.taken ? t('medicines.taken') : t('medicines.pending')}</Badge>
              <Button size="sm" variant={m.taken ? 'outline' : 'default'} onClick={() => toggleMedicineTaken(m.id)}>
                <Check className="h-4 w-4" /> {m.taken ? t('common.undo') : t('common.markTaken')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
