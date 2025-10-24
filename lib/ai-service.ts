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

      // Логируем в Telegram (не блокируем основной поток)
      this.logToTelegram(messages, aiResponse, generateImage).catch(console.error);

      return aiResponse;

    } catch (error) {
      console.error('❌ AI Service failed:', error);
      return "Ой, что-то сломалось! 🛠️ Попробуй ещё раз! 💫";
    }
  }

  private static async generateText(messages: { role: string; content: string }[]): Promise<string> {
    console.log('💬 Sending chat request...');
    
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

    console.log('✅ Chat response received');
    return data.reply;
  }

  private static async generateImage(messages: { role: string; content: string }[]): Promise<string> {
    const lastMessage = messages[messages.length - 1]?.content || 'красивое изображение';
    
    console.log('🎨 Sending image generation request:', lastMessage);

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
  }

  private static async logToTelegram(messages: any[], aiReply: string, isImage: boolean = false) {
    try {
      await fetch(TELEGRAM_LOGGER_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          messages: messages,
          aiReply: aiReply,
          isImage: isImage
        })
      });
    } catch (error) {
      console.error('Telegram log failed:', error);
    }
  }
}
