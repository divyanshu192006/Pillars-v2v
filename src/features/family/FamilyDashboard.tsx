import { Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard, Bell, Heart, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import FamilyHome from './pages/FamilyHome';
import AlertsPage from './pages/AlertsPage';
import NotificationsPage from '@/features/shared/NotificationsPage';

export default function FamilyDashboard() {
  const { t } = useTranslation();

  const nav = [
    { path: '/dashboard/family',               label: t('nav.dashboard'),    icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: '/dashboard/family/alerts',        label: t('nav.alerts'),       icon: <Bell className="h-5 w-5" /> },
    { path: '/dashboard/family/health',        label: t('nav.reports'),      icon: <Heart className="h-5 w-5" /> },
    { path: '/dashboard/family/notifications', label: t('nav.notifications'),icon: <FileText className="h-5 w-5" /> },
  ];

  return (
    <DashboardLayout titleKey="family.dashboardTitle" navItems={nav}>
      <Routes>
        <Route index element={<FamilyHome />} />
        <Route path="alerts"        element={<AlertsPage />} />
        <Route path="health"        element={<FamilyHome />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="*"             element={<Navigate to="/dashboard/family" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
