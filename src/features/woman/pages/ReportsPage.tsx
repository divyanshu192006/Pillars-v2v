import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { getDemoMedicalReport } from '@/lib/demo-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Printer, FileText } from 'lucide-react';
import { formatDateTime, getRiskColor } from '@/lib/utils';
import jsPDF from 'jspdf';

export default function ReportsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pregnancies, riskReports } = useData();
  const reportRef = useRef<HTMLDivElement>(null);
  const pregnancy = pregnancies.find(p => p.id === user?.linkedPregnancyId) || pregnancies[0];
  const report = getDemoMedicalReport(pregnancy.id);
  const latestRisk = riskReports.find(r => r.pregnancyId === pregnancy.id);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('MaaRaksha - Smart Pregnancy Health Report', 20, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${formatDateTime(new Date())}`, 20, 30);
    doc.text(`Patient: ${report.patientProfile.Name}`, 20, 40);
    doc.text(`Village: ${report.patientProfile.Village}`, 20, 48);
    doc.text(`Gestational Week: ${report.patientProfile['Gestational Week']}`, 20, 56);
    doc.text(`Risk Level: ${pregnancy.riskLevel} (${pregnancy.riskScore}/100)`, 20, 64);
    doc.text('AI Summary:', 20, 76);
    doc.text(doc.splitTextToSize(report.aiSummary, 170), 20, 84);
    doc.text('Recommendations:', 20, 110);
    report.recommendations.forEach((r, i) => doc.text(`• ${r}`, 20, 118 + i * 8));
    doc.save(`MaaRaksha-Report-${report.patientProfile.Name}.pdf`);
  };

  const printReport = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button onClick={exportPDF}><Download className="h-4 w-4" /> {t('common.download')}</Button>
        <Button variant="secondary" onClick={printReport}><Printer className="h-4 w-4" /> {t('common.print')}</Button>
      </div>

      <div ref={reportRef} className="space-y-6 print:shadow-none">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> {t('reports.title')}</CardTitle>
            <p className="text-sm text-gray-500">{t('reports.doctorFormat', { date: formatDateTime(report.createdAt) })}</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('reports.patientProfile')}</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {Object.entries(report.patientProfile).map(([k, v]) => (
              <div key={k} className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs text-gray-500">{k}</p>
                <p className="font-medium">{v}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('reports.currentRiskAssessment')}</CardTitle></CardHeader>
          <CardContent>
            <div className={`inline-flex rounded-xl border px-4 py-2 ${getRiskColor(pregnancy.riskLevel)}`}>
              <span className="font-bold">{pregnancy.riskLevel}</span>
              <span className="ml-3">{pregnancy.riskScore}/100</span>
            </div>
            {latestRisk && (
              <div className="mt-4 space-y-2">
                <p className="text-sm"><strong>{t('reports.clinicalReasoning')}</strong> {latestRisk.clinicalReasoning}</p>
                <p className="text-sm"><strong>{t('reports.suggestedAction')}</strong> {latestRisk.suggestedAction}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('reports.symptomsFactors')}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><p className="text-sm font-medium mb-2">{t('reports.reportedSymptoms')}</p>
              <div className="flex flex-wrap gap-2">{report.symptoms.map(s => <Badge key={s} variant="outline">{s}</Badge>)}</div>
            </div>
            <div><p className="text-sm font-medium mb-2">{t('reports.riskFactors')}</p>
              <div className="flex flex-wrap gap-2">{report.riskFactors.map(f => <Badge key={f} variant="yellow">{f}</Badge>)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('reports.aiSummary')}</CardTitle></CardHeader>
          <CardContent><p className="text-sm leading-relaxed text-gray-700">{report.aiSummary}</p></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('reports.recommendations')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc pl-5 text-sm space-y-1">{report.recommendations.map(r => <li key={r}>{r}</li>)}</ul>
            <div><p className="text-sm font-medium mb-2">{t('reports.followUpActions')}</p>
              <div className="flex flex-wrap gap-2">{report.followUpActions.map(a => <Badge key={a}>{a}</Badge>)}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
