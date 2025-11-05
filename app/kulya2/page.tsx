'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isError?: boolean;
  isImage?: boolean;
  mode?: string;
  apiUsed?: string;
};

type ApiStatus = {
  mistral_connected: boolean;
  last_check: string;
  error_message: string;
  mode: string;
  server_time: string;
  api_key_set: boolean;
};

// Три режима работы
type ChatMode = 'common' | 'creative' | 'turbo';

// Базовый URL API
const API_BASE_URL = 'https://api.kancher.ru';

// Счётчик нейронов CloudFlare
const CLOUDFLARE_LIMIT = 10000; // 10,000 нейронов в день

export default function Kulya2() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Привет! Я Куля 💃 Выбери режим общения и погнали!',
      isUser: false,
      timestamp: new Date(),
      mode: 'common'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [connectionError, setConnectionError] = useState<string>('');
  const [currentMode, setCurrentMode] = useState<ChatMode>('common');
  const [neuronsUsed, setNeuronsUsed] = useState(0);
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

  // Загружаем историю нейронов из localStorage
  useEffect(() => {
    const savedNeurons = localStorage.getItem('kulya_neurons_used');
    if (savedNeurons) {
      setNeuronsUsed(parseInt(savedNeurons));
    }
    checkApiStatus();
    
    // Периодическая проверка статуса каждые 30 секунд
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Обновляем счётчик нейронов
  const updateNeuronsCounter = (apiUsed: string) => {
    let neuronsToAdd = 0;
    
    if (apiUsed.includes('cloudflare')) {
      if (apiUsed === 'cloudflare_llama') {
        neuronsToAdd = 1; // Текстовый запрос
      } else if (apiUsed === 'cloudflare_sd') {
        neuronsToAdd = 5; // Генерация изображения
      }
    }
    
    if (neuronsToAdd > 0) {
      const newTotal = neuronsUsed + neuronsToAdd;
      setNeuronsUsed(newTotal);
      localStorage.setItem('kulya_neurons_used', newTotal.toString());
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
      mode: currentMode
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/v2/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText,
          mode: currentMode
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      
      if (data.success) {
        // Обновляем счётчик нейронов
        if (data.api_used) {
          updateNeuronsCounter(data.api_used);
        }
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.kulya_response || 'Ой, что-то пошло не так...',
          isUser: false,
          timestamp: new Date(),
          mode: data.mode,
          apiUsed: data.api_used,
          isImage: data.is_image || false
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        // Если был автопереход из режима 1 в режим 3
        if (currentMode === 'common' && data.mode === 'turbo' && data.api_used !== 'cloudflare_llama') {
          setCurrentMode('turbo');
          addSystemMessage('🔄 Автоматически переключилась в Турбо-режим!');
        }
      } else {
        throw new Error(data.error || 'Unknown error');
      }
      
    } catch (error) {
      console.error('❌ Ошибка отправки:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '⚠️ Сервер временно недоступен. Попробуйте позже.',
        isUser: false,
        isError: true,
        timestamp: new Date(),
        mode: currentMode
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const addSystemMessage = (text: string) => {
    const systemMessage: Message = {
      id: `system-${Date.now()}`,
      text: text,
      isUser: false,
      timestamp: new Date(),
      mode: currentMode
    };
    setMessages(prev => [...prev, systemMessage]);
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
        text: 'Чат очищен! Выбери режим и погнали! 💫',
        isUser: false,
        timestamp: new Date(),
        mode: currentMode
      }
    ]);
  };

  const resetNeuronsCounter = () => {
    setNeuronsUsed(0);
    localStorage.setItem('kulya_neurons_used', '0');
    addSystemMessage('🧹 Счётчик нейронов сброшен! Начинаем новый день!');
  };

  const getStatusColor = () => {
    if (!isConnected) return 'bg-red-100 text-red-700 border-red-200';
    if (currentMode === 'creative' && !isConnected) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const getStatusText = () => {
    if (!isConnected) return 'Нет связи с сервером';
    
    switch (currentMode) {
      case 'common': return 'Общяшка (CloudFlare)';
      case 'creative': return 'Творяшка (Изображения)';
      case 'turbo': return 'Турбо-пупер-режим!';
      default: return 'Режим не выбран';
    }
  };

  const getStatusIcon = () => {
    if (!isConnected) return '🔴';
    
    switch (currentMode) {
      case 'common': return '💬';
      case 'creative': return '🎨';
      case 'turbo': return '⚡';
      default: return '❓';
    }
  };

  const getModeDescription = () => {
    switch (currentMode) {
      case 'common': 
        return 'Общаемся через CloudFlare (Llama-3)';
      case 'creative':
        return 'Генерируем изображения через Stable Diffusion';
      case 'turbo':
        return 'Мощный режим через Mistral AI API';
      default:
        return 'Выбери режим общения';
    }
  };

  // Прогресс-бар для нейронов
  const neuronsPercentage = Math.min((neuronsUsed / CLOUDFLARE_LIMIT) * 100, 100);
  const neuronsRemaining = CLOUDFLARE_LIMIT - neuronsUsed;

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
                <h1 className="text-lg font-medium text-gray-900">Куля 3.0</h1>
                <p className="text-xs text-gray-500">Трёхрежимный AI помощник</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Статус подключения */}
            <div className={`text-xs px-3 py-1 rounded-full flex items-center gap-2 border ${getStatusColor()}`}>
              <span className="text-lg">{getStatusIcon()}</span>
              <div>
                <div className="font-medium">{getStatusText()}</div>
                <div className="text-xs opacity-70">{getModeDescription()}</div>
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

      {/* Счётчик нейронов CloudFlare */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-gray-200/30 p-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-700">
              ⛽ Нейроны CloudFlare: {neuronsUsed} / {CLOUDFLARE_LIMIT}
            </div>
            <button
              onClick={resetNeuronsCounter}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
            >
              Сбросить
            </button>
          </div>
          
          {/* Прогресс-бар */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                neuronsPercentage < 70 ? 'bg-green-500' : 
                neuronsPercentage < 90 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${neuronsPercentage}%` }}
            ></div>
          </div>
          
          <div className="text-xs text-gray-500 mt-1">
            Осталось: {neuronsRemaining} нейронов • {neuronsPercentage.toFixed(1)}% использовано
          </div>
        </div>
      </div>

      {/* Переключатель режимов */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4">
            {/* Режим 1: Общяшка */}
            <button
              onClick={() => setCurrentMode('common')}
              className={`flex-1 max-w-48 py-3 px-4 rounded-xl border-2 transition-all ${
                currentMode === 'common' 
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-transparent shadow-lg' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-cyan-300'
              }`}
            >
              <div className="text-lg mb-1">💬</div>
              <div className="font-medium text-sm">Общяшка</div>
              <div className="text-xs opacity-80">CloudFlare</div>
            </button>

            {/* Режим 2: Творяшка */}
            <button
              onClick={() => setCurrentMode('creative')}
              className={`flex-1 max-w-48 py-3 px-4 rounded-xl border-2 transition-all ${
                currentMode === 'creative' 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent shadow-lg' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-pink-300'
              }`}
            >
              <div className="text-lg mb-1">🎨</div>
              <div className="font-medium text-sm">Творяшка</div>
              <div className="text-xs opacity-80">Изображения</div>
            </button>

            {/* Режим 3: Турбо */}
            <button
              onClick={() => setCurrentMode('turbo')}
              className={`flex-1 max-w-48 py-3 px-4 rounded-xl border-2 transition-all ${
                currentMode === 'turbo' 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent shadow-lg' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'
              }`}
            >
              <div className="text-lg mb-1">⚡</div>
              <div className="font-medium text-sm">Турбо-пупер</div>
              <div className="text-xs opacity-80">Mistral API</div>
            </button>
          </div>
        </div>
      </div>

      {/* Чат контейнер */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 relative ${
                  message.isUser
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                    : message.isError
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : message.isImage
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'bg-white border border-gray-200/50 text-gray-800 shadow-sm'
                }`}
              >
                {/* Индикатор режима для сообщений AI */}
                {!message.isUser && !message.isError && (
                  <div className="absolute -top-2 -left-2 bg-white border border-gray-200 rounded-full px-2 py-1 text-xs text-gray-500 shadow-sm">
                    {message.mode === 'common' && '💬'}
                    {message.mode === 'creative' && '🎨'} 
                    {message.mode === 'turbo' && '⚡'}
                    {message.apiUsed && ` • ${message.apiUsed.includes('cloudflare') ? 'CF' : 'API'}`}
                  </div>
                )}
                
                {message.isImage ? (
                  <div className="text-center">
                    <div className="text-sm mb-2 opacity-80">🎨 Сгенерировано изображение:</div>
                    {message.text && typeof message.text === 'string' && message.text.startsWith('data:image/') ? (
                      <img 
                        src={message.text} 
                        alt="Сгенерированное изображение" 
                        className="max-w-full h-auto rounded-lg mx-auto max-h-64 shadow-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="bg-white/20 p-3 rounded-lg text-sm">
                        {typeof message.text === 'string' ? message.text : 'Загружаю изображение...'}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {message.text}
                  </div>
                )}
                
                <div
                  className={`text-xs mt-2 ${
                    message.isUser ? 'text-cyan-100' : 
                    message.isError ? 'text-red-400' : 
                    message.isImage ? 'text-white/70' : 'text-gray-400'
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
                    {currentMode === 'common' && '💬 Общаемся...'}
                    {currentMode === 'creative' && '🎨 Творим...'}
                    {currentMode === 'turbo' && '⚡ Турбируем...'}
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
                  currentMode === 'common' ? "Пиши что хочешь - отвечу через CloudFlare! 💬" :
                  currentMode === 'creative' ? "Опиши что нарисовать... 🎨" :
                  "Задавай сложные вопросы - включён турбо-режим! ⚡"
                }
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
              disabled={!inputText.trim() || isLoading}
              className={`px-6 py-3 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg active:scale-95 min-w-[80px] flex items-center justify-center ${
                currentMode === 'common' ? 'bg-gradient-to-r from-cyan-500 to-purple-500' :
                currentMode === 'creative' ? 'bg-gradient-to-r from-pink-500 to-purple-500' :
                'bg-gradient-to-r from-orange-500 to-red-500'
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                currentMode === 'creative' ? '🎨' : '➤'
              )}
            </button>
          </div>
          
          {/* Статусная строка */}
          <div className="mt-2 text-xs text-gray-500 text-center">
            {currentMode === 'common' && '💬 Общяшка: быстрые ответы через CloudFlare Worker'}
            {currentMode === 'creative' && '🎨 Творяшка: генерация изображений через Stable Diffusion'}
            {currentMode === 'turbo' && '⚡ Турбо-пупер-режим: мощные ответы через Mistral API'}
          </div>
        </div>
      </div>
    </div>
  );
}
