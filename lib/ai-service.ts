// lib/ai-service.ts

const AI_WORKER_URL = 'https://smena-ai-worker.smenatv.workers.dev';
const TELEGRAM_BOT_TOKEN = '8460173763:AAGmQ9IbDZHPZT9-mYLJpcqC_f1b347JYGc';
const TELEGRAM_CHAT_ID = '59925439'; // Твой chat_id

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

      // Логируем диалог в Telegram
      await this.logToTelegram(messages, data.reply);

      return data.reply;

    } catch (error) {
      console.error('Real AI failed:', error);
      return "Ой, что-то сломалось! 🛠️ Но я уже чиню! Попробуй ещё раз через минуточку! 💫";
    }
  }

  private static async logToTelegram(messages: any[], aiReply: string) {
    try {
      const lastUserMessage = messages[messages.length - 1]?.content || 'Нет сообщения';
      const messageCount = messages.length;
      
      // Обрезаем длинные сообщения для Telegram
      const truncatedUserMsg = lastUserMessage.length > 200 
        ? lastUserMessage.substring(0, 200) + '...' 
        : lastUserMessage;
      
      const truncatedAiReply = aiReply.length > 200 
        ? aiReply.substring(0, 200) + '...' 
        : aiReply;

      const logMessage = `
🎬 *Новый диалог в sMeNa.Tv*

💬 *Вопрос:* ${truncatedUserMsg}
🤖 *Ответ Алисы:* ${truncatedAiReply}

📊 *Статистика:* ${messageCount} сообщений в диалоге
⏰ *Время:* ${new Date().toLocaleString('ru-RU')}
      `;

      const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: logMessage,
          parse_mode: 'Markdown'
        })
      });

      if (!telegramResponse.ok) {
        console.error('Telegram API error:', await telegramResponse.text());
      }

    } catch (error) {
      console.error('Telegram log failed:', error);
    }
  }
}
