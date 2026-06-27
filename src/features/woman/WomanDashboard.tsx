// v2 - grouped nav with illustrations
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardCheck, Heart, Stethoscope,
  MessageCircle, AlertTriangle, Bell, TrendingUp,
  BookOpen, Utensils, FileText, Pill, Calendar,
  MapPin, Upload, Activity,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { NavGroup } from '@/components/layout/DashboardLayout';
import WomanHome from './pages/WomanHome';
import DailyCheckInPage from './pages/DailyCheckInPage';
import PredictiveRiskPage from './pages/PredictiveRiskPage';
import DigitalTwinPage from './pages/DigitalTwinPage';
import PregnancyHubPage from './pages/PregnancyHubPage';
import MedicalCenterPage from './pages/MedicalCenterPage';
import AssistantPage from './pages/AssistantPage';
import EmergencyPage from './pages/EmergencyPage';
import NotificationsPage from '@/features/shared/NotificationsPage';

export default function WomanDashboard() {
  const { t } = useTranslation();

  const nav: NavGroup[] = [
    {
      label: t('nav.home'),
      icon: <LayoutDashboard className="h-4 w-4" />,
      path: '/dashboard/woman',
      direct: true,
    },
    {
      label: t('nav.dailyHealth'),
      icon: <ClipboardCheck className="h-4 w-4" />,
      children: [
        { path: '/dashboard/woman/checkin',      label: t('nav.dailyCheckin'),    icon: <ClipboardCheck className="h-3.5 w-3.5" /> },
        { path: '/dashboard/woman/predict',       label: t('nav.aiRiskForecast'), icon: <TrendingUp className="h-3.5 w-3.5" /> },
        { path: '/dashboard/woman/digital-twin',  label: t('nav.healthTwin'),     icon: <Activity className="h-3.5 w-3.5" /> },
      ],
    },
    {
      label: t('nav.pregnancyJourney'),
      icon: <Heart className="h-4 w-4" />,
      children: [
        { path: '/dashboard/woman/journey',    label: t('nav.timelineCalendar'), icon: <Heart className="h-3.5 w-3.5" /> },
        { path: '/dashboard/woman/knowledge',  label: t('nav.knowledgeHub'),     icon: <BookOpen className="h-3.5 w-3.5" /> },
        { path: '/dashboard/woman/nutrition',  label: t('nav.nutritionPlanner'), icon: <Utensils className="h-3.5 w-3.5" /> },
      ],
    },
    {
      label: t('nav.medicalCenter'),
      icon: <Stethoscope className="h-4 w-4" />,
      children: [
        { path: '/dashboard/woman/medical?tab=reports',      label: t('nav.healthReports'),  icon: <FileText className="h-3.5 w-3.5" /> },
        { path: '/dashboard/woman/medical?tab=analyzer',     label: t('nav.reportAnalyzer'), icon: <Upload className="h-3.5 w-3.5" /> },
        { path: '/dashboard/woman/medical?tab=medicines',    label: t('nav.medicines'),      icon: <Pill className="h-3.5 w-3.5" /> },
        { path: '/dashboard/woman/medical?tab=appointments', label: t('nav.appointments'),   icon: <Calendar className="h-3.5 w-3.5" /> },
      ],
    },
    {
      label: t('nav.assistant'),
      icon: <MessageCircle className="h-4 w-4" />,
      path: '/dashboard/woman/assistant',
      direct: true,
    },
    {
      label: t('nav.emergencyHospitals'),
      icon: <AlertTriangle className="h-4 w-4" />,
      children: [
        { path: '/dashboard/woman/emergency?tab=sos',       label: t('nav.sosAlerts'),   icon: <AlertTriangle className="h-3.5 w-3.5" /> },
        { path: '/dashboard/woman/emergency?tab=hospitals', label: t('nav.findHospital'), icon: <MapPin className="h-3.5 w-3.5" /> },
      ],
    },
    {
      label: t('nav.notifications'),
      icon: <Bell className="h-4 w-4" />,
      path: '/dashboard/woman/notifications',
      direct: true,
    },
  ];

  return (
    <DashboardLayout titleKey="woman.dashboardTitle" navItems={nav}>
      <Routes>
        <Route index                  element={<WomanHome />} />
        <Route path="checkin"         element={<DailyCheckInPage />} />
        <Route path="voice"           element={<DailyCheckInPage />} />
        <Route path="predict"         element={<PredictiveRiskPage />} />
        <Route path="digital-twin"    element={<DigitalTwinPage />} />
        <Route path="journey"         element={<PregnancyHubPage />} />
        <Route path="knowledge"       element={<PregnancyHubPage defaultTab="knowledge" />} />
        <Route path="nutrition"       element={<PregnancyHubPage defaultTab="nutrition" />} />
        <Route path="medical"         element={<MedicalCenterPage />} />
        <Route path="assistant"       element={<AssistantPage />} />
        <Route path="emergency"       element={<EmergencyPage />} />
        <Route path="hospitals"       element={<EmergencyPage defaultTab="hospitals" />} />
        <Route path="notifications"   element={<NotificationsPage />} />
        {/* Backwards compat aliases */}
        <Route path="appointments"    element={<MedicalCenterPage defaultTab="appointments" />} />
        <Route path="medicines"       element={<MedicalCenterPage defaultTab="medicines" />} />
        <Route path="reports"         element={<MedicalCenterPage defaultTab="reports" />} />
        <Route path="report-analyzer" element={<MedicalCenterPage defaultTab="analyzer" />} />
        <Route path="high-risk"       element={<MedicalCenterPage defaultTab="reports" />} />
        <Route path="*"               element={<Navigate to="/dashboard/woman" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
