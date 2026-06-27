const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  assessRisk: (data: Record<string, unknown>) =>
    request<{ report: import('@/types').RiskReport }>('/risk/assess', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  extractSymptoms: (transcription: string, language: string) =>
    request<{ symptoms: string[]; summary: string }>('/ai/symptoms', {
      method: 'POST',
      body: JSON.stringify({ transcription, language }),
    }),

  chatAssistant: (
    message: string,
    language: string,
    history: { role: string; content: string }[],
    pregnancyContext?: Record<string, unknown>,
  ) =>
    request<{ reply: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, language, history, pregnancyContext }),
    }),

  generateReport: (pregnancyId: string) =>
    request<{ report: import('@/types').MedicalReport }>('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ pregnancyId }),
    }),

  sendAlert: (data: Record<string, unknown>) =>
    request<{ alert: import('@/types').Alert }>('/alerts/send', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getTrendInsights: (districtId?: string) =>
    request<{ insights: string[] }>(`/analytics/insights${districtId ? `?districtId=${districtId}` : ''}`),

  predictRisk: (data: Record<string, unknown>) =>
    request<{ prediction: import('@/types').PredictiveRisk }>('/ai/predict-risk', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getNutritionPlan: (data: Record<string, unknown>) =>
    request<{ plan: import('@/types').NutritionPlan }>('/ai/nutrition-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  analyzeReport: (data: Record<string, unknown>) =>
    request<{ analysis: { findings: string[]; abnormalValues: string[]; riskIndicators: string[]; followUp: string; aiSummary: string } }>('/ai/analyze-report', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getDigitalTwin: (data: Record<string, unknown>) =>
    request<{ twin: import('@/types').DigitalTwin }>('/ai/digital-twin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  health: () => request<{ status: string; demo: boolean }>('/health'),
};
