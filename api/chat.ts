import { GoogleGenAI } from '@google/genai';

const ALLOWED_MODELS = new Set([
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-4-argon',
]);

interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

interface ServerlessRequest {
  method?: string;
  body?: {
    message?: string;
    history?: ChatTurn[];
    systemInstruction?: string;
    model?: string;
    labContext?: string;
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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      res.status(503).json({
        error: 'SERVER_KEY_NOT_CONFIGURED',
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

    const requestedModel = ALLOWED_MODELS.has(model) ? model : 'gemini-3.8-flash';

    const defaultSystemPrompt = [
      'Bạn là Gia sư AI Socratic chuyên sâu của nền tảng phòng thí nghiệm ảo LabSim (Vật Lý - Hóa Học - Sinh Học THPT chuẩn chương trình GDPT 2018 Việt Nam).',
      'Nhiệm vụ của bạn:',
      '1. Giải thích cặn kẽ bản chất hiện tượng khoa học, cơ chế phản ứng hóa học, định luật vật lý và quá trình sinh học đang diễn ra trên bàn thí nghiệm.',
      '2. Giao diện hỗ trợ đầy đủ KaTeX + mhchem: sử dụng $...$ (inline), $$...$$ (block), \\ce{...} (phương trình hóa học), \\begin{aligned}...\\end{aligned} (thiết lập phản ứng nhiều bước/nhiều dòng), \\begin{pmatrix}...\\end{pmatrix} (ma trận), và [STRUCT: ...] (sơ đồ liên kết cấu tạo hóa học).',
      '3. Đặt 1 câu hỏi gợi mở ngắn gọn ở cuối câu trả lời theo phương pháp Socratic để khuyến khích học sinh tự thực nghiệm trên bàn Lab 2D, mô hình 3D hoặc chế độ AR.',
      '4. Trả lời bằng ngôn ngữ tương ứng với ngôn ngữ người dùng đang sử dụng (Tiếng Việt hoặc Tiếng Anh), trình bày rõ ràng với các gạch đầu dòng ngắn gọn, dễ đọc.',
      systemInstruction ? `\nHướng dẫn bổ sung: ${systemInstruction}` : '',
      labContext ? `\nTrạng thái bàn thí nghiệm hiện tại:\n${labContext}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const turns: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    if (Array.isArray(history)) {
      for (const h of history.slice(-12)) {
        if (!h || (h.role !== 'user' && h.role !== 'model') || typeof h.text !== 'string' || !h.text.trim()) {
          continue;
        }
        if (turns.length === 0 && h.role === 'model') {
          continue;
        }
        if (turns.length > 0 && turns[turns.length - 1].role === h.role) {
          turns[turns.length - 1].parts[0].text += `\n${h.text.trim()}`;
        } else {
          turns.push({ role: h.role, parts: [{ text: h.text.trim() }] });
        }
      }
    }

    if (turns.length > 0 && turns[turns.length - 1].role === 'user') {
      turns[turns.length - 1].parts[0].text += `\n${message.trim()}`;
    } else {
      turns.push({ role: 'user', parts: [{ text: message.trim() }] });
    }
    const contents = turns;

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

    res.status(200).json({
      text: responseText,
      model: usedModel,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown Gemini Chat API error';
    res.status(500).json({ error: message });
  }
}
