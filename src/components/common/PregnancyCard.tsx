import { Badge } from '@/components/ui/badge';
import { cn, formatDateTime, getRiskColor } from '@/lib/utils';
import type { Pregnancy } from '@/types';
import { MapPin, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface PregnancyCardProps {
  pregnancy: Pregnancy;
  onClick?: () => void;
  showActions?: boolean;
}

export function PregnancyCard({ pregnancy, onClick }: PregnancyCardProps) {
  const { t } = useTranslation();
  const riskVariant = pregnancy.riskLevel === 'RED' ? 'red' : pregnancy.riskLevel === 'YELLOW' ? 'yellow' : 'green';

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        'glass-card cursor-pointer rounded-2xl p-5 transition-shadow hover:shadow-2xl',
        pregnancy.riskLevel === 'RED' && 'ring-2 ring-red-200'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{pregnancy.womanName}</h3>
            {pregnancy.isHighRisk && <AlertTriangle className="h-4 w-4 text-red-500" />}
          </div>
          <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5" />
            {pregnancy.villageName}
          </div>
        </div>
        <Badge variant={riskVariant}>{pregnancy.riskLevel}</Badge>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-gray-50 p-2.5 text-center">
          <p className="text-xs text-gray-500">{t('pregnancyCard.week')}</p>
          <p className="text-lg font-bold text-primary-600">{pregnancy.gestationalWeek}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-2.5 text-center">
          <p className="text-xs text-gray-500">{t('pregnancyCard.score')}</p>
          <p className="text-lg font-bold">{pregnancy.riskScore}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-2.5 text-center">
          <p className="text-xs text-gray-500">{t('pregnancyCard.trimester')}</p>
          <p className="text-lg font-bold">T{pregnancy.trimester}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
        <Clock className="h-3 w-3" />
        {t('pregnancyCard.lastReport')} {formatDateTime(pregnancy.lastReportAt)}
      </div>

      {pregnancy.bloodPressure && (
        <div className={cn('mt-2 inline-flex rounded-lg border px-2 py-1 text-xs font-medium', getRiskColor(pregnancy.riskLevel))}>
          BP: {pregnancy.bloodPressure}
        </div>
      )}
    </motion.div>
  );
}
