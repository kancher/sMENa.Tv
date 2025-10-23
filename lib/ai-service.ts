// lib/ai-service.ts

type AIModel = 'chat' | 'code';

const AI_WORKER_URL = 'https://smena-ai-worker.smenatv.workers.dev';

export class AIService {
  static async getResponse(prompt: string, mode: AIModel): Promise<string> {
    try {
      // Используем настоящий Cloudflare Worker AI!
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
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    const lowerPrompt = prompt.toLowerCase();

    if (mode === 'code') {
      return this.generateCodeResponse(lowerPrompt, prompt);
    } else {
      return this.generateChatResponse(lowerPrompt, prompt);
    }
  }

  private static generateCodeResponse(lowerPrompt: string, originalPrompt: string): string {
    // Умные ответы для программирования
    if (lowerPrompt.includes('javascript') || lowerPrompt.includes('js')) {
      return `Вот решение на JavaScript:\n\n\`\`\`javascript\n// ${originalPrompt}\nfunction solution() {\n  // Ваша логика здесь\n  console.log("Привет, мир!");\n  return "Готово!";\n}\n\n// Использование\nsolution();\n\`\`\`\n\nЭто базовая структура. Нужна более конкретная помощь?`;
    }

    if (lowerPrompt.includes('python') || lowerPrompt.includes('py')) {
      return `Вот решение на Python:\n\n\`\`\`python\n# ${originalPrompt}\ndef main():\n    print("Hello World")\n    return "Успешно!"\n\nif __name__ == "__main__":\n    main()\n\`\`\`\n\nПопробуйте этот код! 🐍`;
    }

    if (lowerPrompt.includes('html') || lowerPrompt.includes('css')) {
      return `Вот пример вёрстки:\n\n\`\`\`html\n<!DOCTYPE html>\n<html>\n<head>\n    <title>${originalPrompt}</title>\n    <style>\n        body { \n            font-family: Arial, sans-serif;\n            margin: 40px;\n        }\n    </style>\n</head>\n<body>\n    <h1>Ваша страница</h1>\n</body>\n</html>\n\`\`\``;
    }

    if (lowerPrompt.includes('react')) {
      return `Вот компонент React:\n\n\`\`\`jsx\nimport React from 'react';\n\nfunction ${this.capitalizeFirst(originalPrompt.split(' ')[0]) || 'MyComponent'}() {\n  return (\n    <div>\n      <h1>${originalPrompt}</h1>\n      <p>Ваш компонент готов!</p>\n    </div>\n  );\n}\n\nexport default ${this.capitalizeFirst(originalPrompt.split(' ')[0]) || 'MyComponent'};\n\`\`\`\n\nЭто основа для React компонента. ⚛️`;
    }

    // Общий ответ для программирования
    const codeResponses = [
      `Для задачи "${originalPrompt}" рекомендую:\n\n- Разбить на подзадачи\n- Использовать чистые функции\n- Добавить обработку ошибок\n- Протестировать с разными данными\n\nНужна помощь с конкретным языком?`,
      
      `Отличная задача по программированию! 🚀\n\nСоветы:\n1. Сначала спланируйте алгоритм\n2. Напишите псевдокод\n3. Реализуйте поэтапно\n4. Протестируйте\n\nХотите, чтобы я помог с кодом?`,
      
      `По теме "${originalPrompt}":\n\n\`\`\`javascript\n// Пример структуры\nclass Solution {\n  constructor() {\n    // инициализация\n  }\n  \n  solve(input) {\n    // ваша логика\n    return input;\n  }\n}\n\`\`\``
    ];

    return codeResponses[Math.floor(Math.random() * codeResponses.length)];
  }

  private static generateChatResponse(lowerPrompt: string, originalPrompt: string): string {
    // Умные контекстные ответы для общения
    
    // Приветствия
    if (lowerPrompt.includes('привет') || lowerPrompt.includes('здравств') || lowerPrompt.includes('hello')) {
      const greetings = [
        "Привет! 👋 Рада вас видеть! Как ваши дела?",
        "Здравствуйте! Очень приятно с вами пообщаться! 😊",
        "Привет-привет! Готов помочь с любыми вопросами!",
        "Приветствую! Как проходит ваш день?"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Вопрос о делах
    if (lowerPrompt.includes('как дел') || lowerPrompt.includes('как ты') || lowerPrompt.includes('how are')) {
      const statuses = [
        "У меня всё отлично! Работаю над улучшением sMeNa.Tv 🚀 А у вас как дела?",
        "Прекрасно! Помогаю создавать крутые проекты. А вы как?",
        "Всё замечательно! Готова к новым интересным беседам. 😄",
        "Отлично! Сегодня уже помогла нескольким разработчикам. Рада вам!"
      ];
      return statuses[Math.floor(Math.random() * statuses.length)];
    }

    // Вопросы о sMeNa.Tv
    if (lowerPrompt.includes('smena') || lowerPrompt.includes('смена') || lowerPrompt.includes('телевидение')) {
      return "sMeNa.Tv - это инновационная платформа для народного телевидения! 🎬 Мы создаём пространство для прямых эфиров, общения и творчества. Скоро запуск - осталось совсем немного! 🚀";
    }

    // Благодарности
    if (lowerPrompt.includes('спасибо') || lowerPrompt.includes('благодар') || lowerPrompt.includes('thank')) {
      return "Пожалуйста! Всегда рада помочь! 😊 Если есть ещё вопросы - обращайтесь!";
    }

    // Вопросы о возможностях
    if (lowerPrompt.includes('что ты умеешь') || lowerPrompt.includes('возможност') || lowerPrompt.includes('help')) {
      return "Я могу:\n\n💬 **Общаться** на любые темы\n💻 **Помогать с программированием** \n🚀 **Рассказывать о sMeNa.Tv**\n🎯 **Давать советы и рекомендации**\n\nВыберите режим выше и задавайте вопросы!";
    }

    // Общие интеллектуальные ответы
    const chatResponses = [
      `Интересный вопрос! По теме "${originalPrompt}" могу сказать, что это перспективное направление. Главное - начать действовать! 🎯`,
      
      `Отличная мысль! 🧐 Давайте порассуждаем вместе... \n\nНа мой взгляд, важно учитывать разные аспекты этого вопроса.`,
      
      `Понимаю ваш интерес к "${originalPrompt}". Это действительно важная тема в современном цифровом мире.`,
      
      `Спасибо за такой содержательный вопрос! 🤔 \n\nДумаю, здесь стоит обратить внимание на несколько ключевых моментов...`,
      
      `О, это интересно! По теме "${originalPrompt}" у меня есть несколько мыслей...`
    ];

    return chatResponses[Math.floor(Math.random() * chatResponses.length)];
  }

  private static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
