// lib/ai-service.ts

const AI_WORKER_URL = 'https://smena-ai-worker.smenatv.workers.dev';
const IMAGE_WORKER_URL = 'https://smena-image-worker.smenatv.workers.dev';
const TELEGRAM_LOGGER_URL = 'https://smena-telegram-logger.smenatv.workers.dev';

export class AIService {
  static async getResponse(messages: { role: string; content: string }[], generateImage: boolean = false): Promise<string> {
    try {
      console.log(`🔄 AI Service: ${generateImage ? 'Image' : 'Text'} mode`);

      let aiResponse: string;

      if (generateImage) {
        aiResponse = await this.generateImage(messages);
      } else {
        aiResponse = await this.generateText(messages);
      }

      // Логируем в Telegram
      this.logToTelegram(messages, aiResponse, generateImage).catch(console.error);

      return aiResponse;

    } catch (error) {
      console.error('❌ AI Service failed:', error);
      
      const lastMessage = messages[messages.length - 1]?.content || '';
      
      if (lastMessage.includes('нарисовать') || lastMessage.includes('изображение') || lastMessage.includes('попросил')) {
        return 'Ой, с изображениями иногда бывают сбои! 😅 Попробуй описать по-другому? 🎨';
      }
      
      return "Ой, что-то пошло не так! 🛠️ Попробуй ещё раз! 💫";
    }
  }

  private static async generateText(messages: { role: string; content: string }[]): Promise<string> {
    console.log('💬 Sending chat request...');
    
    try {
      // 🔥 УПРОЩАЕМ ИСТОРИЮ - ТОЛЬКО ТЕКСТ И ПРОМПТЫ
      const filteredMessages = messages
        .map(msg => {
          const content = msg.content || '';
          // Если это промпт для изображения - оставляем как есть
          // Если это base64 изображение - заменяем на мета-информацию
          if (content.includes('base64') || content.includes('data:image')) {
            return {
              ...msg,
              content: '[Сгенерировано изображение]'
            };
          }
          return msg;
        })
        .filter(msg => (msg.content || '').length < 500) // Безопасный лимит
        .slice(-6); // Последние 6 сообщений

      console.log('📝 Filtered messages:', filteredMessages.length);

      const response = await fetch(AI_WORKER_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ messages: filteredMessages })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      console.log('✅ Chat response received');
      return data.reply;

    } catch (error) {
      console.error('💥 generateText error:', error);
      throw error;
    }
  }

  private static async generateImage(messages: { role: string; content: string }[]): Promise<string> {
    // 🔥 БЕРЁМ ТОЛЬКО ПОСЛЕДНИЙ ПРОМПТ ОТ ПОЛЬЗОВАТЕЛЯ
    const lastMessage = messages[messages.length - 1]?.content || 'красивое изображение';
    
    console.log('🎨 Image generation prompt:', lastMessage);

    try {
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
      
      if (!data.success) {
        throw new Error(data.error || 'Image generation failed');
      }

      console.log('✅ Image generated successfully');
      return data.image;

    } catch (error) {
      console.error('💥 generateImage error:', error);
      throw error;
    }
  }

  private static async logToTelegram(messages: any[], aiReply: string, isImage: boolean = false) {
    try {
      // 🔥 ДЛЯ ИЗОБРАЖЕНИЙ ЛОГИРУЕМ ТОЛЬКО ПРОМПТ, НЕ BASE64
      const telegramReply = isImage ? '🎨 Сгенерировано изображение' : aiReply;
      
      await fetch(TELEGRAM_LOGGER_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          messages: messages,
          aiReply: telegramReply,
          isImage: isImage
        })
      });
    } catch (error) {
      console.error('Telegram log failed:', error);
    }
  }
}
