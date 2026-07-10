// VITE_API_URL must be set in Vercel environment variables
// Value: https://maarakshak.onrender.com/api
// Falls back to Render URL if env var is missing, or /api proxy in dev
const API_BASE = (() => {
  const env = import.meta.env.VITE_API_URL;
  if (env) return env.replace(/\/$/, '');
  // In dev (localhost), use Vite proxy
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') return '/api';
  // In production without env var, use Pillars-v2v Render directly
  return 'https://pillars-v2v.onrender.com/api';
})();

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

  analyzeFile: async (file: File, reportType: string, gestationalWeek?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('reportType', reportType);
    if (gestationalWeek) formData.append('gestationalWeek', String(gestationalWeek));

    // CRITICAL: Use raw fetch — request() injects Content-Type:application/json
    // which destroys multipart boundary that multer needs.
    // Retry up to 2 times for Render free tier wake-up latency.
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await fetch(`${API_BASE}/ai/analyze-file`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          // 503/502 = backend sleeping — wait and retry
          if (attempt < 2 && (res.status === 503 || res.status === 502)) {
            await new Promise(r => setTimeout(r, 8000));
            continue;
          }
          throw new Error(err.error || `File analysis failed: ${res.status}`);
        }

        return res.json() as Promise<{
          analysis: {
            findings: string[];
            abnormalValues: string[];
            riskIndicators: string[];
            followUp: string;
            aiSummary: string;
          };
          medicines?: unknown[];
          appointments?: unknown[];
        }>;
      } catch (err) {
        // Network error (fetch failed) — backend waking, retry after 8s
        if (attempt < 2 && err instanceof TypeError) {
          await new Promise(r => setTimeout(r, 8000));
          continue;
        }
        throw err;
      }
    }
    throw new Error('File analysis failed after retries');
  },

  getDigitalTwin: (data: Record<string, unknown>) =>
    request<{ twin: import('@/types').DigitalTwin }>('/ai/digital-twin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  health: () => request<{ status: string; demo: boolean }>('/health'),
};
