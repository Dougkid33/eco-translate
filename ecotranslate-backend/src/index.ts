// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import { GeminiAdapter } from './infrastructure/adapters/GeminiAdapter';
import { TranslateUseCase } from './application/TranslateUseCase';
import { TranslationController } from './infrastructure/web/TranslationController';

// 1. Inicializa as variáveis de ambiente do .env
dotenv.config();

const app = express();
app.use(express.json());

// 2. Montagem do quebra-cabeça Hexagonal (Injeção de Dependência)
const geminiAdapter = new GeminiAdapter(); // Infra
const translateUseCase = new TranslateUseCase(geminiAdapter); // Application (Core)
const translationController = new TranslationController(translateUseCase); // Infra (Web)

// 3. Define a rota POST apontando diretamente para o handler do controlador
app.post('/api/translate', translationController.handle);

// 4. Inicializa o servidor com o Bun
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 EcoTranslate rodando com Bun na porta ${PORT}`);
  console.log(`📡 Pronto para receber requisições POST em http://localhost:${PORT}/api/translate\n`);
});