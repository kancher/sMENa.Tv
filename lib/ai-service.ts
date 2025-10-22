// lib/ai-service.ts

type AIModel = 'chat' | 'code';

export class AIService {
  private static async makeRequest(model: string, prompt: string) {
    try {
      // В реальной версии здесь будет вызов CloudFlare Workers AI
      // Сейчас имитируем ответ для тестирования
      
      if (model === 'code') {
        return this.generateCodeResponse(prompt);
      } else {
        return this.generateChatResponse(prompt);
      }
    } catch (error) {
      console.error('AI request failed:', error);
      return 'Извините, произошла ошибка. Попробуйте ещё раз.';
    }
  }

  private static generateCodeResponse(prompt: string): string {
    const responses = [
      `Вот решение вашей задачи:\n\n\`\`\`javascript\nfunction solution() {\n  // Ваш код здесь\n  return "Результат";\n}\n\`\`\``,
      
      `Для этой задачи рекомендую:\n\n\`\`\`python\ndef main():\n    # Реализация\n    pass\n\`\`\``,
      
      `Попробуйте этот подход:\n\n\`\`\`typescript\ninterface Solution {\n  // Типы\n}\n\nconst solve = (): Solution => {\n  // Логика\n};\n\`\`\``
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private static generateChatResponse(prompt: string): string {
    const responses = [
      "Отличный вопрос! Давайте разберём его подробнее...",
      "Понимаю ваш интерес к этой теме. Вот что я могу сказать...",
      "Интересная мысль! С точки зрения AI это выглядит так...",
      "Спасибо за вопрос! Вот мои рекомендации...",
      "Отличная тема для обсуждения! Давайте порассуждаем вместе..."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + `\n\nВаш запрос: "${prompt}"`;
  }

  static async getResponse(prompt: string, mode: AIModel): Promise<string> {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    return this.makeRequest(mode, prompt);
  }
}
