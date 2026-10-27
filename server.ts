import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  // Server-side Gemini API endpoint for V-Science 3D & AI Lab
  app.post('/api/gemini', async (req, res) => {
    try {
      const { prompt, systemInstruction, responseMimeType } = req.body || {};
      if (!prompt) {
        res.status(400).json({ error: 'Missing prompt' });
        return;
      }

      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
        res.status(503).json({
          error: 'SYSTEM_KEY_UNAVAILABLE',
          message: 'Switching to Smart AI Simulation Mode',
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

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config,
      });

      res.json({
        text: response.text || '',
        model: 'gemini-3.8-flash',
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
    console.log(`V-Science 3D & AI Lab server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
