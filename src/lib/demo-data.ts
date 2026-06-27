import type {
  User, District, Village, Pregnancy, Symptom, RiskReport,
  Alert, Notification, Appointment, MedicineReminder, MedicalReport,
  RiskHistoryEntry, AnalyticsSnapshot, DashboardStats,
} from '@/types';

export const DEMO_USERS: User[] = [
  { id: 'u1', email: 'priya@demo.com', name: 'Priya Sharma', role: 'woman', phone: '+91 98765 43210', villageId: 'v1', districtId: 'd1', linkedPregnancyId: 'p1', language: 'hi', createdAt: '2025-01-15T00:00:00Z' },
  { id: 'u2', email: 'lakshmi@demo.com', name: 'Lakshmi Devi', role: 'asha', phone: '+91 98765 43211', villageId: 'v1', districtId: 'd1', phcId: 'phc1', language: 'hi', createdAt: '2024-06-01T00:00:00Z' },
  { id: 'u3', email: 'rajesh@demo.com', name: 'Rajesh Sharma', role: 'family', phone: '+91 98765 43212', villageId: 'v1', districtId: 'd1', linkedPregnancyId: 'p1', language: 'hi', createdAt: '2025-01-15T00:00:00Z' },
  { id: 'u4', email: 'meera@demo.com', name: 'Dr. Meera Patel', role: 'phc', phone: '+91 98765 43213', districtId: 'd1', phcId: 'phc1', language: 'en', createdAt: '2023-01-01T00:00:00Z' },
  { id: 'u5', email: 'anil@demo.com', name: 'Dr. Anil Kumar', role: 'district', phone: '+91 98765 43214', districtId: 'd1', language: 'en', createdAt: '2022-01-01T00:00:00Z' },
];

export const DEMO_DISTRICTS: District[] = [
  { id: 'd1', name: 'Jaipur Rural', state: 'Rajasthan', population: 450000 },
  { id: 'd2', name: 'Alwar', state: 'Rajasthan', population: 320000 },
];

export const DEMO_VILLAGES: Village[] = [
  { id: 'v1', name: 'Bassi', districtId: 'd1', population: 8500, lat: 26.85, lng: 75.95 },
  { id: 'v2', name: 'Chomu', districtId: 'd1', population: 12000, lat: 27.15, lng: 75.72 },
  { id: 'v3', name: 'Sanganer', districtId: 'd1', population: 15000, lat: 26.82, lng: 75.80 },
  { id: 'v4', name: 'Amer', districtId: 'd1', population: 9200, lat: 26.99, lng: 75.85 },
  { id: 'v5', name: 'Mansarovar', districtId: 'd1', population: 18000, lat: 26.87, lng: 75.77 },
  { id: 'v6', name: 'Kotputli', districtId: 'd2', population: 11000, lat: 27.70, lng: 76.20 },
];

export const DEMO_PREGNANCIES: Pregnancy[] = [
  { id: 'p1', womanId: 'u1', womanName: 'Priya Sharma', villageId: 'v1', villageName: 'Bassi', districtId: 'd1', ashaWorkerId: 'u2', familyMemberIds: ['u3'], gestationalWeek: 28, dueDate: '2026-08-15', trimester: 3, riskLevel: 'YELLOW', riskScore: 62, isHighRisk: false, lastReportAt: '2026-06-22T10:30:00Z', bloodPressure: '138/88', previousComplications: ['Gestational diabetes (prior)'], createdAt: '2025-12-01T00:00:00Z' },
  { id: 'p2', womanId: 'w2', womanName: 'Sunita Meena', villageId: 'v2', villageName: 'Chomu', districtId: 'd1', ashaWorkerId: 'u2', familyMemberIds: [], gestationalWeek: 34, dueDate: '2026-07-20', trimester: 3, riskLevel: 'RED', riskScore: 89, isHighRisk: true, lastReportAt: '2026-06-23T08:00:00Z', bloodPressure: '158/102', previousComplications: ['Preeclampsia history'], createdAt: '2025-10-15T00:00:00Z' },
  { id: 'p3', womanId: 'w3', womanName: 'Kavita Joshi', villageId: 'v1', villageName: 'Bassi', districtId: 'd1', ashaWorkerId: 'u2', familyMemberIds: [], gestationalWeek: 22, dueDate: '2026-10-28', trimester: 2, riskLevel: 'GREEN', riskScore: 18, isHighRisk: false, lastReportAt: '2026-06-20T14:00:00Z', bloodPressure: '118/76', createdAt: '2026-01-20T00:00:00Z' },
  { id: 'p4', womanId: 'w4', womanName: 'Rekha Devi', villageId: 'v3', villageName: 'Sanganer', districtId: 'd1', ashaWorkerId: 'u2', familyMemberIds: [], gestationalWeek: 36, dueDate: '2026-07-05', trimester: 3, riskLevel: 'RED', riskScore: 92, isHighRisk: true, lastReportAt: '2026-06-23T06:30:00Z', bloodPressure: '162/105', previousComplications: ['Anemia', 'Previous C-section'], createdAt: '2025-09-01T00:00:00Z' },
  { id: 'p5', womanId: 'w5', womanName: 'Anita Kumari', villageId: 'v4', villageName: 'Amer', districtId: 'd1', ashaWorkerId: 'u2', familyMemberIds: [], gestationalWeek: 16, dueDate: '2026-12-10', trimester: 2, riskLevel: 'GREEN', riskScore: 12, isHighRisk: false, lastReportAt: '2026-06-18T11:00:00Z', bloodPressure: '112/72', createdAt: '2026-02-28T00:00:00Z' },
  { id: 'p6', womanId: 'w6', womanName: 'Meena Bai', villageId: 'v2', villageName: 'Chomu', districtId: 'd1', ashaWorkerId: 'u2', familyMemberIds: [], gestationalWeek: 30, dueDate: '2026-08-01', trimester: 3, riskLevel: 'YELLOW', riskScore: 55, isHighRisk: false, lastReportAt: '2026-06-21T09:00:00Z', bloodPressure: '132/86', createdAt: '2025-11-10T00:00:00Z' },
  { id: 'p7', womanId: 'w7', womanName: 'Pooja Singh', villageId: 'v5', villageName: 'Mansarovar', districtId: 'd1', ashaWorkerId: 'u2', familyMemberIds: [], gestationalWeek: 8, dueDate: '2027-01-15', trimester: 1, riskLevel: 'GREEN', riskScore: 8, isHighRisk: false, lastReportAt: '2026-06-19T16:00:00Z', bloodPressure: '110/70', createdAt: '2026-04-20T00:00:00Z' },
  { id: 'p8', womanId: 'w8', womanName: 'Geeta Sharma', villageId: 'v1', villageName: 'Bassi', districtId: 'd1', ashaWorkerId: 'u2', familyMemberIds: [], gestationalWeek: 38, dueDate: '2026-06-28', trimester: 3, riskLevel: 'YELLOW', riskScore: 68, isHighRisk: true, lastReportAt: '2026-06-22T18:00:00Z', bloodPressure: '142/90', previousComplications: ['Advanced maternal age'], createdAt: '2025-09-20T00:00:00Z' },
];

export const DEMO_SYMPTOMS: Symptom[] = [
  { id: 's1', pregnancyId: 'p1', womanId: 'u1', description: 'Severe headache and swelling in feet since morning', extractedSymptoms: ['Severe headache', 'Oedema (swelling)', 'Dizziness'], language: 'en', transcription: 'I have a very bad headache since morning and my feet are very swollen', source: 'voice', createdAt: '2026-06-22T10:30:00Z' },
  { id: 's2', pregnancyId: 'p2', womanId: 'w2', description: 'Reduced fetal movement and blurred vision', extractedSymptoms: ['Reduced fetal movement', 'Blurred vision', 'High BP symptoms'], language: 'hi', transcription: 'बच्चे की हलचल कम हो गई है और आंखों में धुंधला दिख रहा है', source: 'voice', createdAt: '2026-06-23T08:00:00Z' },
];

export const DEMO_RISK_REPORTS: RiskReport[] = [
  { id: 'r1', pregnancyId: 'p1', womanId: 'u1', riskLevel: 'YELLOW', riskScore: 62, riskFactors: ['Elevated blood pressure (138/88)', 'Oedema reported', 'Severe headache', 'Previous gestational diabetes'], clinicalReasoning: 'Combination of headache, swelling, and borderline hypertension at 28 weeks warrants close monitoring. Previous GDM increases metabolic risk profile.', suggestedAction: 'Schedule BP check within 24 hours. Monitor for preeclampsia signs.', followUpRecommendation: 'ASHA visit within 48 hours. PHC referral if BP >140/90.', symptoms: ['Severe headache', 'Oedema', 'Dizziness'], gestationalWeek: 28, createdAt: '2026-06-22T10:35:00Z' },
  { id: 'r2', pregnancyId: 'p2', womanId: 'w2', riskLevel: 'RED', riskScore: 89, riskFactors: ['Severely elevated BP (158/102)', 'Reduced fetal movement', 'Preeclampsia history', '34 weeks gestation'], clinicalReasoning: 'Critical presentation: reduced fetal movement with severe hypertension in third trimester with preeclampsia history. Immediate medical evaluation required.', suggestedAction: 'URGENT: Refer to district hospital immediately. Do not delay.', followUpRecommendation: 'Emergency transport arranged. Notify PHC and family immediately.', symptoms: ['Reduced fetal movement', 'Blurred vision', 'High BP'], gestationalWeek: 34, createdAt: '2026-06-23T08:05:00Z' },
];

export const DEMO_ALERTS: Alert[] = [
  { id: 'a1', pregnancyId: 'p2', womanName: 'Sunita Meena', riskLevel: 'RED', type: 'email', recipients: [{ name: 'Rajesh Meena', role: 'Family', contact: 'rajesh.m@email.com', status: 'delivered' }, { name: 'Dr. Meera Patel', role: 'PHC', contact: 'meera@phc.gov.in', status: 'delivered' }], message: 'URGENT: Sunita Meena (Chomu) flagged RED risk - reduced fetal movement, BP 158/102. Immediate referral required.', status: 'delivered', createdAt: '2026-06-23T08:10:00Z' },
  { id: 'a2', pregnancyId: 'p4', womanName: 'Rekha Devi', riskLevel: 'RED', type: 'email', recipients: [{ name: 'Family Contact', role: 'Family', contact: 'family@email.com', status: 'sent' }], message: 'URGENT: Rekha Devi (Sanganer) flagged RED risk - BP 162/105, anemia. Refer to PHC immediately.', status: 'sent', createdAt: '2026-06-23T06:35:00Z' },
];

export const DEMO_NOTIFICATIONS: Notification[] = [
  { id: 'n1', userId: 'u1', title: 'Risk Assessment Updated', message: 'Your risk level is YELLOW. ASHA Lakshmi will visit within 48 hours.', type: 'alert', read: false, createdAt: '2026-06-22T10:35:00Z' },
  { id: 'n2', userId: 'u1', title: 'Medicine Reminder', message: 'Time to take Iron + Folic Acid supplement', type: 'reminder', read: false, createdAt: '2026-06-23T08:00:00Z' },
  { id: 'n3', userId: 'u1', title: 'ANC Appointment', message: 'Your ANC visit is scheduled for June 25 at Bassi PHC', type: 'appointment', read: true, createdAt: '2026-06-20T09:00:00Z' },
  { id: 'n4', userId: 'u2', title: 'Priority Alert', message: 'Sunita Meena (RED) needs immediate follow-up in Chomu', type: 'alert', read: false, createdAt: '2026-06-23T08:10:00Z' },
  { id: 'n5', userId: 'u3', title: 'Family Alert', message: 'Priya\'s health report shows YELLOW risk. Please ensure she rests and takes medicines.', type: 'alert', read: false, createdAt: '2026-06-22T10:40:00Z' },
];

export const DEMO_APPOINTMENTS: Appointment[] = [
  { id: 'ap1', pregnancyId: 'p1', womanId: 'u1', type: 'ANC', title: 'ANC Visit - Week 28', date: '2026-06-25T10:00:00Z', status: 'upcoming', location: 'Bassi PHC' },
  { id: 'ap2', pregnancyId: 'p1', womanId: 'u1', type: 'lab', title: 'Blood Test & Urine Analysis', date: '2026-06-25T10:30:00Z', status: 'upcoming', location: 'Bassi PHC Lab' },
  { id: 'ap3', pregnancyId: 'p1', womanId: 'u1', type: 'ANC', title: 'ANC Visit - Week 24', date: '2026-05-28T10:00:00Z', status: 'completed', location: 'Bassi PHC' },
  { id: 'ap4', pregnancyId: 'p1', womanId: 'u1', type: 'ultrasound', title: 'Anomaly Scan', date: '2026-04-15T11:00:00Z', status: 'completed', location: 'Jaipur District Hospital' },
  { id: 'ap5', pregnancyId: 'p1', womanId: 'u1', type: 'ANC', title: 'ANC Visit - Week 20', date: '2026-04-30T10:00:00Z', status: 'missed', location: 'Bassi PHC', notes: 'Rescheduled due to transport issues' },
];

export const DEMO_MEDICINES: MedicineReminder[] = [
  { id: 'm1', pregnancyId: 'p1', womanId: 'u1', name: 'Iron + Folic Acid', dosage: '1 tablet', frequency: 'Daily', time: '08:00', taken: false },
  { id: 'm2', pregnancyId: 'p1', womanId: 'u1', name: 'Calcium Supplement', dosage: '1 tablet', frequency: 'Daily', time: '20:00', taken: true, lastTakenAt: '2026-06-22T20:05:00Z' },
  { id: 'm3', pregnancyId: 'p1', womanId: 'u1', name: 'Vitamin D3', dosage: '1 capsule', frequency: 'Weekly', time: '09:00', taken: false },
];

export const DEMO_RISK_HISTORY: RiskHistoryEntry[] = [
  { id: 'rh1', pregnancyId: 'p1', week: 12, riskLevel: 'GREEN', riskScore: 10, date: '2026-03-01' },
  { id: 'rh2', pregnancyId: 'p1', week: 16, riskLevel: 'GREEN', riskScore: 15, date: '2026-03-29' },
  { id: 'rh3', pregnancyId: 'p1', week: 20, riskLevel: 'GREEN', riskScore: 22, date: '2026-04-26' },
  { id: 'rh4', pregnancyId: 'p1', week: 24, riskLevel: 'YELLOW', riskScore: 45, date: '2026-05-24' },
  { id: 'rh5', pregnancyId: 'p1', week: 28, riskLevel: 'YELLOW', riskScore: 62, date: '2026-06-22' },
];

export const DEMO_ANALYTICS: AnalyticsSnapshot[] = [
  { id: 'an1', districtId: 'd1', week: '2026-W20', greenCount: 45, yellowCount: 12, redCount: 3, totalPregnancies: 60 },
  { id: 'an2', districtId: 'd1', week: '2026-W21', greenCount: 44, yellowCount: 13, redCount: 4, totalPregnancies: 61 },
  { id: 'an3', districtId: 'd1', week: '2026-W22', greenCount: 43, yellowCount: 14, redCount: 4, totalPregnancies: 61 },
  { id: 'an4', districtId: 'd1', week: '2026-W23', greenCount: 42, yellowCount: 15, redCount: 5, totalPregnancies: 62 },
  { id: 'an5', districtId: 'd1', week: '2026-W24', greenCount: 41, yellowCount: 16, redCount: 5, totalPregnancies: 62 },
  { id: 'an6', districtId: 'd1', week: '2026-W25', greenCount: 40, yellowCount: 17, redCount: 6, totalPregnancies: 63 },
];

export function getDemoStats(role: string, userId?: string): DashboardStats {
  const pregnancies = DEMO_PREGNANCIES;
  return {
    totalPregnancies: pregnancies.length,
    highRisk: pregnancies.filter(p => p.riskLevel === 'RED').length,
    mediumRisk: pregnancies.filter(p => p.riskLevel === 'YELLOW').length,
    lowRisk: pregnancies.filter(p => p.riskLevel === 'GREEN').length,
    alertsToday: DEMO_ALERTS.filter(a => a.createdAt.startsWith('2026-06-23')).length,
    appointmentsDue: DEMO_APPOINTMENTS.filter(a => a.status === 'upcoming').length,
    followUpsPending: pregnancies.filter(p => p.riskLevel !== 'GREEN').length,
  };
}

export function getDemoMedicalReport(pregnancyId: string): MedicalReport {
  const pregnancy = DEMO_PREGNANCIES.find(p => p.id === pregnancyId) || DEMO_PREGNANCIES[0];
  const reports = DEMO_RISK_REPORTS.filter(r => r.pregnancyId === pregnancyId);
  return {
    id: `mr-${pregnancyId}`,
    pregnancyId,
    womanId: pregnancy.womanId,
    patientProfile: {
      Name: pregnancy.womanName,
      Village: pregnancy.villageName,
      'Gestational Week': `${pregnancy.gestationalWeek}`,
      'Due Date': pregnancy.dueDate,
      'Blood Pressure': pregnancy.bloodPressure || 'N/A',
      Trimester: `${pregnancy.trimester}`,
    },
    symptoms: DEMO_SYMPTOMS.filter(s => s.pregnancyId === pregnancyId).flatMap(s => s.extractedSymptoms),
    riskFactors: reports[0]?.riskFactors || [],
    riskHistory: reports,
    aiSummary: `Patient ${pregnancy.womanName} at ${pregnancy.gestationalWeek} weeks gestation presents with ${pregnancy.riskLevel} risk profile (score: ${pregnancy.riskScore}/100). Key monitoring parameters include blood pressure trends, fetal movement assessment, and symptom reporting via MaaRaksha voice interface.`,
    clinicalNotes: reports[0]?.clinicalReasoning || 'No critical notes.',
    recommendations: [reports[0]?.suggestedAction || 'Continue routine ANC', reports[0]?.followUpRecommendation || 'Next visit in 2 weeks'].filter(Boolean),
    followUpActions: ['ASHA home visit', 'BP monitoring', 'Medication compliance check'],
    createdAt: new Date().toISOString(),
  };
}

export const PREGNANCY_MILESTONES = [
  { week: 4, title: 'Implantation', description: 'The embryo implants in the uterine wall.' },
  { week: 8, title: 'Heartbeat Detectable', description: 'Fetal heartbeat can be detected via ultrasound.' },
  { week: 12, title: 'End of First Trimester', description: 'Risk of miscarriage significantly decreases.' },
  { week: 16, title: 'Movement Begins', description: 'You may start feeling subtle movements.' },
  { week: 20, title: 'Anomaly Scan', description: 'Mid-pregnancy ultrasound to check development.' },
  { week: 24, title: 'Viability Milestone', description: 'Baby has a chance of survival if born prematurely.' },
  { week: 28, title: 'Third Trimester Begins', description: 'Increased monitoring for complications.' },
  { week: 32, title: 'Rapid Brain Development', description: 'Baby\'s brain develops rapidly.' },
  { week: 36, title: 'Full Term Approaching', description: 'Weekly check-ups recommended.' },
  { week: 40, title: 'Due Date', description: 'Expected delivery date.' },
];
