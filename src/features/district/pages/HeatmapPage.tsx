import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '@/contexts/DataContext';
import { DEMO_VILLAGES } from '@/lib/demo-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VillageRiskBarChart } from '@/components/charts/RiskCharts';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

export default function HeatmapPage() {
  const { t } = useTranslation();
  const { pregnancies } = useData();

  const villageData = useMemo(() => {
    return DEMO_VILLAGES.filter(v => v.districtId === 'd1').map(v => {
      const vp = pregnancies.filter(p => p.villageId === v.id);
      return {
        name: v.name,
        red: vp.filter(p => p.riskLevel === 'RED').length,
        yellow: vp.filter(p => p.riskLevel === 'YELLOW').length,
        green: vp.filter(p => p.riskLevel === 'GREEN').length,
        total: vp.length,
        lat: v.lat,
        lng: v.lng,
      };
    });
  }, [pregnancies]);

  const maxRed = Math.max(...villageData.map(v => v.red), 1);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{t('district.heatmapTitle')}</h2>
      <p className="text-sm text-gray-500">{t('district.heatmapDesc')}</p>

      <Card>
        <CardHeader><CardTitle>{t('district.riskByVillage')}</CardTitle></CardHeader>
        <CardContent>
          <VillageRiskBarChart villages={villageData} />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {villageData.map(v => {
          const intensity = v.red / maxRed;
          return (
            <Card key={v.name} style={{ borderColor: intensity > 0.5 ? '#fca5a5' : intensity > 0 ? '#fde68a' : '#a7f3d0' }}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary-500" />
                  <h4 className="font-semibold">{v.name}</h4>
                </div>
                <p className="mt-1 text-xs text-gray-400">{v.lat.toFixed(2)}°N, {v.lng.toFixed(2)}°E</p>
                <div className="mt-3 flex gap-2">
                  <Badge variant="red">{v.red} RED</Badge>
                  <Badge variant="yellow">{v.yellow} YELLOW</Badge>
                  <Badge variant="green">{v.green} GREEN</Badge>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max(10, intensity * 100)}%`,
                      background: `linear-gradient(90deg, #10b981, ${intensity > 0.5 ? '#ef4444' : '#f59e0b'})`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
