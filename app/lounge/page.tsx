// app/lounge/page.tsx - С iOS-STYLE ПЕРЕКЛЮЧАТЕЛЕМ
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
  isImage?: boolean;
};

export default function Lounge() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Привет! 🤗 Я Куля 💃 [ну такое имя 🤷🏼‍♀️] ~ твой AI-помощник. Как Жиз~з~знь 😬 [реальная💄]!? 💬',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageMode, setImageMode] = useState(false);
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
      // 🔥 ОБНОВЛЕННАЯ ЛОГИКА - ПЕРЕДАЕМ ИНФОРМАЦИЮ О РЕЖИМАХ
      const chatHistory = messages.map(msg => {
        if (msg.isImage) {
          // Для сгенерированных изображений - добавляем контекст
          return {
            role: "assistant" as const,
            content: `[Сгенерировала изображение по запросу: "${msg.text}"]`
          };
        } else {
          // Для обычных сообщений
          return {
            role: msg.isUser ? "user" as const : "assistant" as const,
            content: msg.text
          };
        }
      });

      // Добавляем информацию о текущем режиме и новое сообщение
      const enhancedHistory = [
        ...chatHistory,
        { 
          role: "system" as const, 
          content: `ТЕКУЩИЙ РЕЖИМ: ${imageMode ? 'ГЕНЕРАЦИЯ ИЗОБРАЖЕНИЙ' : 'ТЕКСТОВЫЙ ЧАТ'}`
        },
        { role: "user" as const, content: inputText }
      ];

      const aiResponse = await AIService.getResponse(enhancedHistory, imageMode);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
        isImage: imageMode
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '⚠️ Произошла ошибка 🤦🏼‍♀️ при обращении к AI. Попробуйте ещё раз.',
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
        text: 'Чат очищен! Чем могу помочь? 🙆‍♀️ 💬',
        isUser: false,
        timestamp: new Date()
      }
    ]);
    setImageMode(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex flex-col">
      {/* Header - Apple Style */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors no-underline text-gray-600"
            >
              ←
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-cyan-500 rounded"></div>
              <h1 className="text-lg font-medium text-gray-900">Гостиная Кули</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* iOS Style Toggle Switch */}
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium transition-colors ${imageMode ? 'text-gray-500' : 'text-gray-900'}`}>
                💬
              </span>
              
              <button
                onClick={() => setImageMode(!imageMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${
                  imageMode ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    imageMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              
              <span className={`text-xs font-medium transition-colors ${imageMode ? 'text-gray-900' : 'text-gray-500'}`}>
                🎨
              </span>
            </div>
            
            <button
              onClick={clearChat}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Очистить чат"
            >
              🗑️
            </button>
          </div>
        </div>
      </header>

      {/* Messages Area - Compact */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="max-w-4xl mx-auto space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 ${
                  message.isUser
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                    : message.isError
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : message.isImage
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'bg-white border border-gray-200/50 text-gray-800'
                }`}
              >
                {message.isImage ? (
                  <div className="text-center">
                    <div className="text-xs mb-2 opacity-80">🎨 Куля создала:</div>
                    {message.text && typeof message.text === 'string' && message.text.startsWith('data:image/') ? (
                      <img 
                        src={message.text} 
                        alt="Сгенерированное изображение" 
                        className="max-w-full h-auto rounded-lg mx-auto max-h-48"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-white/80 bg-white/20 p-3 rounded-lg text-sm">
                        {typeof message.text === 'string' ? message.text : 'Генерация...'}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed text-sm">
                    {message.text}
                  </div>
                )}
                <div
                  className={`text-xs mt-1.5 ${
                    message.isUser 
                      ? 'text-cyan-100' 
                      : message.isError
                      ? 'text-red-400'
                      : message.isImage
                      ? 'text-white/70'
                      : 'text-gray-400'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200/50 rounded-2xl p-3">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {imageMode ? '🎨 Рисует...' : '💬 Думает...'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Compact */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 p-3 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-100 rounded-xl border border-gray-200/50 focus-within:border-cyan-400 transition-colors">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  imageMode 
                    ? 'Опиши что нарисовать...' 
                    : 'Напиши сообщение...'
                }
                className="w-full bg-transparent border-none resize-none py-2.5 px-3 focus:outline-none text-gray-800 placeholder-gray-500 text-sm"
                rows={1}
                style={{ minHeight: '42px', maxHeight: '80px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className={`px-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow active:scale-95 min-w-[60px] flex items-center justify-center ${
                imageMode 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' 
                  : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : imageMode ? '🎨' : '➤'}
            </button>
          </div>
          
          {/* Mode Indicator */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${
              imageMode 
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' 
                : 'text-gray-500 bg-gray-100'
            }`}>
              <span>{imageMode ? '🎨' : '💬'}</span>
              <span>{imageMode ? 'Режим изображений' : 'Режим общения'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
