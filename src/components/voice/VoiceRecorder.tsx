import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Loader2, Sparkles, AlertTriangle,
  CheckCircle, XCircle, RefreshCw, Activity, Info,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import type { Language, RiskReport, Symptom } from '@/types';

// ─── Types ─────────────────────────────────────────────────────────────────

interface VoiceRecorderProps {
  pregnancyId: string;
  womanId: string;
  gestationalWeek: number;
  language: Language;
  onSymptomReported: (symptom: Symptom, report: RiskReport) => void;
}

type MicStatus = 'unknown' | 'checking' | 'granted' | 'denied' | 'unavailable';
type SpeechEngine = 'webSpeech' | 'none';
type RecordingState = 'idle' | 'recording' | 'stopping' | 'processing';

// ─── Local Fallbacks ────────────────────────────────────────────────────────

function extractSymptomsLocal(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  const mappings: Record<string, string> = {
    headache: 'Severe headache', 'head ache': 'Severe headache',
    'सिरदर्द': 'Severe headache', 'सिर दर्द': 'Severe headache',
    swelling: 'Oedema (swelling)', 'सूजन': 'Oedema (swelling)',
    dizzy: 'Dizziness', dizziness: 'Dizziness', 'चक्कर': 'Dizziness',
    bleed: 'Bleeding', blood: 'Bleeding', 'खून': 'Bleeding', 'रक्त': 'Bleeding',
    movement: 'Reduced fetal movement', 'हलचल': 'Reduced fetal movement',
    vision: 'Blurred vision', breath: 'Breathing difficulty',
    pain: 'Abdominal pain', 'दर्द': 'Abdominal pain',
    nausea: 'Nausea/Vomiting', vomit: 'Nausea/Vomiting',
    'उल्टी': 'Nausea/Vomiting', 'मतली': 'Nausea/Vomiting',
    fever: 'Fever', 'बुखार': 'Fever',
    contraction: 'Contractions', bp: 'High BP symptoms',
  };
  for (const [key, label] of Object.entries(mappings)) {
    if (lower.includes(key) && !found.includes(label)) found.push(label);
  }
  return found.length ? found : ['General discomfort reported'];
}

function assessRiskLocal(symptoms: string[], gestationalWeek: number): Partial<RiskReport> {
  let score = 15;
  const factors: string[] = [];
  const highRisk = ['Reduced fetal movement', 'Bleeding', 'High BP symptoms', 'Breathing difficulty'];
  const medRisk = ['Severe headache', 'Oedema (swelling)', 'Blurred vision', 'Abdominal pain'];
  for (const s of symptoms) {
    if (highRisk.some(h => s.includes(h.split(' ')[0]))) { score += 25; factors.push(s); }
    else if (medRisk.some(m => s.includes(m.split(' ')[0]))) { score += 15; factors.push(s); }
    else { score += 5; }
  }
  if (gestationalWeek >= 28) score += 5;
  score = Math.min(100, score);
  const level = score >= 70 ? 'RED' : score >= 40 ? 'YELLOW' : 'GREEN';
  return {
    riskLevel: level as RiskReport['riskLevel'],
    riskScore: score,
    riskFactors: factors,
    clinicalReasoning: `Analysis of ${symptoms.length} symptom(s) at ${gestationalWeek} weeks. ${level === 'RED' ? 'Immediate clinical evaluation recommended.' : level === 'YELLOW' ? 'Close monitoring advised.' : 'Routine care appropriate.'}`,
    suggestedAction: level === 'RED' ? 'URGENT: Refer to PHC/hospital immediately.' : level === 'YELLOW' ? 'Schedule check-up within 24-48 hours.' : 'Continue routine ANC schedule.',
    followUpRecommendation: level === 'RED' ? 'ASHA to arrange emergency transport. Alert family and PHC.' : 'ASHA home visit within 48 hours.',
  };
}

// ─── Language map ────────────────────────────────────────────────────────────

const LANG_CODES: Record<Language, string> = {
  en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', mr: 'mr-IN', bn: 'bn-IN',
};

// ─── Diagnostic Panel ────────────────────────────────────────────────────────

function DiagnosticPanel({
  micStatus, engine, lastError, lastTranscript, isVisible, onToggle,
}: {
  micStatus: MicStatus;
  engine: SpeechEngine;
  lastError: string;
  lastTranscript: string;
  isVisible: boolean;
  onToggle: () => void;
}) {
  const statusIcon = (ok: boolean | null) =>
    ok === null ? <Activity className="h-3 w-3 text-amber-500" /> :
    ok ? <CheckCircle className="h-3 w-3 text-emerald-500" /> :
         <XCircle className="h-3 w-3 text-red-500" />;

  const micOk = micStatus === 'granted';
  const speechOk = engine !== 'none';
  const browserOk = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <span className="flex items-center gap-1.5"><Info className="h-3.5 w-3.5" /> Diagnostics</span>
        {isVisible ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      {isVisible && (
        <div className="px-4 pb-4 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              {statusIcon(micOk)} <span className="text-gray-600">Microphone: <strong>{micStatus}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              {statusIcon(browserOk)} <span className="text-gray-600">Browser API: <strong>{browserOk ? 'supported' : 'not supported'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              {statusIcon(speechOk)} <span className="text-gray-600">Speech Engine: <strong>{engine}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              {statusIcon(null)} <span className="text-gray-600">Browser: <strong>{navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Edg') ? 'Edge' : 'Other'}</strong></span>
            </div>
          </div>
          {lastError && (
            <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-600">
              ⚠ Last error: {lastError}
            </div>
          )}
          {lastTranscript && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-xs text-emerald-700">
              ✓ Last transcript: "{lastTranscript.slice(0, 80)}{lastTranscript.length > 80 ? '…' : ''}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Real audio waveform via AnalyserNode ─────────────────────────────────────

function useAudioLevel(isRecording: boolean, stream: MediaStream | null) {
  const [bars, setBars] = useState<number[]>(Array(28).fill(4));
  const rafRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (isRecording && stream) {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      ctx.createMediaStreamSource(stream).connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const slice = Array.from(data.slice(0, 28)).map(v => 4 + (v / 255) * 36);
        setBars(slice);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
      analyserRef.current = null;
      setBars(Array(28).fill(4));
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isRecording, stream]);

  return bars;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function VoiceRecorder({
  pregnancyId, womanId, gestationalWeek, language, onSymptomReported,
}: VoiceRecorderProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [micStatus, setMicStatus]     = useState<MicStatus>('unknown');
  const [engine, setEngine]           = useState<SpeechEngine>('none');
  const [transcription, setTranscription] = useState('');
  const [interimText, setInterimText] = useState('');
  const [extractedSymptoms, setExtractedSymptoms] = useState<string[]>([]);
  const [riskResult, setRiskResult]   = useState<Partial<RiskReport> | null>(null);
  const [lastError, setLastError]     = useState('');
  const [showDiag, setShowDiag]       = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [statusMsg, setStatusMsg]     = useState('');

  const recognitionRef    = useRef<SpeechRecognition | null>(null);
  const recordingStateRef = useRef<RecordingState>('idle');

  // Keep ref in sync with state so onend closure always sees the latest value
  useEffect(() => { recordingStateRef.current = recordingState; }, [recordingState]);

  const isRecording = recordingState === 'recording';
  const bars = useAudioLevel(isRecording, mediaStream);

  // ── Detect browser support & init speech recognition ──────────────────────
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      setEngine('webSpeech');
      const rec = new SR();
      rec.continuous      = true;
      rec.interimResults  = true;
      rec.maxAlternatives = 1;
      rec.lang = LANG_CODES[language] || 'en-IN';

      rec.onstart = () => {
        console.log('[VoiceRecorder] Recognition started, lang:', rec.lang);
        setStatusMsg('Listening…');
        setLastError('');
      };

      rec.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        let finalText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) { finalText += t + ' '; }
          else interim += t;
        }
        if (finalText) {
          console.log('[VoiceRecorder] Final transcript chunk:', finalText.trim());
          setTranscription(prev => (prev + ' ' + finalText).trim());
        }
        setInterimText(interim);
      };

      rec.onspeechstart = () => {
        console.log('[VoiceRecorder] Speech detected');
        setStatusMsg('Speech detected…');
      };

      rec.onspeechend = () => {
        console.log('[VoiceRecorder] Speech ended');
        setStatusMsg('Processing…');
      };

      rec.onend = () => {
        console.log('[VoiceRecorder] Recognition ended, state:', recordingStateRef.current);
        // Auto-restart if still supposed to be recording (browser cuts off after silence)
        if (recognitionRef.current && recordingStateRef.current === 'recording') {
          try {
            recognitionRef.current.start();
            console.log('[VoiceRecorder] Auto-restarted recognition');
          } catch (e) {
            console.warn('[VoiceRecorder] Could not restart:', e);
          }
        }
        setInterimText('');
      };

      rec.onerror = (event: SpeechRecognitionErrorEvent) => {
        const code = event.error;
        console.error('[VoiceRecorder] Speech error:', code);
        if (code === 'not-allowed' || code === 'permission-denied') {
          setMicStatus('denied');
          setLastError('Microphone permission denied. Please allow microphone access in browser settings.');
          setRecordingState('idle');
        } else if (code === 'no-speech') {
          setLastError('No speech detected. Please speak clearly near the microphone.');
          setStatusMsg('No speech — try again');
        } else if (code === 'network') {
          setLastError('Network error during speech recognition. Check your internet connection.');
        } else if (code === 'audio-capture') {
          setLastError('Could not capture audio. Is the microphone connected?');
          setMicStatus('unavailable');
          setRecordingState('idle');
        } else {
          setLastError(`Speech error: ${code}`);
        }
      };

      recognitionRef.current = rec;
    } else {
      setEngine('none');
      console.warn('[VoiceRecorder] Web Speech API not supported');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // ── Update lang when language prop changes ────────────────────────────────
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = LANG_CODES[language] || 'en-IN';
    }
  }, [language]);

  // ── Request mic permission explicitly ─────────────────────────────────────
  const requestMicPermission = useCallback(async (): Promise<MediaStream | null> => {
    setMicStatus('checking');
    setStatusMsg('Requesting microphone permission…');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStatus('granted');
      setMediaStream(stream);
      console.log('[VoiceRecorder] Microphone access granted');
      return stream;
    } catch (err) {
      const msg = (err as Error).message || String(err);
      console.error('[VoiceRecorder] Mic permission error:', msg);
      if (msg.includes('Permission denied') || msg.includes('NotAllowed')) {
        setMicStatus('denied');
        setLastError('Microphone permission denied. Click the 🔒 icon in your browser address bar and allow microphone access, then try again.');
      } else if (msg.includes('NotFound') || msg.includes('DevicesNotFound')) {
        setMicStatus('unavailable');
        setLastError('No microphone found. Please connect a microphone and try again.');
      } else {
        setMicStatus('unavailable');
        setLastError(`Microphone error: ${msg}`);
      }
      return null;
    }
  }, []);

  // ── Start recording ────────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    setTranscription('');
    setInterimText('');
    setRiskResult(null);
    setExtractedSymptoms([]);
    setLastError('');

    // Always request mic permission before starting (needed for waveform + permission check)
    const stream = await requestMicPermission();
    if (!stream) return;

    if (!recognitionRef.current) {
      setLastError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Brave. You can type symptoms manually below.');
      setStatusMsg('Type symptoms manually ↓');
      return;
    }

    try {
      recognitionRef.current.lang = LANG_CODES[language] || 'en-IN';
      recognitionRef.current.start();
      setRecordingState('recording');
      console.log('[VoiceRecorder] Recording started');
    } catch (err) {
      const msg = (err as Error).message || String(err);
      console.error('[VoiceRecorder] Start error:', msg);
      setLastError(`Could not start recording: ${msg}`);
      setStatusMsg('Error starting — try again');
    }
  }, [language, requestMicPermission]);

  // ── Stop recording ─────────────────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    console.log('[VoiceRecorder] Stopping recording');
    setRecordingState('stopping');
    setStatusMsg('');
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) { /* already stopped */ }
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
      setMediaStream(null);
    }
    setInterimText('');
    setTimeout(() => setRecordingState('idle'), 300);
  }, [mediaStream]);

  // ── Toggle ─────────────────────────────────────────────────────────────────
  const handleToggle = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  // ── Process report ─────────────────────────────────────────────────────────
  const processReport = async () => {
    const text = transcription.trim();
    if (!text) return;
    setRecordingState('processing');
    console.log('[VoiceRecorder] Processing transcript:', text);

    try {
      // Step 1: Extract symptoms
      let symptoms: string[];
      try {
        console.log('[VoiceRecorder] Calling /api/ai/symptoms');
        const res = await api.extractSymptoms(text, language);
        symptoms = res.symptoms;
        console.log('[VoiceRecorder] AI symptoms:', symptoms);
      } catch (e) {
        console.warn('[VoiceRecorder] Symptom API failed, using local:', e);
        symptoms = extractSymptomsLocal(text);
      }
      setExtractedSymptoms(symptoms);

      // Step 2: Risk assessment
      let report: Partial<RiskReport>;
      try {
        console.log('[VoiceRecorder] Calling /api/risk/assess');
        const res = await api.assessRisk({ symptoms, gestationalWeek, transcription: text, pregnancyId });
        report = res.report;
        console.log('[VoiceRecorder] Risk report:', report.riskLevel, report.riskScore);
      } catch (e) {
        console.warn('[VoiceRecorder] Risk API failed, using local:', e);
        report = assessRiskLocal(symptoms, gestationalWeek);
      }
      setRiskResult(report);

      // Step 3: Fire callback
      const symptom: Symptom = {
        id: `s-${Date.now()}`,
        pregnancyId, womanId,
        description: text,
        extractedSymptoms: symptoms,
        language, transcription: text,
        source: 'voice',
        createdAt: new Date().toISOString(),
      };
      const fullReport: RiskReport = {
        id: `r-${Date.now()}`,
        pregnancyId, womanId,
        riskLevel: report.riskLevel || 'GREEN',
        riskScore: report.riskScore || 0,
        riskFactors: report.riskFactors || [],
        clinicalReasoning: report.clinicalReasoning || '',
        suggestedAction: report.suggestedAction || '',
        followUpRecommendation: report.followUpRecommendation || '',
        symptoms,
        gestationalWeek,
        createdAt: new Date().toISOString(),
      };
      onSymptomReported(symptom, fullReport);
    } finally {
      setRecordingState('idle');
    }
  };

  const canProcess = transcription.trim().length > 0 && recordingState === 'idle';
  const permDenied = micStatus === 'denied';
  const notSupported = engine === 'none';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary-50 to-pink-50 pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center">
            <Mic className="h-4 w-4 text-white" />
          </div>
          Voice Symptom Reporting
        </CardTitle>
        <p className="text-sm text-gray-500 mt-0.5">
          Speak naturally in {language === 'hi' ? 'Hindi' : language === 'ta' ? 'Tamil' : language === 'te' ? 'Telugu' : language === 'mr' ? 'Marathi' : language === 'bn' ? 'Bengali' : 'English'}
        </p>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">

        {/* ── Permission denied banner ── */}
        {permDenied && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-700 text-sm">Microphone Permission Required</p>
              <p className="text-xs text-amber-600 mt-1">
                Click the 🔒 icon in the browser address bar → Site settings → Allow Microphone. Then click Retry.
              </p>
              <Button size="sm" variant="outline" className="mt-2 border-amber-300 text-amber-700 hover:bg-amber-100"
                onClick={() => { setMicStatus('unknown'); startRecording(); }}>
                <RefreshCw className="h-3.5 w-3.5 mr-1" /> Retry
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Not supported banner ── */}
        {notSupported && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 flex items-start gap-2">
            <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p>Speech recognition is not supported in this browser. Please use <strong>Chrome</strong>, <strong>Edge</strong>, or <strong>Brave</strong>. You can type symptoms manually below.</p>
          </div>
        )}

        {/* ── Mic button ── */}
        <div className="flex flex-col items-center py-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleToggle}
            disabled={recordingState === 'processing' || recordingState === 'stopping'}
            className={cn(
              'relative flex h-28 w-28 items-center justify-center rounded-full shadow-2xl transition-all',
              isRecording
                ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-200'
                : 'bg-gradient-to-br from-primary-400 to-pink-500 shadow-primary-200',
              (recordingState === 'processing' || recordingState === 'stopping') && 'opacity-60 cursor-not-allowed'
            )}
          >
            {/* Pulse ring when recording */}
            {isRecording && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 rounded-full bg-red-400"
                />
                <motion.div
                  animate={{ scale: [1, 1.7, 1], opacity: [0.2, 0, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                  className="absolute inset-0 rounded-full bg-red-300"
                />
              </>
            )}
            {recordingState === 'processing' ? (
              <Loader2 className="h-10 w-10 text-white animate-spin" />
            ) : isRecording ? (
              <MicOff className="h-10 w-10 text-white" />
            ) : (
              <Mic className="h-10 w-10 text-white" />
            )}
          </motion.button>

          {/* Status text */}
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">
              {recordingState === 'processing' ? 'AI Analyzing…' :
               isRecording ? '🔴 Recording — Tap to stop' :
               recordingState === 'stopping' ? 'Stopping…' :
               'Tap microphone to speak'}
            </p>
            {statusMsg && (
              <p className="text-xs text-gray-400 mt-0.5">{statusMsg}</p>
            )}
            {isRecording && (
              <div className="flex items-center gap-1.5 justify-center mt-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs text-red-500 font-medium">LIVE</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Real audio waveform ── */}
        <div className="flex h-14 items-end justify-center gap-[3px] px-4">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              animate={{ height: h }}
              transition={{ duration: 0.05 }}
              className={cn(
                'rounded-full',
                isRecording ? 'bg-gradient-to-t from-primary-500 to-pink-400' : 'bg-gray-200'
              )}
              style={{ width: 5, height: h, minHeight: 4 }}
            />
          ))}
        </div>

        {/* ── Live transcript box ── */}
        <div className={cn(
          'min-h-[90px] rounded-2xl border p-4 transition-all',
          isRecording ? 'border-primary-200 bg-primary-50/50' : 'border-gray-100 bg-gray-50'
        )}>
          {isRecording && !transcription && !interimText ? (
            <p className="text-sm text-gray-400 italic animate-pulse">Listening… speak now</p>
          ) : (
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {transcription}
              {interimText && (
                <span className="text-gray-400 italic"> {interimText}</span>
              )}
              {!transcription && !interimText && (
                <span className="text-gray-400">Your speech will appear here in real-time…</span>
              )}
            </p>
          )}
        </div>

        {/* ── Manual text fallback ── */}
        <div>
          <p className="text-xs text-gray-400 mb-1.5">Or type symptoms manually:</p>
          <textarea
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
            rows={2}
            placeholder="e.g. Mujhe sir dard hai aur pairon mein sujan hai…"
            value={transcription}
            onChange={e => setTranscription(e.target.value)}
          />
        </div>

        {/* ── Error message ── */}
        {lastError && !permDenied && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            {lastError}
          </motion.div>
        )}

        {/* ── Analyze button ── */}
        <Button
          onClick={processReport}
          disabled={!canProcess}
          className="w-full"
          size="lg"
        >
          {recordingState === 'processing'
            ? <><Loader2 className="h-5 w-5 animate-spin" /> Analyzing…</>
            : <><Sparkles className="h-5 w-5" /> Analyze Symptoms with AI</>
          }
        </Button>

        {/* ── Results ── */}
        <AnimatePresence>
          {extractedSymptoms.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Extracted Symptoms</p>
              <div className="flex flex-wrap gap-2">
                {extractedSymptoms.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
              </div>
            </motion.div>
          )}

          {riskResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'rounded-2xl border p-5 space-y-2',
                riskResult.riskLevel === 'RED' ? 'risk-red' :
                riskResult.riskLevel === 'YELLOW' ? 'risk-yellow' : 'risk-green'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">Risk: {riskResult.riskLevel}</span>
                <span className="text-3xl font-bold">{riskResult.riskScore}/100</span>
              </div>
              <p className="text-sm leading-relaxed">{riskResult.clinicalReasoning}</p>
              <p className="text-sm font-semibold">{riskResult.suggestedAction}</p>
              <p className="text-xs opacity-80">{riskResult.followUpRecommendation}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Diagnostic panel ── */}
        <DiagnosticPanel
          micStatus={micStatus}
          engine={engine}
          lastError={lastError}
          lastTranscript={transcription}
          isVisible={showDiag}
          onToggle={() => setShowDiag(v => !v)}
        />

      </CardContent>
    </Card>
  );
}

// ─── Global type declaration ──────────────────────────────────────────────────

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
