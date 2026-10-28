import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LITE_MODEL = 'gemini-3.1-flash-lite';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  // 1. Multi-turn Gemini Chatbot Proxy Endpoint (/api/chat) — Locked to gemini-3.1-flash-lite for quota efficiency
  app.post('/api/chat', async (req, res) => {
    try {
      const {
        message,
        history = [],
        systemInstruction,
        labContext = '',
      } = req.body || {};

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Missing chat message' });
        return;
      }

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error: 'SERVER_KEY_NOT_CONFIGURED',
          message: 'GEMINI_API_KEY environment variable is not configured on the server.',
        });
        return;
      }

      const defaultSystemPrompt = [
        'Bạn là Gia sư AI của phòng thí nghiệm ảo LabSim (Lý - Hóa - Sinh THPT GDPT 2018).',
        'Trả lời ngắn gọn, súc tích (tối đa 4 gạch đầu dòng), nêu đúng phương trình/công thức trọng tâm và 1 câu hỏi gợi mở.',
        systemInstruction ? `Lưu ý: ${systemInstruction}` : '',
        labContext ? `Bàn Lab:\n${labContext}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      // Keep only the last 6 turns and trim length to save input quota
      const sanitizedHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> =
        Array.isArray(history)
          ? (history as ChatTurn[])
              .filter(
                (h) =>
                  h &&
                  (h.role === 'user' || h.role === 'model') &&
                  typeof h.text === 'string' &&
                  h.text.trim().length > 0
              )
              .slice(-6)
              .map((h) => ({
                role: h.role,
                parts: [{ text: h.text.slice(0, 500) }],
              }))
          : [];

      const contents = [
        ...sanitizedHistory,
        {
          role: 'user' as const,
          parts: [{ text: message.slice(0, 600) }],
        },
      ];

      const response = await ai.models.generateContent({
        model: LITE_MODEL,
        contents,
        config: {
          systemInstruction: defaultSystemPrompt,
          temperature: 0.6,
          maxOutputTokens: 360,
        },
      });

      res.json({
        text: response.text || '',
        model: LITE_MODEL,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown Gemini Chat API error';
      res.status(500).json({ error: message });
    }
  });

  // 2. General Server-side Gemini API Proxy Endpoint (/api/gemini) — Locked to gemini-3.1-flash-lite
  app.post('/api/gemini', async (req, res) => {
    try {
      const {
        prompt,
        history,
        systemInstruction,
        responseMimeType,
      } = req.body || {};

      if (!prompt && (!Array.isArray(history) || history.length === 0)) {
        res.status(400).json({ error: 'Missing prompt' });
        return;
      }

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error: 'SYSTEM_KEY_UNAVAILABLE',
          message: 'GEMINI_API_KEY is not configured on the server.',
        });
        return;
      }

      const config: Record<string, unknown> = {
        maxOutputTokens: 360,
      };
      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }
      if (responseMimeType) {
        config.responseMimeType = responseMimeType;
      }

      const contents =
        Array.isArray(history) && history.length > 0
          ? [
              ...history.slice(-6).map((h: ChatTurn) => ({
                role: h.role === 'model' ? 'model' : 'user',
                parts: [{ text: String(h.text || '').slice(0, 500) }],
              })),
              ...(prompt ? [{ role: 'user', parts: [{ text: String(prompt).slice(0, 600) }] }] : []),
            ]
          : String(prompt).slice(0, 800);

      const response = await ai.models.generateContent({
        model: LITE_MODEL,
        contents,
        config,
      });

      res.json({
        text: response.text || '',
        model: LITE_MODEL,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown Gemini API error';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LabSim 3D & AI Lab server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
