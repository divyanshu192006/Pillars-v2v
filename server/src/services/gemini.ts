import { GoogleGenerativeAI } from '@google/generative-ai';

// Lazy init — dotenv.config() in index.ts runs before first call
let _genAI: GoogleGenerativeAI | null | undefined = undefined;

function getGenAI(): GoogleGenerativeAI | null {
  if (_genAI !== undefined) return _genAI;
  const apiKey = process.env.GEMINI_API_KEY;
  _genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  return _genAI;
}

// Model fallback chain — tries each until one succeeds
const MODEL_CHAIN = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest',
];

export function isGeminiConfigured(): boolean {
  return !!getGenAI();
}

async function tryGenerate(
  prompt: string,
  systemInstruction?: string,
  chatHistory?: { role: string; parts: { text: string }[] }[],
  userMessage?: string,
): Promise<string> {
  const genAI = getGenAI();
  if (!genAI) throw new Error('Gemini not configured');

  let lastError: Error | null = null;

  for (const modelName of MODEL_CHAIN) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        ...(systemInstruction ? { systemInstruction } : {}),
      });

      if (chatHistory && userMessage !== undefined) {
        // Multi-turn chat
        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(userMessage);
        return result.response.text();
      } else {
        // Single prompt
        const result = await model.generateContent(prompt);
        return result.response.text();
      }
    } catch (err) {
      lastError = err as Error;
      const msg = (err as Error).message || '';
      // Only continue fallback for quota/not-found errors
      if (msg.includes('429') || msg.includes('404') || msg.includes('not found') || msg.includes('quota')) {
        console.warn(`Model ${modelName} failed (${msg.slice(0, 80)}), trying next...`);
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('All Gemini models exhausted');
}

export async function generateText(prompt: string): Promise<string> {
  return tryGenerate(prompt);
}

export async function generateJSON<T>(prompt: string): Promise<T> {
  const text = await generateText(prompt + '\n\nRespond ONLY with valid JSON, no markdown.');
  const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleaned) as T;
}

export async function generateWithImage(
  prompt: string,
  imageBase64: string,
  mimeType: string,
): Promise<string> {
  const genAI = getGenAI();
  if (!genAI) throw new Error('Gemini not configured');

  for (const modelName of MODEL_CHAIN) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([
        { inlineData: { data: imageBase64, mimeType } },
        prompt,
      ]);
      return result.response.text();
    } catch (err) {
      const msg = (err as Error).message || '';
      if (msg.includes('429') || msg.includes('404') || msg.includes('not found') || msg.includes('quota')) {
        continue;
      }
      throw err;
    }
  }
  throw new Error('All Gemini vision models exhausted');
}

export async function generateJSONWithImage<T>(
  prompt: string,
  imageBase64: string,
  mimeType: string,
): Promise<T> {
  const text = await generateWithImage(
    prompt + '\n\nRespond ONLY with valid JSON, no markdown.',
    imageBase64,
    mimeType,
  );
  const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleaned) as T;
}

export async function chatWithHistory(
  systemInstruction: string,
  history: { role: string; parts: { text: string }[] }[],
  message: string,
): Promise<string> {
  return tryGenerate('', systemInstruction, history, message);
}
