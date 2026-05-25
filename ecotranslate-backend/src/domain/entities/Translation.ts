
export interface Translation {
    originalText: string;
    translatedText: string;
    detectedLanguage: string;
    targetLanguage: string;
    culturalNotes?: string; // Se a IA detectar gírias ou expressões locais, ela explica aqui!
  }