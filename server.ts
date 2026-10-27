import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_MODELS = new Set([
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-4-argon',
]);

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

  app.use(express.json({ limit: '2mb' }));

  // 1. Multi-turn Gemini Chatbot Proxy Endpoint (/api/chat)
  app.post('/api/chat', async (req, res) => {
    try {
      const {
        message,
        history = [],
        systemInstruction,
        model = 'gemini-3.8-flash',
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

      const requestedModel = ALLOWED_MODELS.has(model) ? model : 'gemini-3.8-flash';

      const defaultSystemPrompt = [
        'Bạn là Gia sư AI Socratic chuyên sâu của nền tảng phòng thí nghiệm ảo LabSim (Vật Lý - Hóa Học - Sinh Học THPT chuẩn chương trình GDPT 2018 Việt Nam).',
        'Nhiệm vụ của bạn:',
        '1. Giải thích cặn kẽ bản chất hiện tượng khoa học, cơ chế phản ứng hóa học, định luật vật lý và quá trình sinh học đang diễn ra trên bàn thí nghiệm.',
        '2. Luôn trích dẫn phương trình hóa học, phương trình ion thu gọn hoặc công thức vật lý/sinh học chính xác.',
        '3. Đặt 1 câu hỏi gợi mở ngắn gọn ở cuối câu trả lời theo phương pháp Socratic để khuyến khích học sinh tự thực nghiệm trên bàn Lab 2D, mô hình 3D hoặc chế độ AR.',
        '4. Trả lời bằng ngôn ngữ tương ứng với ngôn ngữ người dùng đang sử dụng (Tiếng Việt hoặc Tiếng Anh), trình bày rõ ràng với các gạch đầu dòng ngắn gọn, dễ đọc.',
        systemInstruction ? `\nHướng dẫn bổ sung: ${systemInstruction}` : '',
        labContext ? `\nTrạng thái bàn thí nghiệm hiện tại:\n${labContext}` : '',
      ]
        .filter(Boolean)
        .join('\n');

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
              .slice(-16)
              .map((h) => ({
                role: h.role,
                parts: [{ text: h.text }],
              }))
          : [];

      const contents = [
        ...sanitizedHistory,
        {
          role: 'user' as const,
          parts: [{ text: message }],
        },
      ];

      let usedModel = requestedModel;
      let responseText = '';

      try {
        const response = await ai.models.generateContent({
          model: requestedModel,
          contents,
          config: {
            systemInstruction: defaultSystemPrompt,
            temperature: 0.65,
          },
        });
        responseText = response.text || '';
      } catch (primaryErr) {
        // Fallback to gemini-3.8-flash if gemini-4-argon or another tier is unavailable on current key
        if (requestedModel !== 'gemini-3.8-flash') {
          usedModel = 'gemini-3.8-flash';
          const fallbackResponse = await ai.models.generateContent({
            model: usedModel,
            contents,
            config: {
              systemInstruction: defaultSystemPrompt,
              temperature: 0.65,
            },
          });
          responseText = fallbackResponse.text || '';
        } else {
          throw primaryErr;
        }
      }

      res.json({
        text: responseText,
        model: usedModel,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown Gemini Chat API error';
      res.status(500).json({ error: message });
    }
  });

  // 2. General Server-side Gemini API Proxy Endpoint (/api/gemini)
  app.post('/api/gemini', async (req, res) => {
    try {
      const {
        prompt,
        history,
        systemInstruction,
        responseMimeType,
        model = 'gemini-3.8-flash',
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

      const selectedModel = ALLOWED_MODELS.has(model) ? model : 'gemini-3.8-flash';
      const config: Record<string, unknown> = {};
      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }
      if (responseMimeType) {
        config.responseMimeType = responseMimeType;
      }

      const contents =
        Array.isArray(history) && history.length > 0
          ? [
              ...history.map((h: ChatTurn) => ({
                role: h.role === 'model' ? 'model' : 'user',
                parts: [{ text: String(h.text || '') }],
              })),
              ...(prompt ? [{ role: 'user', parts: [{ text: String(prompt) }] }] : []),
            ]
          : String(prompt);

      let response;
      let actualModel = selectedModel;
      try {
        response = await ai.models.generateContent({
          model: selectedModel,
          contents,
          config,
        });
      } catch (err) {
        if (selectedModel !== 'gemini-3.8-flash') {
          actualModel = 'gemini-3.8-flash';
          response = await ai.models.generateContent({
            model: actualModel,
            contents,
            config,
          });
        } else {
          throw err;
        }
      }

      res.json({
        text: response.text || '',
        model: actualModel,
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
