export interface PredictiveRisk {
  pregnancyId: string;
  generatedAt: string;
  next7Days: {
    probability: number;       // 0-100
    trend: 'improving' | 'stable' | 'worsening';
    confidence: number;        // 0-100
  };
  next30Days: {
    probability: number;
    trend: 'improving' | 'stable' | 'worsening';
    confidence: number;
  };
  complications: {
    name: string;
    probability: number;
    severity: 'low' | 'medium' | 'high';
  }[];
  trendDirection: 'improving' | 'stable' | 'worsening';
  keyFactors: string[];
  aiSummary: string;
}

export interface NutritionPlan {
  id: string;
  pregnancyId: string;
  week: number;
  date: string;
  breakfast: { item: string; portion: string; nutrients: string }[];
  lunch: { item: string; portion: string; nutrients: string }[];
  dinner: { item: string; portion: string; nutrients: string }[];
  snacks: { item: string; portion: string; nutrients: string }[];
  supplements: string[];
  tips: string[];
  aiGenerated: boolean;
}

export interface NearbyFacility {
  id: string;
  name: string;
  type: 'PHC' | 'CHC' | 'Hospital' | 'Clinic';
  address: string;
  distance: string;
  phone: string;
  lat: number;
  lng: number;
  available24h: boolean;
  services: string[];
}

export interface KnowledgeArticle {
  id: string;
  week: number;
  title: string;
  category: 'development' | 'nutrition' | 'tests' | 'warnings' | 'general';
  content: string;
  keyPoints: string[];
  imageEmoji: string;
}

export interface DigitalTwin {
  pregnancyId: string;
  healthScore: number;         // 0-100 composite
  complianceScore: number;     // check-in compliance %
  nutritionScore: number;
  medicineScore: number;
  riskTrajectory: 'improving' | 'stable' | 'worsening';
  futureRiskProjection: { week: number; predictedScore: number }[];
  insights: string[];
  lastUpdated: string;
}

export interface CheckInStreak {
  pregnancyId: string;
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: string | null;
  missedDays: number;
  complianceRate: number;    // percentage
}

export interface MedicalReportUpload {
  id: string;
  pregnancyId: string;
  womanId: string;
  fileName: string;
  fileType: 'pdf' | 'jpg' | 'png';
  reportType: 'blood_test' | 'ultrasound' | 'prescription' | 'lab_report';
  uploadedAt: string;
  analysisStatus: 'pending' | 'analyzing' | 'complete' | 'failed';
  findings?: string[];
  abnormalValues?: string[];
  riskIndicators?: string[];
  followUp?: string;
  aiSummary?: string;
}

export interface DailyEntry {
  id: string;
  pregnancyId: string;
  womanId: string;
  date: string;
  symptoms: string[];
  transcription?: string;
  weight?: number;
  bloodPressure?: string;
  waterIntake?: number;
  sleepHours?: number;
  medicineTaken?: boolean;
  mood?: 'great' | 'good' | 'okay' | 'poor' | 'bad';
  notes?: string;
  riskScore?: number;
  riskLevel?: RiskLevel;
  aiRecommendation?: string;
  warningSignsToWatch?: string[];
  precautions?: string[];
  suggestedNextSteps?: string;
  createdAt: string;
}

export type UserRole = 'woman' | 'asha' | 'family' | 'phc' | 'district';

export type RiskLevel = 'GREEN' | 'YELLOW' | 'RED';

export type Language = 'en' | 'hi' | 'ta' | 'te' | 'mr' | 'bn';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  villageId?: string;
  districtId?: string;
  phcId?: string;
  linkedPregnancyId?: string;
  avatar?: string;
  language: Language;
  createdAt: string;
  // Onboarding fields (set during the onboarding flow)
  onboardingComplete?: boolean;
  age?: number;
  weight?: number;
  gestationalMonth?: number;
  gestationalWeek?: number;
  symptoms?: string[];
  additionalInfo?: string;
  previousReports?: string;
}

export interface Village {
  id: string;
  name: string;
  districtId: string;
  population: number;
  lat: number;
  lng: number;
}

export interface District {
  id: string;
  name: string;
  state: string;
  population: number;
}

export interface Pregnancy {
  id: string;
  womanId: string;
  womanName: string;
  villageId: string;
  villageName: string;
  districtId: string;
  ashaWorkerId: string;
  familyMemberIds: string[];
  gestationalWeek: number;
  dueDate: string;
  trimester: 1 | 2 | 3;
  riskLevel: RiskLevel;
  riskScore: number;
  isHighRisk: boolean;
  lastReportAt: string;
  bloodPressure?: string;
  previousComplications?: string[];
  createdAt: string;
}

export interface Symptom {
  id: string;
  pregnancyId: string;
  womanId: string;
  description: string;
  extractedSymptoms: string[];
  language: Language;
  transcription: string;
  source: 'voice' | 'manual';
  createdAt: string;
}

export interface RiskReport {
  id: string;
  pregnancyId: string;
  womanId: string;
  riskLevel: RiskLevel;
  riskScore: number;
  riskFactors: string[];
  clinicalReasoning: string;
  suggestedAction: string;
  followUpRecommendation: string;
  symptoms: string[];
  gestationalWeek: number;
  createdAt: string;
}

export interface Alert {
  id: string;
  pregnancyId: string;
  womanName: string;
  riskLevel: RiskLevel;
  type: 'email' | 'sms' | 'whatsapp' | 'in_app';
  recipients: AlertRecipient[];
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  createdAt: string;
}

export interface AlertRecipient {
  name: string;
  role: string;
  contact: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'alert' | 'reminder' | 'appointment' | 'info';
  read: boolean;
  createdAt: string;
}

export interface Appointment {
  id: string;
  pregnancyId: string;
  womanId: string;
  type: 'ANC' | 'ultrasound' | 'lab' | 'follow_up';
  title: string;
  date: string;
  status: 'upcoming' | 'completed' | 'missed';
  location: string;
  notes?: string;
}

export interface MedicineReminder {
  id: string;
  pregnancyId: string;
  womanId: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  taken: boolean;
  lastTakenAt?: string;
}

export interface MedicalReport {
  id: string;
  pregnancyId: string;
  womanId: string;
  patientProfile: Record<string, string>;
  symptoms: string[];
  riskFactors: string[];
  riskHistory: RiskReport[];
  aiSummary: string;
  clinicalNotes: string;
  recommendations: string[];
  followUpActions: string[];
  createdAt: string;
}

export interface RiskHistoryEntry {
  id: string;
  pregnancyId: string;
  week: number;
  riskLevel: RiskLevel;
  riskScore: number;
  date: string;
}

export interface AnalyticsSnapshot {
  id: string;
  districtId?: string;
  phcId?: string;
  week: string;
  greenCount: number;
  yellowCount: number;
  redCount: number;
  totalPregnancies: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface DashboardStats {
  totalPregnancies: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  alertsToday: number;
  appointmentsDue: number;
  followUpsPending: number;
}
