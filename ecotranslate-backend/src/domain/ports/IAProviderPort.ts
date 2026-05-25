
import type { Translation } from '../entities/Translation';

export interface IAProviderPort {
  // Quem implementar essa porta DEVE receber o texto e o idioma alvo, e retornar a nossa Entidade
  translateText(text: string, targetLanguage: string): Promise<Translation>;
}