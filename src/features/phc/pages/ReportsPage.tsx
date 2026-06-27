import { useTranslation } from 'react-i18next';
import { useData } from '@/contexts/DataContext';
import { getDemoMedicalReport } from '@/lib/demo-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { getRiskColor } from '@/lib/utils';

export default function ReportsPage() {
  const { t } = useTranslation();
  const { pregnancies } = useData();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t('phc.medicalReports')}</h2>
      {pregnancies.map(p => {
        getDemoMedicalReport(p.id); // keep call for side-effects / data prep
        return (
          <Card key={p.id}>
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8 text-primary-500" />
                <div>
                  <h4 className="font-semibold">{p.womanName}</h4>
                  <p className="text-sm text-gray-500">{p.villageName} · {t('common.week')} {p.gestationalWeek}</p>
                  <div className={`mt-1 inline-flex rounded-lg border px-2 py-0.5 text-xs ${getRiskColor(p.riskLevel)}`}>{p.riskLevel}</div>
                </div>
              </div>
              <Button variant="secondary" size="sm"><Download className="h-4 w-4" /> {t('reports.viewReport')}</Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
