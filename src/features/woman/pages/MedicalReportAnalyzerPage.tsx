import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Sparkles, Loader2, CheckCircle, AlertTriangle, X, FileScan } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface AnalysisResult {
  findings: string[];
  abnormalValues: string[];
  riskIndicators: string[];
  followUp: string;
  aiSummary: string;
}

interface UploadedReport {
  id: string;
  fileName: string;
  reportType: string;
  uploadedAt: string;
  analysis?: AnalysisResult;
  status: 'pending' | 'analyzing' | 'complete' | 'failed';
}

const REPORT_TYPES = [
  { id: 'blood_test',   label: 'Blood Test',   emoji: '🩸' },
  { id: 'ultrasound',   label: 'Ultrasound',   emoji: '📡' },
  { id: 'prescription', label: 'Prescription', emoji: '💊' },
  { id: 'lab_report',   label: 'Lab Report',   emoji: '🔬' },
];

export default function MedicalReportAnalyzerPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pregnancies } = useData();
  const pregnancy = pregnancies.find(p => p.id === user?.linkedPregnancyId) || pregnancies[0];
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState('blood_test');
  const [reportText, setReportText] = useState('');
  const [reports, setReports] = useState<UploadedReport[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Translated report types — defined inside component so t() is available
  const REPORT_TYPES_I18N = [
    { id: 'blood_test',   label: t('reportAnalyzer.reportTypes.blood_test'),   emoji: '🩸' },
    { id: 'ultrasound',   label: t('reportAnalyzer.reportTypes.ultrasound'),   emoji: '📡' },
    { id: 'prescription', label: t('reportAnalyzer.reportTypes.prescription'), emoji: '💊' },
    { id: 'lab_report',   label: t('reportAnalyzer.reportTypes.lab_report'),   emoji: '🔬' },
  ];

  const analyzeReport = async (text: string, type: string, fileName: string) => {
    const id = `rpt-${Date.now()}`;
    const newReport: UploadedReport = { id, fileName, reportType: type, uploadedAt: new Date().toISOString(), status: 'analyzing' };
    setReports(prev => [newReport, ...prev]);
    setAnalyzing(true);
    try {
      const res = await api.analyzeReport({ reportText: text, reportType: type, gestationalWeek: pregnancy?.gestationalWeek });
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'complete', analysis: res.analysis } : r));
    } catch {
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'failed' } : r));
    } finally { setAnalyzing(false); }
  };

  const handleTextSubmit = () => {
    if (!reportText.trim()) return;
    analyzeReport(reportText, selectedType, `Manual ${REPORT_TYPES_I18N.find(rt => rt.id === selectedType)?.label} Entry`);
    setReportText('');
  };

  // Extract text from PDF using pdf.js
  const extractPdfText = async (file: File): Promise<string> => {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      // Use CDN worker — works on all environments (localhost + Vercel + any deployment)
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: { str?: string }) => item.str || '')
          .join(' ');
        fullText += pageText + '\n';
      }

      return fullText.trim().slice(0, 3000) || `PDF: ${file.name} (could not extract text)`;
    } catch (err) {
      console.error('PDF extraction failed:', err);
      return `PDF file: ${file.name}. Unable to extract text automatically. Please type the key values below.`;
    }
  };

  const handleFile = async (file: File) => {
    const id = `rpt-${Date.now()}`;
    const newReport: UploadedReport = {
      id, fileName: file.name,
      reportType: selectedType,
      uploadedAt: new Date().toISOString(),
      status: 'analyzing',
    };
    setReports(prev => [newReport, ...prev]);
    setAnalyzing(true);

    try {
      let text = '';
      if (file.type === 'application/pdf') {
        text = await extractPdfText(file);
      } else if (file.type.startsWith('image/')) {
        // For images, send filename + prompt Gemini with OCR hint
        text = `Medical report image from file: ${file.name}. This appears to be a ${selectedType.replace('_', ' ')} report. Please provide a general maternal health analysis template.`;
      } else {
        text = await file.text();
      }

      const res = await api.analyzeReport({
        reportText: text,
        reportType: selectedType,
        gestationalWeek: pregnancy?.gestationalWeek,
      });
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'complete', analysis: res.analysis } : r));
    } catch {
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'failed' } : r));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 p-6 text-white">
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">{t('reportAnalyzer.aiPowered')}</p>
          <h1 className="text-2xl font-bold">{t('reportAnalyzer.title')}</h1>
          <p className="text-white/80 text-sm mt-1">{t('reportAnalyzer.subtitle')}</p>
        </div>
      </motion.div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><FileScan className="h-5 w-5 text-blue-500" /> {t('reportAnalyzer.uploadOrEnter')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {REPORT_TYPES_I18N.map(rtype => (
              <button key={rtype.id} onClick={() => setSelectedType(rtype.id)}
                className={cn('flex flex-col items-center gap-1 rounded-2xl border p-3 text-xs font-medium transition-all',
                  selectedType === rtype.id ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-200 text-gray-600')}>
                <span className="text-xl">{rtype.emoji}</span>{rtype.label}
              </button>
            ))}
          </div>

          <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file) handleFile(file); }}
            onClick={() => fileRef.current?.click()}
            className={cn('border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
              dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50')}>
            <Upload className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-medium text-gray-600">{t('reportAnalyzer.dropFile')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('reportAnalyzer.fileTypes')}</p>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>

          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">{t('reportAnalyzer.orType')}</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <textarea className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            rows={4} placeholder={`Paste your ${REPORT_TYPES_I18N.find(rt=>rt.id===selectedType)?.label} values here...\nExample:\nHemoglobin: 9.2 g/dL\nBlood Pressure: 142/92 mmHg\nBlood Sugar (Fasting): 110 mg/dL`}
            value={reportText} onChange={e => setReportText(e.target.value)} />

          <Button onClick={handleTextSubmit} disabled={!reportText.trim() || analyzing} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500" size="lg">
            {analyzing ? <><Loader2 className="h-5 w-5 animate-spin" /> {t('reportAnalyzer.analyzingBtn')}</> : <><Sparkles className="h-5 w-5" /> {t('reportAnalyzer.analyzeBtn')}</>}
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {reports.map(r => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={cn('overflow-hidden', r.status === 'failed' ? 'border-red-200' : r.status === 'complete' ? 'border-emerald-200' : 'border-blue-100')}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-blue-500" /> {r.fileName}
                  </CardTitle>
                  <Badge variant={r.status === 'complete' ? 'green' : r.status === 'failed' ? 'red' : 'default'}>
                    {r.status === 'analyzing' ? <><Loader2 className="h-3 w-3 animate-spin mr-1" />Analyzing</> : r.status}
                  </Badge>
                </div>
              </CardHeader>
              {r.analysis && (
                <CardContent className="pt-0 space-y-4">
                  <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-indigo-500" />
                      <p className="text-xs font-semibold text-indigo-600">{t('reportAnalyzer.aiSummary')}</p>
                    </div>
                    <p className="text-sm text-gray-700">{r.analysis.aiSummary}</p>
                  </div>
                  {r.analysis.findings.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> {t('reportAnalyzer.keyFindings')}</p>
                      <ul className="space-y-1">{r.analysis.findings.map((f, i) => <li key={i} className="text-sm text-gray-700 flex items-start gap-2"><span className="text-emerald-500">•</span>{f}</li>)}</ul>
                    </div>
                  )}
                  {r.analysis.abnormalValues.length > 0 && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-600 mb-2 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> {t('reportAnalyzer.valuesAttention')}</p>
                      <ul className="space-y-1">{r.analysis.abnormalValues.map((v, i) => <li key={i} className="text-sm text-amber-800">⚠ {v}</li>)}</ul>
                    </div>
                  )}
                  {r.analysis.followUp && (
                    <div className="rounded-xl bg-primary-50 border border-primary-100 p-3">
                      <p className="text-xs font-semibold text-primary-600 mb-1">{t('reportAnalyzer.followUp')}</p>
                      <p className="text-sm text-gray-700">{r.analysis.followUp}</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {reports.length === 0 && (
        <div className="py-8 text-center text-gray-400">
          <FileScan className="h-12 w-12 mx-auto mb-3 text-gray-200" />
          <p className="text-sm">{t('reportAnalyzer.noReports')}</p>
        </div>
      )}
    </div>
  );
}
