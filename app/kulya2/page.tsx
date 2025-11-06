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
  user?: User;
};

type User = {
  username: string;
  role: string;
  emoji: string;
  daily_tokens_used?: number;
};

type ChatMode = 'common' | 'creative' | 'turbo';

const API_BASE_URL = 'https://api.kancher.ru';
const CLOUDFLARE_LIMIT = 10000;

export default function Kulya2WithAuth() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<ChatMode>('common');
  const [neuronsUsed, setNeuronsUsed] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [authUsername, setAuthUsername] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🔍 Проверяем аутентификацию при загрузке
  useEffect(() => {
    const token = localStorage.getItem('kulya_token');
    if (token) {
      checkAuth(token);
    } else {
      setShowAuthModal(true);
    }
  }, []);

  // 📜 Автопрокрутка к новым сообщениям
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🔐 Проверка токена
  const checkAuth = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        setShowAuthModal(false);
        loadUserHistory(token);
        loadUserStats(token);
      } else {
        localStorage.removeItem('kulya_token');
        setShowAuthModal(true);
      }
    } catch (error) {
      localStorage.removeItem('kulya_token');
      setShowAuthModal(true);
    }
  };

  // 📊 Загрузка статистики пользователя
  const loadUserStats = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNeuronsUsed(data.stats.daily_tokens_used || 0);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  // 🚪 Вход в систему
  const handleLogin = async () => {
    if (!authUsername.trim()) return;
    
    setAuthLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authUsername })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('kulya_token', data.token);
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        setShowAuthModal(false);
        addWelcomeMessage(data.user);
        loadUserHistory(data.token);
        loadUserStats(data.token);
      } else {
        alert(data.error || 'Ошибка аутентификации');
      }
    } catch (error) {
      alert('Ошибка подключения к серверу');
    } finally {
      setAuthLoading(false);
    }
  };

  // 👋 Приветственное сообщение
  const addWelcomeMessage = (user: User) => {
    const welcomeMessage: Message = {
      id: 'welcome',
      text: `Привет! Я Куля 💃 Рада тебя видеть, ${user.username} ${user.emoji}!\n\nВыбери режим общения внизу и давай творить чудеса! ✨`,
      isUser: false,
      timestamp: new Date(),
      mode: 'common',
      user: user
    };
    setMessages([welcomeMessage]);
  };

  // 📚 Загрузка истории диалогов
  const loadUserHistory = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/dialogs/history?limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.history.length > 0) {
          const historyMessages: Message[] = data.history.reverse().map((dialog: any) => ({
            id: `hist_${dialog.id}`,
            text: dialog.user_message,
            isUser: true,
            timestamp: new Date(dialog.timestamp),
            mode: dialog.mode
          }));
          
          const responseMessages: Message[] = data.history.map((dialog: any) => ({
            id: `resp_${dialog.id}`,
            text: dialog.ai_response,
            isUser: false,
            timestamp: new Date(dialog.timestamp),
            mode: dialog.mode,
            apiUsed: dialog.api_used,
            isImage: dialog.ai_response?.startsWith?.('data:image/')
          }));
          
          // Чередуем сообщения пользователя и ответы
          const allMessages: Message[] = [];
          for (let i = 0; i < historyMessages.length; i++) {
            allMessages.push(historyMessages[i]);
            if (responseMessages[i]) {
              allMessages.push(responseMessages[i]);
            }
          }
          
          setMessages(allMessages);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
    }
  };

  // 📨 Отправка сообщения
  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading || !currentUser) return;

    const token = localStorage.getItem('kulya_token');
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
      mode: currentMode,
      user: currentUser
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/v2/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: inputText,
          mode: currentMode
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      
      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.kulya_response || 'Ой, что-то пошло не так...',
          isUser: false,
          timestamp: new Date(),
          mode: data.mode,
          apiUsed: data.api_used,
          isImage: data.is_image || false,
          user: data.user
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setNeuronsUsed(prev => prev + (data.tokens_used || 0));

        // 🔄 Автопереключение при ошибках CloudFlare
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

  // 💬 Системные сообщения
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

  // ⌨️ Обработка клавиши Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 🚪 Выход из системы
  const handleLogout = () => {
    localStorage.removeItem('kulya_token');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setMessages([]);
    setShowAuthModal(true);
  };

  // 🧹 Очистка чата
  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: `Чат очищен! Выбери режим внизу и погнали, ${currentUser?.username} ${currentUser?.emoji}! 💫`,
        isUser: false,
        timestamp: new Date(),
        mode: currentMode,
        user: currentUser
      }
    ]);
  };

  // ⛽ Прогресс-бар для нейронов
  const neuronsPercentage = Math.min((neuronsUsed / CLOUDFLARE_LIMIT) * 100, 100);
  const neuronsRemaining = CLOUDFLARE_LIMIT - neuronsUsed;

  // 🎯 Получение описания режима
  const getModeDescription = () => {
    switch (currentMode) {
      case 'common': return 'Общаемся через CloudFlare';
      case 'creative': return 'Генерируем изображения';
      case 'turbo': return 'Мощный режим через Mistral';
      default: return 'Выбери режим';
    }
  };

  // 🚫 Модальное окно аутентификации
  if (showAuthModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl border border-purple-100">
          {/* 🎯 Заголовок */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-2xl">💃</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Куля 4.0</h1>
            <p className="text-gray-600">Душа проекта sMeNa.Tv</p>
          </div>
          
          {/* 📝 Форма входа */}
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)}
                placeholder="Как к вам обращаться?"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            
            {/* 🚀 Кнопка входа */}
            <button
              onClick={handleLogin}
              disabled={!authUsername.trim() || authLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium disabled:opacity-50 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              {authLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Входим...</span>
                </div>
              ) : (
                'Войти в чат 💫'
              )}
            </button>
            
            {/* 💝 Красивое сообщение о вежливости */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 italic leading-relaxed">
                "Будьте, пожалуйста, вежливы — технологии ведь тоже живые, 
                ведь их создавали живые люди с любовью и надеждой на лучшее будущее" 💖
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 💬 Основной интерфейс чата
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-cyan-50 flex flex-col">
      {/* 🎪 Компактный хедер */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-3 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* 👤 Информация о пользователе */}
          <div className="flex items-center gap-2">
            <Link href="/" className="p-1 hover:bg-gray-100 rounded-lg transition-colors no-underline text-gray-600 text-sm">
              ←
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-xs">💃</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {currentUser?.username} {currentUser?.emoji}
                </div>
                <div className="text-xs text-gray-500">
                  {getModeDescription()}
                </div>
              </div>
            </div>
          </div>
          
          {/* 🎛️ Управление */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleLogout}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Выйти"
            >
              Выйти
            </button>
            
            <button
              onClick={clearChat}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Очистить чат"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* ⛽ Счётчик нейронов */}
        <div className="max-w-4xl mx-auto mt-2">
          <div className="flex items-center justify-between text-xs">
            <div className="text-gray-600">
              ⛽ Нейроны: {neuronsUsed}/{CLOUDFLARE_LIMIT}
            </div>
            <div className="text-gray-500">
              Осталось: {neuronsRemaining}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                neuronsPercentage < 70 ? 'bg-green-500' : 
                neuronsPercentage < 90 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${neuronsPercentage}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* 💭 Контейнер сообщений */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="max-w-4xl mx-auto space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 relative ${
                  message.isUser
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                    : message.isError
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : message.isImage
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'bg-white border border-gray-200/50 text-gray-800 shadow-sm'
                }`}
              >
                {/* 🏷️ Индикатор режима для сообщений AI */}
                {!message.isUser && !message.isError && (
                  <div className="absolute -top-1 -left-1 bg-white border border-gray-200 rounded-full px-1.5 py-0.5 text-xs text-gray-500 shadow-sm flex items-center gap-1">
                    {message.mode === 'common' && '🙆‍♀️'}
                    {message.mode === 'creative' && '💃'} 
                    {message.mode === 'turbo' && '💁‍♀️'}
                  </div>
                )}
                
                {message.isImage ? (
                  <div className="text-center">
                    <div className="text-xs mb-1 opacity-80">🎨 Сгенерировано изображение:</div>
                    {message.text && typeof message.text === 'string' && message.text.startsWith('data:image/') ? (
                      <img 
                        src={message.text} 
                        alt="Сгенерированное изображение" 
                        className="max-w-full h-auto rounded-lg mx-auto max-h-48 shadow-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="bg-white/20 p-2 rounded-lg text-xs">
                        {typeof message.text === 'string' ? message.text : 'Загружаю изображение...'}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed text-sm">
                    {message.text}
                  </div>
                )}
                
                <div
                  className={`text-xs mt-1 ${
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
          
          {/* ⏳ Индикатор загрузки */}
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
                    {currentMode === 'common' && '🙆‍♀️ Общаемся...'}
                    {currentMode === 'creative' && '💃 Творим...'}
                    {currentMode === 'turbo' && '💁‍♀️ Турбируем...'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 🎚️ Переключатель режимов - ТЕПЕРЬ ВНИЗУ */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 p-3 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center gap-3 mb-2">
            {/* 🙆‍♀️ Режим 1: Общяшка */}
            <button
              onClick={() => setCurrentMode('common')}
              className={`p-3 rounded-xl border-2 transition-all text-2xl ${
                currentMode === 'common' 
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-transparent shadow-lg scale-110' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-cyan-300 hover:shadow-md'
              }`}
              title="Общяшка - CloudFlare"
            >
              🙆‍♀️
            </button>

            {/* 💃 Режим 2: Творяшка */}
            <button
              onClick={() => setCurrentMode('creative')}
              className={`p-3 rounded-xl border-2 transition-all text-2xl ${
                currentMode === 'creative' 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent shadow-lg scale-110' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-pink-300 hover:shadow-md'
              }`}
              title="Творяшка - Изображения"
            >
              💃🎨
            </button>

            {/* 💁‍♀️ Режим 3: Турбо */}
            <button
              onClick={() => setCurrentMode('turbo')}
              className={`p-3 rounded-xl border-2 transition-all text-2xl ${
                currentMode === 'turbo' 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent shadow-lg scale-110' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:shadow-md'
              }`}
              title="Турбо-пупер - Mistral API"
            >
              💁‍♀️🤓
            </button>
          </div>

          {/* ⌨️ Поле ввода */}
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-100 rounded-xl border border-gray-200/50 focus-within:border-purple-400 transition-colors">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  currentMode === 'common' ? "Пиши что хочешь... 🙆‍♀️" :
                  currentMode === 'creative' ? "Опиши что нарисовать... 💃🎨" :
                  "Задавай сложные вопросы... 💁‍♀️🤓"
                }
                className="w-full bg-transparent border-none resize-none py-2 px-3 focus:outline-none text-gray-800 placeholder-gray-500 text-sm"
                rows={1}
                style={{ 
                  minHeight: '40px', 
                  maxHeight: '80px'
                }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className={`px-4 py-2 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg active:scale-95 flex items-center justify-center ${
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
        </div>
      </div>
    </div>
  );
}
