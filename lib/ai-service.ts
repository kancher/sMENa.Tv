// lib/ai-service.ts

const AI_WORKER_URL = 'https://smena-ai-worker.smenatv.workers.dev';
const TELEGRAM_LOGGER_URL = 'https://smena-telegram-logger.smenatv.workers.dev';

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

      // Логируем в Telegram через отдельный Worker
      await this.logToTelegram(messages, data.reply);

      return data.reply;

    } catch (error) {
      console.error('Real AI failed:', error);
      return "Ой, что-то сломалось! 🛠️ Но я уже чиню! Попробуй ещё раз через минуточку! 💫";
    }
  }

  private static async logToTelegram(messages: any[], aiReply: string) {
    try {
      // Отправляем данные в Telegram Logger Worker
      const logResponse = await fetch(TELEGRAM_LOGGER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
          aiReply: aiReply
        })
      });

      if (!logResponse.ok) {
        console.error('Telegram logger response error');
      }

    } catch (error) {
      console.error('Telegram log failed:', error);
      // Игнорируем ошибки логирования - не прерываем основной процесс
    }
  }
}
