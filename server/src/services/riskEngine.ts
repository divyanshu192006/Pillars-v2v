interface RiskInput {
  symptoms: string[];
  gestationalWeek: number;
  bloodPressure?: string;
  previousComplications?: string[];
  transcription?: string;
  pregnancyId?: string;
}

interface RiskOutput {
  riskLevel: 'GREEN' | 'YELLOW' | 'RED';
  riskScore: number;
  riskFactors: string[];
  clinicalReasoning: string;
  suggestedAction: string;
  followUpRecommendation: string;
}

export function assessRiskLocal(input: RiskInput): RiskOutput {
  let score = 15;
  const factors: string[] = [];

  const highRisk = ['Reduced fetal movement', 'Bleeding', 'High BP symptoms', 'Breathing difficulty'];
  const medRisk = ['Severe headache', 'Oedema (swelling)', 'Blurred vision', 'Abdominal pain', 'Dizziness'];

  for (const s of input.symptoms) {
    if (highRisk.some(h => s.toLowerCase().includes(h.toLowerCase().split(' ')[0]))) {
      score += 25;
      factors.push(s);
    } else if (medRisk.some(m => s.toLowerCase().includes(m.toLowerCase().split(' ')[0]))) {
      score += 15;
      factors.push(s);
    } else {
      score += 5;
      factors.push(s);
    }
  }

  if (input.gestationalWeek >= 28) score += 5;
  if (input.gestationalWeek >= 34) score += 5;

  if (input.bloodPressure) {
    const sys = parseInt(input.bloodPressure.split('/')[0]);
    if (sys >= 160) { score += 30; factors.push(`Severely elevated BP (${input.bloodPressure})`); }
    else if (sys >= 140) { score += 20; factors.push(`Elevated BP (${input.bloodPressure})`); }
    else if (sys >= 130) { score += 10; factors.push(`Borderline BP (${input.bloodPressure})`); }
  }

  if (input.previousComplications?.length) {
    score += input.previousComplications.length * 8;
    factors.push(...input.previousComplications.map(c => `History: ${c}`));
  }

  score = Math.min(100, score);
  const riskLevel = score >= 70 ? 'RED' : score >= 40 ? 'YELLOW' : 'GREEN';

  return {
    riskLevel,
    riskScore: score,
    riskFactors: [...new Set(factors)],
    clinicalReasoning: `Clinical analysis of ${input.symptoms.length} symptom(s) at ${input.gestationalWeek} weeks gestation. ${riskLevel === 'RED' ? 'Critical presentation requiring immediate evaluation per WHO maternal health guidelines.' : riskLevel === 'YELLOW' ? 'Moderate risk indicators present. Enhanced monitoring recommended.' : 'Low risk profile. Continue routine antenatal care.'}`,
    suggestedAction: riskLevel === 'RED' ? 'URGENT: Immediate referral to PHC/district hospital. Do not delay.' : riskLevel === 'YELLOW' ? 'Schedule clinical assessment within 24-48 hours. Monitor BP and fetal movement.' : 'Continue routine ANC schedule. Next visit as planned.',
    followUpRecommendation: riskLevel === 'RED' ? 'ASHA to arrange emergency transport. Alert family, PHC staff, and district officer.' : 'ASHA home visit within 48 hours. Repeat voice symptom check in 24 hours.',
  };
}

export async function assessRiskWithAI(input: RiskInput, generateJSON: <T>(prompt: string) => Promise<T>): Promise<RiskOutput> {
  try {
    const result = await generateJSON<RiskOutput>(`
You are a maternal health clinical risk assessment AI aligned with WHO guidelines.
Analyze this pregnancy case and return JSON with: riskLevel (GREEN/YELLOW/RED), riskScore (0-100), riskFactors (array), clinicalReasoning, suggestedAction, followUpRecommendation.

Symptoms: ${input.symptoms.join(', ')}
Gestational Week: ${input.gestationalWeek}
Blood Pressure: ${input.bloodPressure || 'Not provided'}
Previous Complications: ${input.previousComplications?.join(', ') || 'None'}
Patient Report: ${input.transcription || 'N/A'}
    `);
    return result;
  } catch {
    return assessRiskLocal(input);
  }
}

export function extractSymptomsLocal(transcription: string): string[] {
  const mappings: Record<string, string> = {
    headache: 'Severe headache', swelling: 'Oedema (swelling)', swollen: 'Oedema (swelling)',
    dizzy: 'Dizziness', dizziness: 'Dizziness', bleed: 'Bleeding', bleeding: 'Bleeding',
    movement: 'Reduced fetal movement', vision: 'Blurred vision', breath: 'Breathing difficulty',
    pain: 'Abdominal pain', nausea: 'Nausea/Vomiting', fever: 'Fever', contraction: 'Contractions',
    सिरदर्द: 'Severe headache', सूजन: 'Oedema (swelling)', चक्कर: 'Dizziness',
    खून: 'Bleeding', हलचल: 'Reduced fetal movement',
  };
  const lower = transcription.toLowerCase();
  const found: string[] = [];
  for (const [key, label] of Object.entries(mappings)) {
    if (lower.includes(key) && !found.includes(label)) found.push(label);
  }
  return found.length ? found : ['General discomfort reported'];
}
