import { GoogleGenAI } from '@google/genai';

const ALLOWED_MODELS = new Set([
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-4-argon',
]);

interface ServerlessRequest {
  method?: string;
  body?: {
    prompt?: string;
    systemInstruction?: string;
    responseMimeType?: string;
    model?: string;
  };
}

interface ServerlessResponse {
  status: (code: number) => ServerlessResponse;
  json: (payload: Record<string, unknown>) => void;
}

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { prompt, systemInstruction, responseMimeType, model = 'gemini-3.8-flash' } = req.body || {};
    if (!prompt) {
      res.status(400).json({ error: 'Missing prompt' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      res.status(503).json({
        error: 'SYSTEM_KEY_UNAVAILABLE',
        message: 'GEMINI_API_KEY environment variable is not configured on the server.',
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const selectedModel = ALLOWED_MODELS.has(model) ? model : 'gemini-3.8-flash';
    const config: Record<string, unknown> = {};
    if (systemInstruction) config.systemInstruction = systemInstruction;
    if (responseMimeType) config.responseMimeType = responseMimeType;

    let actualModel = selectedModel;
    let response;
    try {
      response = await ai.models.generateContent({
        model: selectedModel,
        contents: String(prompt),
        config,
      });
    } catch (err) {
      if (selectedModel !== 'gemini-3.8-flash') {
        actualModel = 'gemini-3.8-flash';
        response = await ai.models.generateContent({
          model: actualModel,
          contents: String(prompt),
          config,
        });
      } else {
        throw err;
      }
    }

    res.status(200).json({
      text: response.text || '',
      model: actualModel,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown Gemini API error';
    res.status(500).json({ error: message });
  }
}
