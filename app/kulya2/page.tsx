'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isError?: boolean;
};

// Правильное имя переменной для Next.js клиентских компонентов
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API;

export default function Kulya2() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Привет! Я Куля 2.0 💫\nТеперь я живу на нашем защищённом сервере!',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!API_BASE_URL) {
      setConnectionError('NEXT_PUBLIC_BACKEND_API не настроен в Environment Variables');
      setIsConnected(false);
      return;
    }

    console.log('🔧 API_BASE_URL:', API_BASE_URL); // Для отладки

    // Проверяем связь с нашим API
    fetch(`${API_BASE_URL}/`)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log('✅ Куля отвечает:', data);
        setIsConnected(true);
        setConnectionError('');
      })
      .catch(error => {
        console.error('❌ Ошибка связи:', error);
        setIsConnected(false);
        setConnectionError(error.message);
      });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading || !API_BASE_URL) return;

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
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.kulya_response || data.reply || data.message || 'Ой, что-то пошло не так...',
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('❌ Ошибка отправки:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '⚠️ Сервер временно недоступен. Попробуйте позже.',
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
        text: 'Чат очищен! Давайте начнём новый разговор! 💫',
        isUser: false,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-cyan-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors no-underline text-gray-600"
            >
              ← На главную
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
              <div>
                <h1 className="text-lg font-medium text-gray-900">Куля 2.0</h1>
                <p className="text-xs text-gray-500">Защищённое HTTPS соединение 🔒</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`text-xs px-3 py-1 rounded-full flex items-center gap-2 ${
              isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}></div>
              {isConnected ? 'Связь установлена' : 'Нет связи'}
            </div>
            
            <button
              onClick={clearChat}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Очистить чат"
            >
              🗑️
            </button>
          </div>
        </div>
      </header>

      {/* Сообщение об ошибке подключения */}
      {connectionError && (
        <div className="bg-red-50 border border-red-200 p-3 mx-4 mt-4 rounded-lg max-w-4xl mx-auto">
          <div className="text-red-800 text-sm">
            <strong>Ошибка подключения:</strong> {connectionError}
          </div>
          <div className="text-red-600 text-xs mt-1">
            Проверь настройки NEXT_PUBLIC_BACKEND_API в CloudFlare Pages
          </div>
        </div>
      )}

      {/* Чат контейнер */}
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
                    : 'bg-white border border-gray-200/50 text-gray-800 shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">
                  {message.text}
                </div>
                <div
                  className={`text-xs mt-2 ${
                    message.isUser ? 'text-cyan-100' : 
                    message.isError ? 'text-red-400' : 'text-gray-400'
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
              <div className="bg-white border border-gray-200/50 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">Куля думает...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Поле ввода */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 p-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 bg-gray-100 rounded-xl border border-gray-200/50 focus-within:border-purple-400 transition-colors">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Напиши Куле что-нибудь..."
                className="w-full bg-transparent border-none resize-none py-3 px-4 focus:outline-none text-gray-800 placeholder-gray-500"
                rows={1}
                style={{ 
                  minHeight: '44px', 
                  maxHeight: '120px'
                }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading || !isConnected}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg active:scale-95 min-w-[80px] flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : '➤'}
            </button>
          </div>
          
          {/* Отладочная информация */}
          <div className="mt-2 text-xs text-gray-400 text-center">
            {API_BASE_URL ? `API: ${API_BASE_URL}` : 'NEXT_PUBLIC_BACKEND_API не настроен'}
          </div>
        </div>
      </div>
    </div>
  );
}
