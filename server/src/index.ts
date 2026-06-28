import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { isGeminiConfigured, generateJSON, generateJSONWithImage, chatWithHistory } from './services/gemini.js';
import { assessRiskLocal, assessRiskWithAI, extractSymptomsLocal } from './services/riskEngine.js';
import { sendEmailAlert } from './services/alerts.js';

const app = express();
const PORT = process.env.PORT || 5000;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB limit

// Allow frontend origin — set CORS_ORIGIN env var on Render
// e.g. https://maaraksha.vercel.app
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['*'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    // Allow all if CORS_ORIGIN is * or not set
    if (!process.env.CORS_ORIGIN || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

// Explicitly handle OPTIONS preflight for all routes (required for multipart uploads)
app.options('*', cors());
app.use(express.json());

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', demo: !isGeminiConfigured(), gemini: isGeminiConfigured(), timestamp: new Date().toISOString() });
});

// ── Risk Assessment ───────────────────────────────────────────────────────────
app.post('/api/risk/assess', async (req, res) => {
  try {
    const { symptoms, gestationalWeek, bloodPressure, previousComplications, transcription, pregnancyId, womanId } = req.body;
    const input = { symptoms: symptoms || [], gestationalWeek: gestationalWeek || 20, bloodPressure, previousComplications, transcription, pregnancyId };
    const assessment = isGeminiConfigured() ? await assessRiskWithAI(input, generateJSON) : assessRiskLocal(input);
    res.json({ report: { id: `r-${Date.now()}`, pregnancyId: pregnancyId || 'unknown', womanId: womanId || 'unknown', ...assessment, symptoms: symptoms || [], gestationalWeek: gestationalWeek || 20, createdAt: new Date().toISOString() } });
  } catch (err) { res.status(500).json({ error: err instanceof Error ? err.message : 'Risk assessment failed' }); }
});

// ── Symptom Extraction ────────────────────────────────────────────────────────
app.post('/api/ai/symptoms', async (req, res) => {
  try {
    const { transcription, language } = req.body;
    if (!transcription) return res.status(400).json({ error: 'Transcription required' });
    if (isGeminiConfigured()) {
      const result = await generateJSON<{ symptoms: string[]; summary: string }>(`Extract maternal health symptoms from this patient report.\nLanguage: ${language || 'en'}\nReport: "${transcription}"\nReturn JSON with "symptoms" (array of clinical symptom names) and "summary" (one sentence).`);
      return res.json(result);
    }
    res.json({ symptoms: extractSymptomsLocal(transcription), summary: `Patient reported: ${transcription.slice(0, 100)}` });
  } catch (err) { res.status(500).json({ error: err instanceof Error ? err.message : 'Symptom extraction failed' }); }
});

// ── AI Chat ───────────────────────────────────────────────────────────────────
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, language, history, pregnancyContext } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });
    const langName: Record<string, string> = { en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu', mr: 'Marathi', bn: 'Bengali' };
    const responseLang = langName[language] || 'English';
    const systemPrompt = `You are MaaRaksha — a trusted, compassionate maternal health guide helping pregnant women in rural India understand symptoms, take precautions, and know when to seek medical help.
RULES: You are NOT a doctor. Never diagnose. Highlight EMERGENCY situations. Be warm and simple. Always respond in ${responseLang}.
FORMAT: 1) 🤱 What this could mean 2) ⚠️ Warning signs 3) ✅ Immediate precautions 4) 📞 When to contact ASHA 5) 🚨 When to go to hospital IMMEDIATELY
CONTEXT: ${pregnancyContext ? `Week ${pregnancyContext.week}, Risk: ${pregnancyContext.riskLevel}, T${pregnancyContext.trimester}` : 'No context'}`;
    if (isGeminiConfigured()) {
      const chatHistory = (history || []).map((h: { role: string; content: string }) => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] }));
      const reply = await chatWithHistory(systemPrompt, chatHistory, message);
      return res.json({ reply });
    }
    res.json({ reply: getSmartLocalReply(message, language || 'en') });
  } catch (err) { console.error('Chat error:', err); res.status(500).json({ error: err instanceof Error ? err.message : 'Chat failed' }); }
});

// ── Alerts ────────────────────────────────────────────────────────────────────
app.post('/api/alerts/send', async (req, res) => {
  try { res.json({ alert: await sendEmailAlert(req.body) }); }
  catch (err) { res.status(500).json({ error: err instanceof Error ? err.message : 'Alert failed' }); }
});

// ── Reports ───────────────────────────────────────────────────────────────────
app.post('/api/reports/generate', async (req, res) => {
  try { res.json({ report: { id: `mr-${Date.now()}`, pregnancyId: req.body.pregnancyId, aiSummary: 'Comprehensive maternal health report generated by MaaRaksha AI.', createdAt: new Date().toISOString() } }); }
  catch (err) { res.status(500).json({ error: err instanceof Error ? err.message : 'Report generation failed' }); }
});

// ── Analytics Insights ────────────────────────────────────────────────────────
app.get('/api/analytics/insights', async (_req, res) => {
  res.json({ insights: ['RED cases increased 20% in week 25 — focus on Chomu and Sanganer villages', 'Voice reporting adoption up 35% since deployment', 'ASHA follow-up compliance at 87%, above 80% target', 'Preeclampsia early detection improved 40% vs paper register baseline'] });
});

// ── Feature 1: Predictive Risk Engine ────────────────────────────────────────
app.post('/api/ai/predict-risk', async (req, res) => {
  try {
    const { pregnancyId, riskHistory, currentRisk, gestationalWeek, symptoms, complications } = req.body;
    if (isGeminiConfigured()) {
      const result = await generateJSON<{ next7Days: { probability: number; trend: string; confidence: number }; next30Days: { probability: number; trend: string; confidence: number }; complications: { name: string; probability: number; severity: string }[]; trendDirection: string; keyFactors: string[]; aiSummary: string }>(
        `You are a maternal health AI risk predictor. Analyze this pregnancy data and predict future risk.
Current: Week ${gestationalWeek}, Risk ${currentRisk?.level} (${currentRisk?.score}/100)
Symptoms: ${symptoms?.join(', ') || 'none'}, Complications: ${complications?.join(', ') || 'none'}
History: ${riskHistory?.map((h: {week: number; score: number}) => `W${h.week}:${h.score}`).join(', ') || 'none'}
Return ONLY JSON: {"next7Days":{"probability":0-100,"trend":"improving|stable|worsening","confidence":0-100},"next30Days":{"probability":0-100,"trend":"improving|stable|worsening","confidence":0-100},"complications":[{"name":"Pre-eclampsia","probability":0-100,"severity":"low|medium|high"},{"name":"Gestational Diabetes","probability":0-100,"severity":"low|medium|high"},{"name":"Anaemia","probability":0-100,"severity":"low|medium|high"},{"name":"Preterm Birth","probability":0-100,"severity":"low|medium|high"},{"name":"Hypertension","probability":0-100,"severity":"low|medium|high"}],"trendDirection":"improving|stable|worsening","keyFactors":["factor1","factor2"],"aiSummary":"2-3 sentence summary"}`
      );
      return res.json({ prediction: { pregnancyId, generatedAt: new Date().toISOString(), ...result } });
    }
    const baseScore = currentRisk?.score || 50;
    const trend = baseScore > 65 ? 'worsening' : baseScore < 35 ? 'improving' : 'stable';
    res.json({ prediction: { pregnancyId, generatedAt: new Date().toISOString(), next7Days: { probability: Math.min(100, baseScore + 5), trend, confidence: 72 }, next30Days: { probability: Math.min(100, baseScore + 10), trend, confidence: 58 }, complications: [{ name: 'Pre-eclampsia', probability: gestationalWeek > 20 ? 18 : 8, severity: 'medium' }, { name: 'Gestational Diabetes', probability: 14, severity: 'medium' }, { name: 'Anaemia', probability: 22, severity: 'low' }, { name: 'Preterm Birth', probability: gestationalWeek > 30 ? 12 : 6, severity: 'high' }, { name: 'Hypertension', probability: baseScore > 60 ? 25 : 10, severity: 'medium' }], trendDirection: trend, keyFactors: ['Gestational week progression', 'Symptom pattern', 'Blood pressure trend'], aiSummary: `Based on current data at ${gestationalWeek} weeks, risk trajectory appears ${trend}. Continue regular monitoring and check-ins.` } });
  } catch (err) { res.status(500).json({ error: err instanceof Error ? err.message : 'Prediction failed' }); }
});

// ── Feature 7: Nutrition Planner ─────────────────────────────────────────────
app.post('/api/ai/nutrition-plan', async (req, res) => {
  try {
    const { week, symptoms, riskLevel, region } = req.body;
    if (isGeminiConfigured()) {
      const plan = await generateJSON<{ breakfast: {item:string;portion:string;nutrients:string}[]; lunch: {item:string;portion:string;nutrients:string}[]; dinner: {item:string;portion:string;nutrients:string}[]; snacks: {item:string;portion:string;nutrients:string}[]; supplements: string[]; tips: string[] }>(
        `You are a maternal nutrition expert for Indian pregnancy. Generate a 1-day meal plan for week ${week}, risk ${riskLevel}, region ${region||'North India'}.
Use affordable Indian foods. Return ONLY JSON: {"breakfast":[{"item":"food","portion":"amount","nutrients":"key nutrients"}],"lunch":[...],"dinner":[...],"snacks":[...],"supplements":["Iron+Folic Acid - 1 tablet after breakfast"],"tips":["tip1","tip2"]}`
      );
      return res.json({ plan: { ...plan, week, aiGenerated: true } });
    }
    const isT3 = (week || 20) >= 28;
    res.json({ plan: { week, aiGenerated: false,
      breakfast: [{ item: 'Daliya (broken wheat porridge)', portion: '1 bowl', nutrients: 'Iron, B vitamins, fibre' }, { item: 'Milk with haldi', portion: '1 glass', nutrients: 'Calcium, Vitamin D' }, { item: 'Banana', portion: '1 medium', nutrients: 'Potassium, B6' }],
      lunch: [{ item: 'Brown rice', portion: '1 cup', nutrients: 'Complex carbs' }, { item: 'Palak dal', portion: '1 bowl', nutrients: 'Iron, folic acid, protein' }, { item: 'Curd', portion: '1 cup', nutrients: 'Calcium, probiotics' }, { item: 'Seasonal sabzi', portion: '1 bowl', nutrients: 'Vitamins, minerals' }],
      dinner: [{ item: 'Whole wheat roti', portion: '2-3 rotis', nutrients: 'Complex carbs, fibre' }, { item: 'Moong dal tadka', portion: '1 bowl', nutrients: 'Protein, folic acid' }, { item: 'Cucumber salad', portion: '1 small bowl', nutrients: 'Hydration, vitamins' }],
      snacks: [{ item: 'Roasted chana', portion: '1 handful', nutrients: 'Protein, iron, fibre' }, { item: 'Amla / orange', portion: '1-2 pieces', nutrients: 'Vitamin C' }, { item: isT3 ? 'Dates (khajoor)' : 'Peanut chikki', portion: isT3 ? '3-4 dates' : '1 piece', nutrients: 'Iron, energy' }],
      supplements: ['Iron + Folic Acid — 1 tablet after breakfast', 'Calcium — 1 tablet after dinner'],
      tips: ['Eat 5-6 small meals instead of 3 large ones', 'Drink 8-10 glasses of water daily', 'Avoid tea/coffee within 1 hour of eating', 'Include one citrus food daily to boost iron absorption']
    }});
  } catch (err) { res.status(500).json({ error: err instanceof Error ? err.message : 'Nutrition plan failed' }); }
});

// ── Feature 2: Medical Report Analyzer ───────────────────────────────────────
app.post('/api/ai/analyze-report', async (req, res) => {
  try {
    const { reportText, reportType, gestationalWeek, imageBase64, imageMimeType } = req.body;

    const prompt = `You are a maternal health doctor analyzing a pregnancy ${reportType || 'lab'} report. Patient gestational week: ${gestationalWeek || 'unknown'}.
Analyze this medical report and return ONLY JSON:
{"findings":["key finding 1","key finding 2"],"abnormalValues":["abnormal value with context"],"riskIndicators":["any risk for pregnancy"],"followUp":"specific recommendation for pregnant woman","aiSummary":"2-3 sentence plain language summary for patient"}`;

    // If image data sent (scanned PDF or image upload) — use Gemini Vision
    if (imageBase64 && imageMimeType && isGeminiConfigured()) {
      const analysis = await generateJSONWithImage<{
        findings: string[]; abnormalValues: string[];
        riskIndicators: string[]; followUp: string; aiSummary: string;
      }>(prompt, imageBase64, imageMimeType);
      return res.json({ analysis });
    }

    if (!reportText) return res.status(400).json({ error: 'Report text or image required' });

    // Text-based analysis
    const isJustFilename = reportText.trim().startsWith('File uploaded:') || reportText.trim().length < 20;
    if (isJustFilename) {
      return res.json({ analysis: {
        findings: ['Report file received'],
        abnormalValues: [],
        riskIndicators: [],
        followUp: 'Please type your lab values in the text box for AI analysis (e.g., Hemoglobin: 9.2 g/dL, Blood Pressure: 142/92 mmHg)',
        aiSummary: 'Could not extract text from this file. Please type your key lab values in the text area below and click Analyze Report.',
      }});
    }

    if (isGeminiConfigured()) {
      const analysis = await generateJSON<{
        findings: string[]; abnormalValues: string[];
        riskIndicators: string[]; followUp: string; aiSummary: string;
      }>(`${prompt}\n\nReport content:\n"${reportText}"`);
      return res.json({ analysis });
    }

    res.json({ analysis: {
      findings: ['Report received', `${reportType || 'Lab'} values extracted`],
      abnormalValues: [],
      riskIndicators: [],
      followUp: 'Share this report with your ASHA worker or PHC doctor for interpretation',
      aiSummary: 'Your report has been received. Please consult your healthcare provider for detailed interpretation.',
    }});
  } catch (err) {
    console.error('analyze-report error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Report analysis failed' });
  }
});

// ── Regex fallback helpers ────────────────────────────────────────────────────

function extractMedicinesRegex(text: string): { name: string; dosage: string; frequency: string; duration: string; purpose: string; time: string }[] {
  const medicines: { name: string; dosage: string; frequency: string; duration: string; purpose: string; time: string }[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    // Match patterns like: "1. Medicine Name 200mg - twice daily - 3 months"
    // or "Medicine Name: Ferrous Sulphate 200mg"
    // or "Rx: Amoxicillin 500mg TDS x 5 days"
    const medMatch = line.match(/(?:^\d+[.)]\s*|Medicine\s*(?:Name)?[:\s]+|Rx[:\s]+|Tab\.|Cap\.|Inj\.)([A-Za-z][A-Za-z\s+&\/\-]{2,40}?)(?:\s+(\d+\s*(?:mg|ml|mcg|g|IU|units?)))?/i);
    if (medMatch && medMatch[1]?.trim().length > 2) {
      const name = medMatch[1].trim().replace(/\s+/g, ' ');
      // Skip if it looks like a section header
      if (/^(Patient|Doctor|Date|Report|Hospital|Clinic|Test|Blood|Urine|Section|Investigation)/i.test(name)) continue;

      const dosage = medMatch[2] || 'As prescribed';
      // Look for frequency in same line
      const freqMatch = line.match(/(\d-\d-\d|once|twice|thrice|TDS|BD|OD|QID|daily|weekly|\d+\s*times)/i);
      const durMatch = line.match(/(\d+\s*(?:days?|weeks?|months?|years?))/i);

      medicines.push({
        name,
        dosage,
        frequency: freqMatch ? freqMatch[1] : 'As directed',
        duration: durMatch ? durMatch[1] : 'As prescribed',
        purpose: '',
        time: '08:00',
      });
    }
  }
  // Deduplicate by name
  const seen = new Set<string>();
  return medicines.filter(m => {
    const key = m.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 10); // max 10 medicines
}

function extractAppointmentsRegex(text: string): { title: string; date: string; type: string; location: string }[] {
  const appointments: { title: string; date: string; type: string; location: string }[] = [];

  // Match date patterns for follow-up mentions
  const followUpPatterns = [
    /(?:next\s+appointment|follow[- ]?up|review|revisit|come\s+back|visit\s+again)[^\n]*?(\d{1,2}[\/\-\s]\w+[\/\-\s]\d{2,4}|\d{1,2}\s+\w+\s+\d{4})/gi,
    /(?:review\s+after|follow\s+up\s+(?:on|in|after))[^\n]*?(\d{1,2}[\/\-\s]\w+[\/\-\s]\d{2,4}|\d{1,2}\s+\w+\s+\d{4})/gi,
    /appointment\s+(?:on|date)[:\s]+(\d{1,2}[\/\-\s]\w+[\/\-\s]\d{2,4}|\d{1,2}\s+\w+\s+\d{4})/gi,
  ];

  for (const pattern of followUpPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const dateStr = match[1];
      if (dateStr) {
        const parsed = new Date(dateStr);
        const dateFormatted = isNaN(parsed.getTime()) ? '' : parsed.toISOString().split('T')[0];
        appointments.push({
          title: 'Follow-up Appointment',
          date: dateFormatted,
          type: 'follow_up',
          location: 'Nearest PHC',
        });
      }
    }
  }

  return appointments.slice(0, 5);
}

// ── Feature 2b: Analyze Report via direct file upload ────────────────────────
app.post('/api/ai/analyze-file', upload.single('file'), async (req, res) => {
  try {
    // ── PHASE 1: FILE RECEIVED ────────────────────────────────────────────────
    console.log('[analyze-file] REQUEST RECEIVED');
    console.log('[analyze-file] FILE RECEIVED:', req.file?.originalname || 'NONE');
    console.log('[analyze-file] FILE SIZE:', req.file?.size || 0, 'bytes');
    console.log('[analyze-file] MIME TYPE:', req.file?.mimetype || 'NONE');
    console.log('[analyze-file] BODY KEYS:', Object.keys(req.body || {}));

    if (!req.file) {
      console.log('[analyze-file] ERROR: No file in request — multer did not parse it');
      return res.status(400).json({ error: 'No file uploaded — server did not receive the file. Check Content-Type header.' });
    }

    const { reportType, gestationalWeek } = req.body;
    const fileBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;
    const base64 = fileBuffer.toString('base64');

    console.log('[analyze-file] BASE64 LENGTH:', base64.length);

    // ── PHASE 2: DETECT MIME TYPE — real PDF vs text content ─────────────────
    // If multer says application/pdf but content starts with text, treat as text/plain
    // Real PDFs start with %PDF-1. Fake PDFs (text sent as PDF) don't.
    const fileStart = fileBuffer.slice(0, 5).toString('ascii');
    const isRealPdf = fileStart.startsWith('%PDF-');
    const effectiveMimeType = isRealPdf ? mimeType : 'text/plain';
    console.log('[analyze-file] FILE START:', JSON.stringify(fileStart), '| IS REAL PDF:', isRealPdf, '| EFFECTIVE MIME:', effectiveMimeType);

    // If text content, extract it for logging and direct AI use
    const textContent = !isRealPdf ? fileBuffer.toString('utf-8') : null;
    if (textContent) {
      console.log('[analyze-file] TEXT CONTENT LENGTH:', textContent.length);
      console.log('[analyze-file] TEXT PREVIEW:', textContent.slice(0, 500));
    }
    const prompt = `You are a maternal health doctor. Carefully read this ${reportType || 'lab'} report for a patient at ${gestationalWeek || 'unknown'} weeks of pregnancy.
Extract ALL visible lab values, medicines, and follow-up appointments from the document.

Return ONLY this JSON (no markdown, no extra text):
{
  "findings": ["specific finding from the report"],
  "abnormalValues": ["value name: X (normal range: Y — concern: Z)"],
  "riskIndicators": ["specific risk relevant to pregnancy"],
  "followUp": "specific actionable recommendation for the pregnant patient",
  "aiSummary": "2-3 sentence plain language summary for the patient",
  "medicines": [
    {
      "name": "medicine name",
      "dosage": "dose amount e.g. 200mg",
      "frequency": "e.g. Twice daily / 1-0-1",
      "duration": "e.g. 3 months",
      "purpose": "reason prescribed e.g. Iron deficiency anaemia",
      "time": "08:00"
    }
  ],
  "appointments": [
    {
      "title": "appointment title e.g. Prenatal Follow-up",
      "date": "YYYY-MM-DD format if mentioned, else empty string",
      "type": "ANC or follow_up or lab or ultrasound",
      "location": "location if mentioned, else Nearest PHC"
    }
  ]
}

Rules:
- If no medicines mentioned, return empty array []
- If no appointments mentioned, return empty array []
- Extract ALL prescribed medications including supplements
- If a follow-up date is mentioned, add it to appointments
- Common medicines to look for: Iron, Folic Acid, Calcium, Vitamins, Antibiotics, Antihypertensives`;

    // ── PHASE 3: BUILD PROMPT ─────────────────────────────────────────────────

    // ── PHASE 3: BUILD PROMPT ─────────────────────────────────────────────────
    const prompt = `You are a maternal health doctor. Carefully read this ${reportType || 'lab'} report for a patient at ${gestationalWeek || 'unknown'} weeks of pregnancy.
Extract ALL visible lab values, medicines, and follow-up appointments from the document.

Return ONLY this JSON (no markdown, no extra text):
{
  "findings": ["specific finding from the report"],
  "abnormalValues": ["value name: X (normal range: Y — concern: Z)"],
  "riskIndicators": ["specific risk relevant to pregnancy"],
  "followUp": "specific actionable recommendation for the pregnant patient",
  "aiSummary": "2-3 sentence plain language summary for the patient",
  "medicines": [
    {
      "name": "medicine name",
      "dosage": "dose amount e.g. 200mg",
      "frequency": "e.g. Twice daily / 1-0-1",
      "duration": "e.g. 3 months",
      "purpose": "reason prescribed e.g. Iron deficiency anaemia",
      "time": "08:00"
    }
  ],
  "appointments": [
    {
      "title": "appointment title e.g. Prenatal Follow-up",
      "date": "YYYY-MM-DD format if mentioned, else empty string",
      "type": "ANC or follow_up or lab or ultrasound",
      "location": "location if mentioned, else Nearest PHC"
    }
  ]
}

Rules:
- If no medicines mentioned, return empty array []
- If no appointments mentioned, return empty array []
- Extract ALL prescribed medications including supplements
- If a follow-up date is mentioned, add it to appointments
- Common medicines to look for: Iron, Folic Acid, Calcium, Vitamins, Antibiotics, Antihypertensives, Metformin`;

    console.log('[analyze-file] PROMPT LENGTH:', prompt.length);
    console.log('[analyze-file] GEMINI CONFIGURED:', isGeminiConfigured());

    // ── PHASE 4: AI ANALYSIS ──────────────────────────────────────────────────
    if (isGeminiConfigured()) {
      try {
        console.log('[analyze-file] SENDING TO GEMINI — effectiveMimeType:', effectiveMimeType);

        type AnalysisResult = {
          findings: string[]; abnormalValues: string[];
          riskIndicators: string[]; followUp: string; aiSummary: string;
          medicines?: { name: string; dosage: string; frequency: string; duration: string; purpose: string; time?: string }[];
          appointments?: { title: string; date: string; type: string; location: string }[];
        };

        let result: AnalysisResult;

        if (!isRealPdf && textContent) {
          // Text content — send directly as text prompt (no upload needed, faster, reliable)
          console.log('[analyze-file] TEXT MODE — sending content directly in prompt');
          result = await generateJSON<AnalysisResult>(
            `${prompt}\n\nDocument content:\n${textContent.slice(0, 8000)}`
          );
        } else {
          // Real PDF binary — use Gemini Files API
          console.log('[analyze-file] PDF MODE — uploading to Gemini Files API');
          result = await generateJSONWithImage<AnalysisResult>(prompt, base64, effectiveMimeType);
        }

        let medicines = result.medicines || [];
        let appointments = result.appointments || [];
        console.log('[analyze-file] AI medicines:', JSON.stringify(medicines));
        console.log('[analyze-file] AI appointments:', JSON.stringify(appointments));

        // ── Regex fallback if AI returned empty medicines/appointments ────────
        const contentForRegex = textContent || fileBuffer.toString('utf-8', 0, Math.min(fileBuffer.length, 5000));
        if (medicines.length === 0) {
          medicines = extractMedicinesRegex(contentForRegex);
          if (medicines.length > 0) console.log('[analyze-file] REGEX medicines:', JSON.stringify(medicines));
        }
        if (appointments.length === 0) {
          appointments = extractAppointmentsRegex(contentForRegex);
          if (appointments.length > 0) console.log('[analyze-file] REGEX appointments:', JSON.stringify(appointments));
        }

        console.log('[analyze-file] FINAL — findings:', result.findings?.length, 'medicines:', medicines.length, 'appointments:', appointments.length);

        return res.json({
          analysis: {
            findings: result.findings || [],
            abnormalValues: result.abnormalValues || [],
            riskIndicators: result.riskIndicators || [],
            followUp: result.followUp || '',
            aiSummary: result.aiSummary || '',
          },
          medicines,
          appointments,
        });

      } catch (geminiErr) {
        const msg = (geminiErr as Error).message || '';
        console.error('[analyze-file] GEMINI ERROR:', msg.slice(0, 300));

        if (msg.includes('429') || msg.includes('quota')) {
          return res.status(429).json({
            error: 'AI quota exceeded',
            analysis: {
              findings: ['AI analysis temporarily unavailable due to quota limits'],
              abnormalValues: [], riskIndicators: [],
              followUp: 'Gemini quota exceeded. Please try again in a few hours or type your lab values manually.',
              aiSummary: '⏳ AI quota reached. Type your key lab values in the text area below for instant analysis.',
            },
            medicines: [], appointments: [],
          });
        }
        throw geminiErr;
      }
    }

    console.log('[analyze-file] Gemini not configured — returning stub');
    res.json({
      analysis: {
        findings: ['Report received'], abnormalValues: [], riskIndicators: [],
        followUp: 'Please consult your doctor for interpretation.',
        aiSummary: 'File received. Configure Gemini API for AI analysis.',
      },
      medicines: [], appointments: [],
    });
  } catch (err) {
    console.error('[analyze-file] UNHANDLED ERROR:', err instanceof Error ? err.message : String(err));
    res.status(500).json({ error: err instanceof Error ? err.message : 'File analysis failed' });
  }
});


app.post('/api/ai/digital-twin', async (req, res) => {
  try {
    const { pregnancyId, riskHistory, dailyEntries, medicines, appointments } = req.body;
    const checkInRate = dailyEntries?.length > 0 ? Math.min(100, Math.round((dailyEntries.length / 30) * 100)) : 0;
    const takenCount = medicines?.filter((m: {taken:boolean}) => m.taken).length || 0;
    const medicineRate = medicines?.length > 0 ? Math.round((takenCount / medicines.length) * 100) : 0;
    const completedAppts = appointments?.filter((a: {status:string}) => a.status === 'completed').length || 0;
    const apptRate = appointments?.length > 0 ? Math.round((completedAppts / appointments.length) * 100) : 0;
    const latestRisk = riskHistory?.[riskHistory.length - 1]?.riskScore || 50;
    const riskScore = 100 - latestRisk;
    const healthScore = Math.round((riskScore * 0.4) + (checkInRate * 0.25) + (medicineRate * 0.2) + (apptRate * 0.15));
    const trend = riskHistory?.length >= 2 ? (riskHistory[riskHistory.length-1].riskScore > riskHistory[riskHistory.length-2].riskScore ? 'worsening' : 'improving') : 'stable';
    const futureProjection = Array.from({ length: 6 }, (_, i) => {
      const week = (riskHistory?.[riskHistory.length-1]?.week || 20) + (i+1)*2;
      const delta = trend === 'worsening' ? i*3 : trend === 'improving' ? -i*2 : 0;
      return { week, predictedScore: Math.max(5, Math.min(95, latestRisk + delta)) };
    });
    const insights: string[] = [];
    if (checkInRate < 70) insights.push(`Check-in compliance at ${checkInRate}% — try to report daily for better monitoring`);
    if (medicineRate < 80) insights.push('Medicine compliance needs improvement — set reminders for daily supplements');
    if (latestRisk > 60) insights.push('Risk score elevated — contact your ASHA worker for a home visit');
    if (apptRate < 60) insights.push('Appointment adherence below target — upcoming visits are critical at this stage');
    if (insights.length === 0) insights.push('Excellent health management! Keep up with daily check-ins and medicines.');
    res.json({ twin: { pregnancyId, healthScore, complianceScore: checkInRate, nutritionScore: 72, medicineScore: medicineRate, riskTrajectory: trend, futureRiskProjection: futureProjection, insights, lastUpdated: new Date().toISOString() } });
  } catch (err) { res.status(500).json({ error: err instanceof Error ? err.message : 'Digital twin failed' }); }
});

// ── Local chat fallback ───────────────────────────────────────────────────────
function getSmartLocalReply(message: string, lang: string): string {
  const lower = message.toLowerCase();
  const hi = lang === 'hi';
  if (['headache','सिरदर्द','தலைவலி','తలనొప్పి'].some(k => lower.includes(k)))
    return hi ? `🤱 सिरदर्द हार्मोनल बदलाव या रक्तचाप से हो सकता है।\n\n✅ पानी पिएं, अंधेरे कमरे में आराम करें।\n\n🚨 तुरंत अस्पताल जाएं यदि तेज सिरदर्द + धुंधली दृष्टि + सूजन।`
      : `🤱 **What this could mean**\nHeadaches are common in pregnancy due to hormonal changes or blood pressure.\n\n✅ **Immediate steps** — Drink water, rest in a quiet room.\n\n🚨 **Go to hospital IMMEDIATELY if** severe headache + vision changes + facial swelling (signs of preeclampsia).`;
  if (['movement','kick','हलचल','அசைவு','కదలిక'].some(k => lower.includes(k)))
    return hi ? `🤱 28 सप्ताह के बाद 2 घंटे में 10 हलचल होनी चाहिए।\n\n✅ बाईं करवट लेटें, ठंडा पानी पिएं।\n\n🚨 तुरंत अस्पताल जाएं यदि 12+ घंटे से कोई हलचल नहीं।`
      : `🤱 **Fetal Movement**\nAfter week 28, count 10 movements in 2 hours.\n\n✅ Lie on left side, drink cold water.\n\n🚨 **EMERGENCY if** no movement for 12+ hours — go to hospital immediately.`;
  if (['swelling','सूजन','வீக்கம்','వాపు'].some(k => lower.includes(k)))
    return hi ? `🤱 पैरों की हल्की सूजन सामान्य है।\n\n✅ पैरों को ऊपर उठाकर लेटें, बाईं करवट सोएं।\n\n🚨 चेहरे की अचानक सूजन + सिरदर्द = तुरंत अस्पताल।`
      : `🤱 Mild foot swelling is normal in pregnancy.\n\n✅ Elevate feet, sleep on left side, drink water.\n\n🚨 **EMERGENCY** — sudden face/hand swelling + headache + vision changes.`;
  if (['bleed','blood','खून','रक्त','இரத்தம்','రక్తం'].some(k => lower.includes(k)))
    return hi ? `🚨 आपातस्थिति — कोई भी रक्तस्राव तुरंत चिकित्सीय ध्यान की मांग करता है। अभी ASHA कार्यकर्ता को बुलाएं।`
      : `🚨 **EMERGENCY** — Any vaginal bleeding requires IMMEDIATE medical attention.\n\n- Call your ASHA worker NOW\n- Use the SOS button\n- Go to the nearest hospital immediately`;
  if (['vomit','nausea','उल्टी','மசக்கை','వాంతి'].some(k => lower.includes(k)))
    return hi ? `🤱 मतली पहली तिमाही में सामान्य है।\n\n✅ छोटे-छोटे भोजन, अदरक की चाय।\n\n📞 ASHA को बुलाएं यदि दिन में 4+ बार उल्टी।`
      : `🤱 Nausea is common especially in the first trimester.\n\n✅ Eat small frequent meals, try ginger tea.\n\n📞 Contact ASHA if vomiting more than 4 times/day.`;
  if (['food','eat','diet','nutrition','खाना','पोषण','உணவு'].some(k => lower.includes(k)))
    return hi ? `🤱 गर्भावस्था में पोषण:\n✅ अधिक खाएं: पालक, दाल, दूध, दही, रागी, गुड़\n⚠️ परहेज: कच्चा मांस, अधिक चाय, शराब बिल्कुल नहीं\n💊 रोज लें: आयरन+फोलिक एसिड, कैल्शियम`
      : `🤱 **Pregnancy Nutrition Guide**\n✅ Eat more: Spinach, dal, milk, curd, ragi, jaggery, eggs\n⚠️ Avoid: Raw meat/eggs, excess tea/coffee, alcohol\n💊 Daily supplements: Iron+Folic Acid, Calcium`;
  return hi
    ? `🤱 मैं माँरक्षा हूँ — आपकी मातृ स्वास्थ्य गाइड। सिरदर्द, सूजन, बच्चे की हलचल, या पोषण के बारे में पूछें।\n📞 किसी भी गंभीर लक्षण के लिए अपनी ASHA कार्यकर्ता से संपर्क करें।`
    : `🤱 I'm MaaRaksha, your maternal health guide. Ask me about headaches, swelling, fetal movement, nutrition, or any pregnancy concern.\n📞 For serious symptoms, contact your ASHA worker immediately.`;
}

app.listen(PORT, () => {
  console.log(`MaaRaksha API running on port ${PORT}`);
  console.log(`Gemini AI: ${isGeminiConfigured() ? 'ENABLED' : 'DEMO MODE (local fallback)'}`);
});

// Global error handler — prevents unhandled promise rejections from crashing
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
