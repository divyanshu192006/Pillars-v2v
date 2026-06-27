import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getRiskColor(level: string): string {
  switch (level) {
    case 'RED': return 'risk-red';
    case 'YELLOW': return 'risk-yellow';
    default: return 'risk-green';
  }
}

export function getRiskBadgeColor(level: string): string {
  switch (level) {
    case 'RED': return 'bg-red-500';
    case 'YELLOW': return 'bg-amber-500';
    default: return 'bg-emerald-500';
  }
}

export function getTrimester(week: number): 1 | 2 | 3 {
  if (week <= 13) return 1;
  if (week <= 27) return 2;
  return 3;
}

export function sortByRisk<T extends { riskLevel: string }>(items: T[]): T[] {
  const order = { RED: 0, YELLOW: 1, GREEN: 2 };
  return [...items].sort(
    (a, b) => (order[a.riskLevel as keyof typeof order] ?? 3) - (order[b.riskLevel as keyof typeof order] ?? 3)
  );
}
