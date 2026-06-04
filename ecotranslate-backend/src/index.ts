// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { GeminiAdapter } from './infrastructure/adapters/GeminiAdapter';
import { TranslateUseCase } from './application/TranslateUseCase';
import { TranslationController } from './infrastructure/web/TranslationController';

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (_req, res) => {
  return res.json({
    status: 'ok',
    service: 'ecotranslate-backend',
  });
});

const geminiAdapter = new GeminiAdapter();
const translateUseCase = new TranslateUseCase(geminiAdapter);
const translationController = new TranslationController(translateUseCase);

app.post('/api/translate', translationController.handle);

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`\n🚀 EcoTranslate rodando em http://${HOST}:${PORT}`);
  console.log(`📡 Health check: /health`);
  console.log(`📡 Tradução: POST /api/translate\n`);
});