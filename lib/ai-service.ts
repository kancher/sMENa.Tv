// lib/ai-service.ts

type AIModel = 'chat' | 'code';

const AI_WORKER_URL = 'https://smena-ai-worker.ТВОЙ-АККАУНТ.workers.dev';

export class AIService {
  static async getResponse(prompt: string, mode: AIModel): Promise<string> {
    try {
      // Пытаемся использовать настоящий Worker AI
      const response = await fetch(AI_WORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          mode: mode
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data.reply;

    } catch (error) {
      console.error('Real AI failed, using fallback:', error);
      // Если Worker не работает, используем улучшенную имитацию
      return this.getFallbackResponse(prompt, mode);
    }
  }

  private static async getFallbackResponse(prompt: string, mode: AIModel): Promise<string> {
    // Твоя улучшенная имитация остаётся как запасной вариант
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    const lowerPrompt = prompt.toLowerCase();

    if (mode === 'code') {
      return this.generateCodeResponse(lowerPrompt, prompt);
    } else {
      return this.generateChatResponse(lowerPrompt, prompt);
    }
  }

  // ... остальной код имитации остаётся таким же ...
  private static generateCodeResponse(lowerPrompt: string, originalPrompt: string): string {
    // Твой существующий код...
  }

  private static generateChatResponse(lowerPrompt: string, originalPrompt: string): string {
    // Твой существующий код...
  }
}
