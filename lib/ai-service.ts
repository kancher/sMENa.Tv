// lib/ai-service.ts

const AI_WORKER_URL = 'https://smena-ai-worker.smenatv.workers.dev';

// Убираем process.env - они не работают в браузере
// Вместо этого будем использовать другой подход
export class AIService {
  static async getResponse(messages: { role: string; content: string }[]): Promise<string> {
    try {
      const response = await fetch(AI_WORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages
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
      return "Ой, что-то сломалось! 🛠️ Но я уже чиню! Попробуй ещё раз через минуточку! 💫";
    }
  }
}
