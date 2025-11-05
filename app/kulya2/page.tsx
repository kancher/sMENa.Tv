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

type ApiStatus = {
  deepseek_connected: boolean;
  last_check: string;
  error_message: string;
  server_time: string;
  api_key_set: boolean;
};

// Народная Куля для всех!
const API_BASE_URL = 'https://api.kancher.ru';

export default function Kulya2() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Привет! Я Куля 💃 Что интересует?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [connectionError, setConnectionError] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Проверяем статус API
  const checkApiStatus = async () => {
    try {
      console.log('🔧 Проверяем статус API...');
      const response = await fetch(`${API_BASE_URL}/status`);
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const statusData: ApiStatus = await response.json();
      console.log('✅ Статус API:', statusData);
      
      setApiStatus(statusData);
      setIsConnected(true);
      setConnectionError('');
      
    } catch (error) {
      console.error('❌ Ошибка проверки статуса:', error);
      setIsConnected(false);
      setConnectionError(error instanceof Error ? error.message : 'Unknown error');
      setApiStatus(null);
    }
  };

  useEffect(() => {
    checkApiStatus();
    
    // Периодическая проверка статуса каждые 30 секунд
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

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
        text: data.kulya_response || 'Ой, что-то пошло не так...',
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Обновляем статус API из ответа
      if (data.api_status) {
        setApiStatus(prev => prev ? {
          ...prev,
          connected: data.api_status.connected,
          last_check: data.api_status.last_check
        } : null);
      }
      
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

  const getStatusColor = () => {
    if (!isConnected) return 'bg-red-100 text-red-700';
    if (!apiStatus?.deepseek_connected) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  const getStatusText = () => {
    if (!isConnected) return 'Нет связи с сервером';
    if (!apiStatus?.deepseek_connected) return 'AI временно недоступен';
    return 'AI подключен';
  };

  const getStatusIcon = () => {
    if (!isConnected) return '🔴';
    if (!apiStatus?.deepseek_connected) return '🟡';
    return '🟢';
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
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">💃</span>
              </div>
              <div>
                <h1 className="text-lg font-medium text-gray-900">Куля 2.0</h1>
                <p className="text-xs text-gray-500">AI помощник sMeNa.Tv</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Статус подключения */}
            <div className={`text-xs px-3 py-1 rounded-full flex items-center gap-2 ${getStatusColor()}`}>
              <span className="text-lg">{getStatusIcon()}</span>
              <div>
                <div className="font-medium">{getStatusText()}</div>
                {apiStatus?.last_check && (
                  <div className="text-xs opacity-70">Проверка: {apiStatus.last_check}</div>
                )}
              </div>
            </div>
            
            <button
              onClick={clearChat}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Очистить чат"
            >
              🗑️
            </button>

            <button
              onClick={checkApiStatus}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Обновить статус"
            >
              🔄
            </button>
          </div>
        </div>
      </header>

      {/* Детальная информация о статусе */}
      {apiStatus && (
        <div className="bg-white/50 backdrop-blur-sm border-b border-gray-200/30 p-3">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="text-center">
                <div className="font-medium text-gray-500">Сервер</div>
                <div className={isConnected ? 'text-green-600' : 'text-red-600'}>
                  {isConnected ? '✅ Онлайн' : '❌ Офлайн'}
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-500">DeepSeek AI</div>
                <div className={apiStatus.deepseek_connected ? 'text-green-600' : 'text-red-600'}>
                  {apiStatus.deepseek_connected ? '✅ Подключен' : '❌ Ошибка'}
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-500">API Ключ</div>
                <div className={apiStatus.api_key_set ? 'text-green-600' : 'text-red-600'}>
                  {apiStatus.api_key_set ? '✅ Установлен' : '❌ Отсутствует'}
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-500">Время сервера</div>
                <div className="text-gray-600">{apiStatus.server_time}</div>
              </div>
            </div>
            
            {/* Показываем ошибку если есть */}
            {apiStatus.error_message && !apiStatus.deepseek_connected && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                <strong>Ошибка AI:</strong> {apiStatus.error_message}
              </div>
            )}
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
                  <span className="text-sm text-gray-500">
                    {apiStatus?.deepseek_connected ? 'Куля думает...' : 'Пытаюсь подключиться к AI...'}
                  </span>
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
                placeholder={
                  apiStatus?.deepseek_connected 
                    ? "Напиши Куле что-нибудь..." 
                    : "AI временно недоступен..."
                }
                disabled={!apiStatus?.deepseek_connected}
                className="w-full bg-transparent border-none resize-none py-3 px-4 focus:outline-none text-gray-800 placeholder-gray-500 disabled:opacity-50"
                rows={1}
                style={{ 
                  minHeight: '44px', 
                  maxHeight: '120px'
                }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading || !apiStatus?.deepseek_connected}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg active:scale-95 min-w-[80px] flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : '➤'}
            </button>
          </div>
          
          {/* Статусная строка */}
          <div className="mt-2 text-xs text-gray-500 text-center">
            {apiStatus?.deepseek_connected ? (
              '💫 Куля готова к общению!'
            ) : (
              '⚠️ AI временно недоступен. Используются базовые ответы.'
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
