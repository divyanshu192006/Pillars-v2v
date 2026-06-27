import { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useData } from '@/contexts/DataContext';
import { DEMO_VILLAGES } from '@/lib/demo-data';
import { PregnancyCard } from '@/components/common/PregnancyCard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { sortByRisk } from '@/lib/utils';
import type { RiskLevel } from '@/types';

export default function PriorityListPage() {
  const { t } = useTranslation();
  const { pregnancies } = useData();
  const [search, setSearch] = useState('');
  const [villageFilter, setVillageFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | ''>('');
  const [trimesterFilter, setTrimesterFilter] = useState('');

  const filtered = useMemo(() => {
    let list = sortByRisk(pregnancies);
    if (search) list = list.filter(p => p.womanName.toLowerCase().includes(search.toLowerCase()) || p.villageName.toLowerCase().includes(search.toLowerCase()));
    if (villageFilter) list = list.filter(p => p.villageId === villageFilter);
    if (riskFilter) list = list.filter(p => p.riskLevel === riskFilter);
    if (trimesterFilter) list = list.filter(p => p.trimester === parseInt(trimesterFilter));
    return list;
  }, [pregnancies, search, villageFilter, riskFilter, trimesterFilter]);

  const counts = {
    RED: filtered.filter(p => p.riskLevel === 'RED').length,
    YELLOW: filtered.filter(p => p.riskLevel === 'YELLOW').length,
    GREEN: filtered.filter(p => p.riskLevel === 'GREEN').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">{t('asha.priorityDashboard')}</h2>
        <p className="text-sm text-gray-500">{t('asha.autoSorted')}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="red">{counts.RED} {t('risk.red')}</Badge>
        <Badge variant="yellow">{counts.YELLOW} {t('common.medium')}</Badge>
        <Badge variant="green">{counts.GREEN} {t('risk.green')}</Badge>
      </div>

      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="relative">
          <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder={t('asha.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select className="rounded-xl border px-3 py-2 text-sm" value={villageFilter} onChange={e => setVillageFilter(e.target.value)}>
            <option value="">{t('asha.allVillages')}</option>
            {DEMO_VILLAGES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <select className="rounded-xl border px-3 py-2 text-sm" value={riskFilter} onChange={e => setRiskFilter(e.target.value as RiskLevel | '')}>
            <option value="">{t('asha.allRiskLevels')}</option>
            <option value="RED">RED</option>
            <option value="YELLOW">YELLOW</option>
            <option value="GREEN">GREEN</option>
          </select>
          <select className="rounded-xl border px-3 py-2 text-sm" value={trimesterFilter} onChange={e => setTrimesterFilter(e.target.value)}>
            <option value="">{t('asha.allTrimesters')}</option>
            <option value="1">{t('asha.trimesterN', { n: 1 })}</option>
            <option value="2">{t('asha.trimesterN', { n: 2 })}</option>
            <option value="3">{t('asha.trimesterN', { n: 3 })}</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(p => <PregnancyCard key={p.id} pregnancy={p} />)}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-gray-400">
          <Filter className="mx-auto h-8 w-8 mb-2" />
          {t('asha.noMatches')}
        </div>
      )}
    </div>
  );
}
