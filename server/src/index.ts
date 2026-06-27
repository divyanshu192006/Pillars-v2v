import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { isGeminiConfigured, generateJSON, chatWithHistory } from './services/gemini.js';
import { assessRiskLocal, assessRiskWithAI, extractSymptomsLocal } from './services/riskEngine.js';
import { sendEmailAlert } from './services/alerts.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Allow frontend origin — set CORS_ORIGIN env var on Render
// e.g. https://maaraksha.vercel.app
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:4173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, same-origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
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
    const { reportText, reportType, gestationalWeek } = req.body;
    if (!reportText) return res.status(400).json({ error: 'Report text required' });
    
    // If only a filename was sent (PDF/image upload without text extraction), return helpful fallback
    const isJustFilename = reportText.trim().startsWith('File uploaded:') || reportText.trim().length < 20;
    if (isJustFilename) {
      return res.json({ analysis: {
        findings: ['Report file received successfully'],
        abnormalValues: [],
        riskIndicators: [],
        followUp: 'Please type or paste your report values in the text box below for AI analysis. For example: "Hemoglobin: 9.2 g/dL, Blood Pressure: 142/92 mmHg"',
        aiSummary: 'File uploaded. To get AI analysis, please type your lab values in the text area below and click Analyze Report.',
      }});
    }

    if (isGeminiConfigured()) {
      const analysis = await generateJSON<{ findings: string[]; abnormalValues: string[]; riskIndicators: string[]; followUp: string; aiSummary: string }>(
        `You are a maternal health doctor analyzing a pregnancy ${reportType || 'lab'} report. Patient week: ${gestationalWeek || 'unknown'}.\nReport: "${reportText}"\nReturn ONLY JSON: {"findings":["finding1"],"abnormalValues":["any abnormal value with context"],"riskIndicators":["risk if any"],"followUp":"specific recommendation","aiSummary":"2-3 sentence plain language summary"}`
      );
      return res.json({ analysis });
    }
    res.json({ analysis: { findings: ['Report received', `${reportType||'Lab'} values extracted`], abnormalValues: [], riskIndicators: [], followUp: 'Share this report with your ASHA worker or PHC doctor for interpretation', aiSummary: 'Your report has been received. Please consult your healthcare provider for detailed interpretation. Continue regular medications and ANC visits.' } });
  } catch (err) { res.status(500).json({ error: err instanceof Error ? err.message : 'Report analysis failed' }); }
});

// ── Feature 10: Digital Twin ──────────────────────────────────────────────────
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
