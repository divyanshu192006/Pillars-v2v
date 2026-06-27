import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { VoiceRecorder } from '@/components/voice/VoiceRecorder';
import { api } from '@/lib/api';
import type { Symptom, RiskReport } from '@/types';

export default function VoiceReportPage() {
  const { user } = useAuth();
  const { pregnancies, addSymptom, addRiskReport, updatePregnancyRisk, addAlert, addNotification } = useData();
  const pregnancy = pregnancies.find(p => p.id === user?.linkedPregnancyId) || pregnancies[0];

  const handleReport = async (symptom: Symptom, report: RiskReport) => {
    addSymptom(symptom);
    addRiskReport(report);
    updatePregnancyRisk(pregnancy.id, report.riskLevel, report.riskScore);

    addNotification({
      id: `n-${Date.now()}`,
      userId: user?.id || '',
      title: `Risk Updated: ${report.riskLevel}`,
      message: report.suggestedAction,
      type: 'alert',
      read: false,
      createdAt: new Date().toISOString(),
    });

    if (report.riskLevel === 'RED') {
      try {
        await api.sendAlert({
          pregnancyId: pregnancy.id,
          womanName: pregnancy.womanName,
          riskLevel: 'RED',
          message: `URGENT: ${pregnancy.womanName} flagged RED risk. ${report.suggestedAction}`,
        });
      } catch {
        addAlert({
          id: `a-${Date.now()}`,
          pregnancyId: pregnancy.id,
          womanName: pregnancy.womanName,
          riskLevel: 'RED',
          type: 'email',
          recipients: [{ name: 'Family', role: 'Family', contact: 'family@demo.com', status: 'sent' }],
          message: `URGENT RED ALERT: ${report.clinicalReasoning}`,
          status: 'sent',
          createdAt: new Date().toISOString(),
        });
      }
    }
  };

  return (
    <VoiceRecorder
      pregnancyId={pregnancy.id}
      womanId={user?.id || pregnancy.womanId}
      gestationalWeek={pregnancy.gestationalWeek}
      language={user?.language || 'en'}
      onSymptomReported={handleReport}
    />
  );
}
