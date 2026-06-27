import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
  trend?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, color = 'from-primary-500 to-pink-500', trend }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
          {trend && <p className="mt-2 text-xs font-medium text-emerald-600">{trend}</p>}
        </div>
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg', color)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}
