import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type {
  Pregnancy, Symptom, RiskReport, Alert, Notification,
  Appointment, MedicineReminder, RiskHistoryEntry, DailyEntry,
} from '@/types';
import {
  DEMO_PREGNANCIES, DEMO_SYMPTOMS, DEMO_RISK_REPORTS, DEMO_ALERTS,
  DEMO_NOTIFICATIONS, DEMO_APPOINTMENTS, DEMO_MEDICINES, DEMO_RISK_HISTORY,
} from '@/lib/demo-data';

interface DataContextType {
  pregnancies: Pregnancy[];
  symptoms: Symptom[];
  riskReports: RiskReport[];
  alerts: Alert[];
  notifications: Notification[];
  appointments: Appointment[];
  medicines: MedicineReminder[];
  riskHistory: RiskHistoryEntry[];
  dailyEntries: DailyEntry[];
  addSymptom: (symptom: Symptom) => void;
  addRiskReport: (report: RiskReport) => void;
  addAlert: (alert: Alert) => void;
  addNotification: (notification: Notification) => void;
  updatePregnancyRisk: (pregnancyId: string, level: string, score: number) => void;
  markNotificationRead: (id: string) => void;
  toggleMedicineTaken: (id: string) => void;
  triggerSOS: (pregnancyId: string) => void;
  addDailyEntry: (entry: DailyEntry) => void;
  getDailyEntry: (pregnancyId: string, date: string) => DailyEntry | undefined;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [pregnancies, setPregnancies] = useState(DEMO_PREGNANCIES);
  const [symptoms, setSymptoms] = useState(DEMO_SYMPTOMS);
  const [riskReports, setRiskReports] = useState(DEMO_RISK_REPORTS);
  const [alerts, setAlerts] = useState(DEMO_ALERTS);
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [appointments] = useState(DEMO_APPOINTMENTS);
  const [medicines, setMedicines] = useState(DEMO_MEDICINES);
  const [riskHistory, setRiskHistory] = useState(DEMO_RISK_HISTORY);
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);

  const addSymptom = useCallback((symptom: Symptom) => {
    setSymptoms(prev => [symptom, ...prev]);
  }, []);

  const addRiskReport = useCallback((report: RiskReport) => {
    setRiskReports(prev => [report, ...prev]);
    setRiskHistory(prev => [...prev, {
      id: `rh-${Date.now()}`,
      pregnancyId: report.pregnancyId,
      week: report.gestationalWeek,
      riskLevel: report.riskLevel,
      riskScore: report.riskScore,
      date: new Date().toISOString().split('T')[0],
    }]);
  }, []);

  const addAlert = useCallback((alert: Alert) => {
    setAlerts(prev => [alert, ...prev]);
  }, []);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  }, []);

  const updatePregnancyRisk = useCallback((pregnancyId: string, level: string, score: number) => {
    setPregnancies(prev => prev.map(p =>
      p.id === pregnancyId
        ? { ...p, riskLevel: level as Pregnancy['riskLevel'], riskScore: score, isHighRisk: level === 'RED', lastReportAt: new Date().toISOString() }
        : p
    ));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const toggleMedicineTaken = useCallback((id: string) => {
    setMedicines(prev => prev.map(m =>
      m.id === id ? { ...m, taken: !m.taken, lastTakenAt: !m.taken ? new Date().toISOString() : m.lastTakenAt } : m
    ));
  }, []);

  const triggerSOS = useCallback((pregnancyId: string) => {
    const pregnancy = pregnancies.find(p => p.id === pregnancyId);
    if (!pregnancy) return;

    const alert: Alert = {
      id: `sos-${Date.now()}`,
      pregnancyId,
      womanName: pregnancy.womanName,
      riskLevel: 'RED',
      type: 'in_app',
      recipients: [{ name: 'Emergency Services', role: 'SOS', contact: '108', status: 'sent' }],
      message: `SOS ACTIVATED: ${pregnancy.womanName} (${pregnancy.villageName}) needs immediate emergency assistance.`,
      status: 'sent',
      createdAt: new Date().toISOString(),
    };
    setAlerts(prev => [alert, ...prev]);
    setPregnancies(prev => prev.map(p =>
      p.id === pregnancyId ? { ...p, riskLevel: 'RED', riskScore: 99, isHighRisk: true } : p
    ));
    setNotifications(prev => [{
      id: `n-sos-${Date.now()}`,
      userId: 'all',
      title: '🚨 EMERGENCY SOS',
      message: `${pregnancy.womanName} activated emergency SOS in ${pregnancy.villageName}`,
      type: 'alert',
      read: false,
      createdAt: new Date().toISOString(),
    }, ...prev]);
  }, [pregnancies]);

  const addDailyEntry = useCallback((entry: DailyEntry) => {
    setDailyEntries(prev => {
      // Replace existing entry for same date+pregnancy, or add new
      const exists = prev.findIndex(e => e.pregnancyId === entry.pregnancyId && e.date === entry.date);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = entry;
        return updated;
      }
      return [entry, ...prev];
    });
  }, []);

  const getDailyEntry = useCallback((pregnancyId: string, date: string) => {
    return dailyEntries.find(e => e.pregnancyId === pregnancyId && e.date === date);
  }, [dailyEntries]);

  return (
    <DataContext.Provider value={{
      pregnancies, symptoms, riskReports, alerts, notifications,
      appointments, medicines, riskHistory, dailyEntries,
      addSymptom, addRiskReport, addAlert, addNotification,
      updatePregnancyRisk, markNotificationRead, toggleMedicineTaken, triggerSOS,
      addDailyEntry, getDailyEntry,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
