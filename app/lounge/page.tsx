'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { AIService } from '../../lib/ai-service';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isError?: boolean;
};

export default function Lounge() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Привет! Я Алиса - твой AI-помощник. Готова общаться на любые темы! 💬',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Собираем историю чата для контекста
      const chatHistory = [
        // Все предыдущие сообщения
        ...messages.map(msg => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.text
        })),
        // Текущее сообщение пользователя
        { role: "user", content: inputText }
      ];

      const aiResponse = await AIService.getResponse(chatHistory);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '⚠️ Произошла ошибка при обращении к AI. Попробуйте ещё раз.',
        isUser: false,
        isError: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: 'Чат очищен! Чем могу помочь? 💬',
        isUser: false,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex flex-col">
      
      {/* Шапка */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors no-underline text-gray-700"
            >
              ← Назад
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">💬 Гостиная AI</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Кнопка очистки чата */}
            <button
              onClick={clearChat}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Очистить чат"
            >
              🗑️
            </button>
          </div>
        </div>
      </header>

      {/* Область сообщений */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.isUser
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                    : message.isError
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">
                  {message.text}
                </div>
                <div
                  className={`text-xs mt-2 ${
                    message.isUser 
                      ? 'text-cyan-100' 
                      : message.isError
                      ? 'text-red-400'
                      : 'text-gray-400'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {!message.isUser && !message.isError && (
                    <span className="ml-2">• Алиса</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Индикатор загрузки */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">
                    Алиса думает... 💬
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Поле ввода */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 bg-gray-100 rounded-2xl border border-gray-200 focus-within:border-cyan-500 transition-colors">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Напиши сообщение... (например: 'Расскажи о возможностях AI' или 'Помоги с идеей для проекта')"
                className="w-full bg-transparent border-none resize-none py-3 px-4 focus:outline-none text-gray-800 placeholder-gray-500"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg active:scale-95 min-w-[100px]"
            >
              {isLoading ? '...' : '➤'}
            </button>
          </div>
          
          {/* Подсказка */}
          <div className="text-center mt-3">
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              💬 Режим общения
              {isLoading && ' • Алиса печатает...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
