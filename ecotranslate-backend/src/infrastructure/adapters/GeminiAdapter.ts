// src/infrastructure/adapters/GeminiAdapter.ts
import { GoogleGenAI } from '@google/genai'; // Corrigido para o novo SDK unificado
import type { IAProviderPort } from '../../domain/ports/IAProviderPort';
import type { Translation } from '../../domain/entities/Translation';

export class GeminiAdapter implements IAProviderPort {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('A variável GEMINI_API_KEY não foi encontrada no arquivo .env');
    }
    // No novo SDK, passamos um objeto de configuração diretamente
    this.ai = new GoogleGenAI({ apiKey });
  }

  async translateText(text: string, targetLanguage: string): Promise<Translation> {
    const prompt = `
      You are an expert translator and cultural mediator.
      Analyze the text provided, detect its language, and translate it to "${targetLanguage}".
      
      If the text contains idioms, slangs, or cultural expressions, explain them in the "culturalNotes" field in the target language. If not, leave "culturalNotes" empty.

      You MUST return your response matching this JSON schema strictly:
      {
        "originalText": "string",
        "translatedText": "string",
        "detectedLanguage": "string",
        "targetLanguage": "string",
        "culturalNotes": "string (optional)"
      }

      Text to translate:
      "${text}"
    `;

    try {
      // No novo SDK, usamos ai.models.generateContent e o modelo padrão atual é o gemini-2.5-flash
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json', // Mantém a resposta em JSON puro
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('A IA retornou uma resposta vazia.');
      }
      
      // Converte a string JSON da IA para a nossa Entidade do Domínio
      const translationData: Translation = JSON.parse(responseText);
      return translationData;
    } catch (error) {
      console.error('Erro ao chamar a API do Gemini:', error);
      throw new Error('Falha crítica na comunicação com a inteligência artificial.');
    }
  }
}