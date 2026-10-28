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

  // Helper to sanitize chat history so Gemini API strictly receives alternating user -> model turns starting with user
  function normalizeGeminiChatContents(
    rawHistory: unknown,
    latestUserMessage: string
  ): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
    const turns: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(rawHistory)) {
      for (const item of (rawHistory as ChatTurn[]).slice(-8)) {
        if (!item || typeof item.text !== 'string' || !item.text.trim()) continue;
        const role: 'user' | 'model' = item.role === 'model' ? 'model' : 'user';
        const cleanText = item.text.trim().slice(0, 600);
        // Gemini requires the first turn in contents to be 'user'
        if (turns.length === 0 && role === 'model') {
          continue;
        }
        // Merge consecutive turns of the same role
        if (turns.length > 0 && turns[turns.length - 1].role === role) {
          turns[turns.length - 1].parts[0].text += `\n${cleanText}`;
        } else {
          turns.push({ role, parts: [{ text: cleanText }] });
        }
      }
    }

    const userText = String(latestUserMessage || '').trim().slice(0, 800);
    if (turns.length > 0 && turns[turns.length - 1].role === 'user') {
      turns[turns.length - 1].parts[0].text += `\n${userText}`;
    } else {
      turns.push({ role: 'user', parts: [{ text: userText }] });
    }

    return turns;
  }

  async function generateWithFallbackModels(
    ai: GoogleGenAI,
    contents: unknown,
    config: Record<string, unknown>
  ): Promise<{ text: string; modelUsed: string }> {
    const candidateModels = [LITE_MODEL, 'gemini-3.8-flash', 'gemini-flash-latest'];
    let lastErr: unknown = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents as string,
          config,
        });
        if (response && typeof response.text === 'string' && response.text.trim().length > 0) {
          return { text: response.text.trim(), modelUsed: modelName };
        }
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr || new Error('All Gemini model attempts failed');
  }

  // 1. Multi-turn Gemini Chatbot Proxy Endpoint (/api/chat)
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
        'Bạn là Gia sư AI thông minh của phòng thí nghiệm ảo LabSim (Vật Lý - Hóa Học - Sinh Học THPT GDPT 2018).',
        'Hãy trả lời trực tiếp, chính xác và linh hoạt đúng trọng tâm câu hỏi của học sinh (từ 3 đến 5 gạch đầu dòng rõ ràng).',
        'Giao diện chat hỗ trợ đầy đủ KaTeX và mhchem: hãy sử dụng $...$ cho công thức nội dòng, $$...$$ cho công thức khối, \\ce{...} cho phương trình hóa học, \\begin{aligned}...\\end{aligned} cho hệ phản ứng/phương trình nhiều dòng, \\begin{pmatrix}...\\end{pmatrix} cho ma trận, và [STRUCT: CH3-CH=O] cho sơ đồ liên kết cấu tạo hữu cơ khi cần minh họa chuyên sâu.',
        'Kết thúc bằng 1 câu hỏi gợi mở tư duy thực nghiệm ngắn gọn.',
        systemInstruction ? `Lưu ý bổ sung: ${systemInstruction}` : '',
        labContext ? `Trạng thái bàn thí nghiệm hiện tại:\n${labContext}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const contents = normalizeGeminiChatContents(history, message);

      const { text, modelUsed } = await generateWithFallbackModels(ai, contents, {
        systemInstruction: defaultSystemPrompt,
        temperature: 0.65,
      });

      res.json({
        text,
        model: modelUsed,
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

      const config: Record<string, unknown> = {};
      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }
      if (responseMimeType) {
        config.responseMimeType = responseMimeType;
      }

      const contents =
        Array.isArray(history) && history.length > 0
          ? normalizeGeminiChatContents(history, String(prompt || ''))
          : String(prompt).slice(0, 1200);

      const { text, modelUsed } = await generateWithFallbackModels(ai, contents, config);

      res.json({
        text,
        model: modelUsed,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown Gemini API error';
      res.status(500).json({ error: message });
    }
  });

  // 3. Universal DIY Sandbox Combination Analyzer (/api/sandbox-combine) for Out-of-Textbook Chemistry, Physics & Biology
  app.post('/api/sandbox-combine', async (req, res) => {
    try {
      const { subject = 'CHEM', items = [] } = req.body || {};
      if (!Array.isArray(items) || items.length === 0) {
        res.status(400).json({ error: 'Missing items to combine' });
        return;
      }

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({ error: 'SERVER_KEY_NOT_CONFIGURED' });
        return;
      }

      const joined = items.join(' + ');
      const prompt = `Phân tích kết quả thí nghiệm khi kết hợp [${joined}] trong phân môn ${subject} (Hóa học / Vật lý / Sinh học).
Trả về JSON hợp lệ theo cấu trúc:
{
  "eq": "Phương trình phản ứng hoặc công thức vật lý/sinh học chuẩn (dùng chỉ số dưới/trên như H₂SO₄, Cu²⁺, ↓, ↑, ⇌)",
  "desc": "Mô tả hiện tượng thực nghiệm chi tiết, rõ ràng bằng Tiếng Việt (1-2 câu)",
  "color": "Mã màu hex hoặc rgba của dung dịch/hệ sau tương tác (VD: #38bdf8)",
  "precipitateColor": "Mã màu hex của kết tủa nếu có hoặc chuỗi rỗng",
  "gas": true/false,
  "deltaT": số độ C thay đổi nhiệt độ (VD: 8 hoặc 0),
  "pH": độ pH ước tính nếu là Hóa học (VD: 7.0)
}`;

      const { text } = await generateWithFallbackModels(ai, prompt, {
        responseMimeType: 'application/json',
        temperature: 0.3,
      });

      res.json({ result: JSON.parse(text) });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Sandbox synthesis failed';
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
