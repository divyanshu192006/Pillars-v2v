import { Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard, BarChart3, FileText, Users, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import PhcHome from './pages/PhcHome';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from '@/features/shared/NotificationsPage';

export default function PhcDashboard() {
  const { t } = useTranslation();

  const nav = [
    { path: '/dashboard/phc',               label: t('nav.dashboard'),    icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: '/dashboard/phc/analytics',     label: t('nav.analytics'),    icon: <BarChart3 className="h-5 w-5" /> },
    { path: '/dashboard/phc/reports',       label: t('phc.medicalReports'),icon: <FileText className="h-5 w-5" /> },
    { path: '/dashboard/phc/patients',      label: t('phc.totalPatients'), icon: <Users className="h-5 w-5" /> },
    { path: '/dashboard/phc/notifications', label: t('nav.notifications'), icon: <Bell className="h-5 w-5" /> },
  ];

  return (
    <DashboardLayout titleKey="phc.dashboardTitle" navItems={nav}>
      <Routes>
        <Route index element={<PhcHome />} />
        <Route path="analytics"     element={<AnalyticsPage />} />
        <Route path="reports"       element={<ReportsPage />} />
        <Route path="patients"      element={<PhcHome />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="*"             element={<Navigate to="/dashboard/phc" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
