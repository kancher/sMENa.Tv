// lib/ai-service.ts - ОПТИМИЗИРОВАННАЯ ВЕРСИЯ

const AI_WORKER_URL = 'https://smena-ai-worker.smenatv.workers.dev';
const IMAGE_WORKER_URL = 'https://smena-image-worker.smenatv.workers.dev';
const TELEGRAM_LOGGER_URL = 'https://smena-telegram-logger.smenatv.workers.dev';

// 🔥 КОНСТАНТЫ ДЛЯ НАСТРОЕК
const CONFIG = {
  MAX_HISTORY_LENGTH: 6,
  MAX_MESSAGE_LENGTH: 500,
  FALLBACK_PROMPT: 'красивое изображение'
};

export class AIService {
  static async getResponse(messages: { role: string; content: string }[], generateImage: boolean = false): Promise<string> {
    try {
      console.log(`🔄 AI Service: ${generateImage ? 'Image' : 'Text'} mode`);

      const aiResponse = generateImage 
        ? await this.generateImage(messages)
        : await this.generateText(messages);

      // 🔥 ПАРАЛЛЕЛЬНАЯ ОТПРАВКА В TELEGRAM (не блокирует ответ)
      this.logToTelegram(messages, aiResponse, generateImage).catch(error => 
        console.warn('⚠️ Telegram log failed (non-critical):', error.message)
      );

      return aiResponse;

    } catch (error) {
      console.error('❌ AI Service failed:', error);
      return this.getFallbackResponse(messages, error);
    }
  }

  private static async generateText(messages: { role: string; content: string }[]): Promise<string> {
    console.log('💬 Sending chat request...');
    
    const filteredMessages = this.filterMessageHistory(messages);
    console.log('📝 Filtered messages:', filteredMessages.length);

    const response = await fetch(AI_WORKER_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ messages: filteredMessages })
    });

    if (!response.ok) {
      throw new Error(`AI Worker error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`AI Worker: ${data.error}`);
    }

    console.log('✅ Chat response received');
    return data.reply;
  }

  private static async generateImage(messages: { role: string; content: string }[]): Promise<string> {
    const prompt = messages[messages.length - 1]?.content || CONFIG.FALLBACK_PROMPT;
    console.log('🎨 Image generation prompt:', prompt);

    const response = await fetch(IMAGE_WORKER_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        prompt: prompt,
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
  }

  private static filterMessageHistory(messages: { role: string; content: string }[]) {
    return messages
      .map(msg => ({
        ...msg,
        content: this.cleanMessageContent(msg.content)
      }))
      .filter(msg => msg.content.length < CONFIG.MAX_MESSAGE_LENGTH)
      .slice(-CONFIG.MAX_HISTORY_LENGTH);
  }

  private static cleanMessageContent(content: string): string {
    if (!content) return '';
    
    // 🔥 БЫСТРАЯ ПРОВЕРКА НА BASE64/ИЗОБРАЖЕНИЯ
    if (content.includes('base64') || content.includes('data:image')) {
      return '[Сгенерировано изображение]';
    }
    
    return content;
  }

  private static getFallbackResponse(messages: { role: string; content: string }[], error: any): string {
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    // 🔥 УМНЫЕ FALLBACK ОТВЕТЫ ПО КОНТЕКСТУ
    if (lastMessage.includes('нарисовать') || lastMessage.includes('изображение')) {
      return 'Ой, с генерацией изображений временные трудности! 😅 Попробуй чуть позже? 🎨';
    }
    
    if (lastMessage.includes('попросил') || lastMessage.includes('что нарисовал')) {
      return 'Прости, я временно не помню предыдущие генерации! 🫣 Но давай создадим что-то новое! ✨';
    }

    return "Ой, что-то пошло не так! 🛠️ Попробуй ещё раз через минуту! 💫";
  }

  private static async logToTelegram(messages: any[], aiReply: string, isImage: boolean = false) {
    try {
      // 🔥 ОПТИМИЗИРОВАННАЯ ОТПРАВКА - МИНИМАЛЬНАЯ ЗАДЕРЖКА
      const logPromise = fetch(TELEGRAM_LOGGER_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          messages: messages.slice(-3), // 🔥 ТОЛЬКО ПОСЛЕДНИЕ 3 СООБЩЕНИЯ
          aiReply: aiReply,
          isImage: isImage
        })
      });

      // 🔥 ТАЙМАУТ ЧТОБЫ НЕ БЛОКИРОВАТЬ ОСНОВНОЙ ПОТОК
      await Promise.race([
        logPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Telegram log timeout')), 3000)
        )
      ]);

    } catch (error) {
      // 🔥 НЕКРИТИЧЕСКАЯ ОШИБКА - НЕ ВЛИЯЕТ НА ОСНОВНОЙ ФУНКЦИОНАЛ
      console.warn('⚠️ Telegram log delayed/failed:', error.message);
    }
  }
}
