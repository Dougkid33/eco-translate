
import type { IAProviderPort } from '../domain/ports/IAProviderPort';
import type { Translation } from '../domain/entities/Translation';

export class TranslateUseCase {
  // Injeção de Dependência: Passamos a porta pelo construtor
  constructor(private iaProvider: IAProviderPort) {}

  async execute(text: string, targetLanguage: string): Promise<Translation> {
    if (!text || text.trim() === '') {
      throw new Error('O texto para tradução não pode estar vazio.');
    }

    // Executa a tradução através da porta abstrata
    return await this.iaProvider.translateText(text, targetLanguage);
  }
}