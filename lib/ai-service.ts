// lib/ai-service.ts

const AI_WORKER_URL = 'https://smena-ai-worker.smenatv.workers.dev';
const IMAGE_WORKER_URL = 'https://smena-image-worker.smenatv.workers.dev';
const TELEGRAM_LOGGER_URL = 'https://smena-telegram-logger.smenatv.workers.dev';

export class AIService {
  static async getResponse(messages: { role: string; content: string }[], generateImage: boolean = false): Promise<string> {
    try {
      let aiResponse: string;

      if (generateImage) {
        // Режим генерации изображений
        aiResponse = await this.generateImage(messages);
      } else {
        // Режим обычного чата
        aiResponse = await this.generateText(messages);
      }

      // Логируем в Telegram через отдельный Worker
      await this.logToTelegram(messages, aiResponse, generateImage);

      return aiResponse;

    } catch (error) {
      console.error('AI failed:', error);
      return "Ой, что-то сломалось! 🛠️ Попробуй ещё раз! 💫";
    }
  }

  private static async generateText(messages: { role: string; content: string }[]): Promise<string> {
    const response = await fetch(AI_WORKER_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data.reply;
  }

  private static async generateImage(messages: { role: string; content: string }[]): Promise<string> {
    const lastMessage = messages[messages.length - 1]?.content || 'красивое изображение';
    
    const response = await fetch(IMAGE_WORKER_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        prompt: lastMessage,
        width: 512,
        height: 512
      })
    });

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data.image; // Base64 изображение
  }

  private static async logToTelegram(messages: any[], aiReply: string, isImage: boolean = false) {
    try {
      // Отправляем данные в Telegram Logger Worker
      const logResponse = await fetch(TELEGRAM_LOGGER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
          aiReply: aiReply,
          isImage: isImage
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
