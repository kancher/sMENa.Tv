// lib/ai-service.ts

const AI_WORKER_URL = 'https://smena-ai-worker.smenatv.workers.dev';

export class AIService {
  static async getResponse(prompt: string): Promise<string> {
    try {
      // Используем только чатовый режим
      const response = await fetch(AI_WORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt
          // убираем параметр mode
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
      console.error('Real AI failed:', error);
      // Простая заглушка на случай ошибки
      return "Извините, в данный момент AI недоступен. Попробуйте позже!";
    }
  }
}
