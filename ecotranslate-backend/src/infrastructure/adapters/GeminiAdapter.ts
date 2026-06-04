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

  async translateText(textOrBase64: string, targetLanguage: string): Promise<Translation> {
    const isBase64 = textOrBase64.startsWith('data:image') || textOrBase64.length > 1000;

    const prompt = `You are a translator. Extract text from the image/text, translate it to ${targetLanguage}. Return ONLY the final translated string. No JSON, no markdown formatting, no explanations.`;

    try {
      let contents: any[] = [prompt];

      if (isBase64) {
        // Separa o cabeçalho do conteúdo se houver
        const base64Data = textOrBase64.split(',')[1] || textOrBase64;
        contents.push({
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg'
          }
        });
      } else {
        contents.push(`Text to translate: "${textOrBase64}"`);
      }

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('A IA retornou uma resposta vazia.');
      }
      
      return { translatedText: responseText } as unknown as Translation;
    } catch (error) {
      console.error('Erro ao chamar a API do Gemini:', error);
      throw new Error('Falha crítica na comunicação com a inteligência artificial.');
    }
  }
}