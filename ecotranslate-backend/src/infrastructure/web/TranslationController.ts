// src/infrastructure/web/TranslationController.ts
import type { Request, Response } from 'express';
import { TranslateUseCase } from '../../application/TranslateUseCase';

export class TranslationController {
  constructor(private translateUseCase: TranslateUseCase) {}

  // Usamos uma "arrow function" aqui para o Express não perder o contexto do 'this' na rota
  handle = async (req: Request, res: Response): Promise<void> => {
    try {
      const { text, targetLanguage } = req.body;

      if (!text || !targetLanguage) {
        res.status(400).json({ error: 'Os campos "text" e "targetLanguage" são obrigatórios.' });
        return;
      }

      // Executa a ação chamando as regras do core (Application)
      const result = await this.translateUseCase.execute(text, targetLanguage);
      
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro interno no servidor.' });
    }
  };
}