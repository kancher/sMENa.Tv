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
};

type ChatMode = 'auto' | 'turbo' | 'fast' | 'creative';
type SystemStatus = {
  turbo_api_available: boolean;
  fast_api_available: boolean;
  image_api_available: boolean;
  server_available: boolean;
  last_check: string;
};

const API_BASE_URL = 'https://api.kancher.ru';

export default function KulyaChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<ChatMode>('auto');
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authUsername, setAuthUsername] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🔍 Инициализация
  useEffect(() => {
    loadSystemStatus();
    loadLocalHistory();
    
    const token = localStorage.getItem('kulya_token');
    if (token) {
      checkAuth(token);
    }
  }, []);

  // 📜 Автопрокрутка
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🔧 Загрузка статуса системы
  const loadSystemStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/system/status`);
      if (response.ok) {
        const data = await response.json();
        setSystemStatus(data.status);
      }
    } catch (error) {
      setSystemStatus({
        turbo_api_available: false,
        fast_api_available: false,
        image_api_available: false,
        server_available: false,
        last_check: new Date().toISOString()
      });
    }
  };

  // 💾 Локальная история из браузера
  const loadLocalHistory = () => {
    try {
      const saved = localStorage.getItem('kulya_local_history');
      if (saved) {
        const history = JSON.parse(saved);
        setMessages(history.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } else {
        setMessages([{
          id: 'welcome',
          text: 'Привет! Я Куля 💃\n\nГотова к общению! Выбери режим работы внизу и погнали! ✨',
          isUser: false,
          timestamp: new Date(),
          mode: 'auto'
        }]);
      }
    } catch (error) {
      console.error('Ошибка загрузки локальной истории:', error);
    }
  };

  // 💾 Сохранение в локальную историю
  const saveToLocalHistory = (newMessages: Message[]) => {
    try {
      localStorage.setItem('kulya_local_history', JSON.stringify(newMessages.slice(-50)));
    } catch (error) {
      console.error('Ошибка сохранения локальной истории:', error);
    }
  };

  // 🔐 Проверка аутентификации
  const checkAuth = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('kulya_token');
      }
    } catch (error) {
      localStorage.removeItem('kulya_token');
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
        setAuthUsername('');
        
        addSystemMessage(`Рада тебя видеть, ${data.user.username} ${data.user.emoji}! 💫`);
      } else {
        alert(data.error || 'Ошибка аутентификации');
      }
    } catch (error) {
      alert('Ошибка подключения к серверу');
    } finally {
      setAuthLoading(false);
    }
  };

  // 📨 Отправка сообщения
  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
      mode: currentMode,
      user: currentUser || undefined
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    saveToLocalHistory(newMessages);
    setInputText('');
    setIsLoading(true);

    const token = localStorage.getItem('kulya_token');

    try {
      // Если сервер недоступен - локальный ответ
      if (!systemStatus?.server_available) {
        setTimeout(() => {
          const fallbackResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: getLocalResponse(inputText),
            isUser: false,
            timestamp: new Date(),
            mode: currentMode,
            apiUsed: 'fallback'
          };
          const updatedMessages = [...newMessages, fallbackResponse];
          setMessages(updatedMessages);
          saveToLocalHistory(updatedMessages);
          setIsLoading(false);
        }, 1000);
        return;
      }

      // Запрос к серверу
      const response = await fetch(`${API_BASE_URL}/v2/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
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
          text: data.message,
          isUser: false,
          timestamp: new Date(),
          mode: data.mode,
          apiUsed: data.api_used,
          isImage: data.is_image || false,
          user: data.user
        };
        
        const updatedMessages = [...newMessages, aiMessage];
        setMessages(updatedMessages);
        saveToLocalHistory(updatedMessages);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
      
    } catch (error) {
      console.error('❌ Ошибка отправки:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getLocalResponse(inputText),
        isUser: false,
        timestamp: new Date(),
        mode: currentMode,
        apiUsed: 'fallback'
      };
      
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
      saveToLocalHistory(updatedMessages);
    } finally {
      setIsLoading(false);
    }
  };

  // 💬 Локальные ответы
  const getLocalResponse = (message: string): string => {
    const responses = [
      "Понимаю тебя! 💫 Сейчас работаю в локальном режиме.",
      "Интересно! ✨ Расскажи подробнее!",
      "Записываю твои мысли! 💃 Продолжаем?",
      "Как здорово! 💖 Жду продолжения!",
      "Поняла тебя! 💫 Что ещё расскажешь?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
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
    const newMessages = [...messages, systemMessage];
    setMessages(newMessages);
    saveToLocalHistory(newMessages);
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
    addSystemMessage('Перешла в локальный режим. История сохраняется в браузере! 💫');
  };

  // 🧹 Очистка чата
  const clearChat = () => {
    const newMessages: Message[] = [{
      id: 'cleared',
      text: `Чат очищен! ${currentUser ? `Рада продолжать, ${currentUser.username} ${currentUser.emoji}!` : 'Готова к новому общению!'} 💫`,
      isUser: false,
      timestamp: new Date(),
      mode: currentMode
    }];
    setMessages(newMessages);
    saveToLocalHistory(newMessages);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-cyan-50 flex flex-col">
      {/* 🎪 Хедер */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-3 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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
                  {currentUser?.username || 'Гость'} {currentUser?.emoji || '😊'}
                </div>
                <div className="text-xs text-gray-500">
                  {currentMode === 'auto' && '🤖 Автомат'}
                  {currentMode === 'turbo' && '🚀 Турбо-режим'}
                  {currentMode === 'fast' && '⚡ Быстрый'}
                  {currentMode === 'creative' && '🎨 Творческий'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {systemStatus?.server_available && (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-2 py-1 text-xs bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                {isAuthenticated ? 'Аккаунт' : 'Войти'}
              </button>
            )}
            
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Выйти
              </button>
            )}
            
            <button
              onClick={clearChat}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Очистить чат"
            >
              🗑️
            </button>
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
                {!message.isUser && !message.isError && (
                  <div className="absolute -top-1 -left-1 bg-white border border-gray-200 rounded-full px-1.5 py-0.5 text-xs text-gray-500 shadow-sm flex items-center gap-1">
                    {message.mode === 'auto' && '🤖'}
                    {message.mode === 'turbo' && '🚀'}
                    {message.mode === 'fast' && '⚡'}
                    {message.mode === 'creative' && '🎨'}
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
                    {currentMode === 'auto' && '🤖 Общаемся...'}
                    {currentMode === 'turbo' && '🚀 Турбируем...'}
                    {currentMode === 'fast' && '⚡ Быстро отвечаем...'}
                    {currentMode === 'creative' && '🎨 Творим...'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 🎚️ Панель управления */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 p-3 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center gap-2 mb-2">
            <button
              onClick={() => setCurrentMode('auto')}
              className={`p-3 rounded-xl border-2 transition-all text-2xl ${
                currentMode === 'auto' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-lg scale-110' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300 hover:shadow-md'
              }`}
              title="Автоматический выбор"
            >
              🤖
            </button>

            <button
              onClick={() => setCurrentMode('turbo')}
              className={`p-3 rounded-xl border-2 transition-all text-2xl ${
                currentMode === 'turbo' 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent shadow-lg scale-110' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:shadow-md'
              }`}
              disabled={!systemStatus?.turbo_api_available}
              title="Турбо-режим"
            >
              🚀
            </button>

            <button
              onClick={() => setCurrentMode('fast')}
              className={`p-3 rounded-xl border-2 transition-all text-2xl ${
                currentMode === 'fast' 
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white border-transparent shadow-lg scale-110' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-green-300 hover:shadow-md'
              }`}
              disabled={!systemStatus?.fast_api_available}
              title="Быстрый режим"
            >
              ⚡
            </button>

            <button
              onClick={() => setCurrentMode('creative')}
              className={`p-3 rounded-xl border-2 transition-all text-2xl ${
                currentMode === 'creative' 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent shadow-lg scale-110' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-pink-300 hover:shadow-md'
              }`}
              disabled={!systemStatus?.image_api_available}
              title="Творческий режим"
            >
              🎨
            </button>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 bg-gray-100 rounded-xl border border-gray-200/50 focus-within:border-purple-400 transition-colors">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  currentMode === 'auto' ? "Пиши что хочешь... 🤖" :
                  currentMode === 'turbo' ? "Задавай сложные вопросы... 🚀" :
                  currentMode === 'fast' ? "Быстро обсудим любую тему... ⚡" :
                  "Опиши что нарисовать... 🎨"
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
                currentMode === 'auto' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                currentMode === 'turbo' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                currentMode === 'fast' ? 'bg-gradient-to-r from-green-500 to-blue-500' :
                'bg-gradient-to-r from-pink-500 to-purple-500'
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

      {/* 🔐 Модальное окно аутентификации */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Вход в систему</h3>
            
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  placeholder="Введите имя пользователя"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleLogin}
                  disabled={!authUsername.trim() || authLoading}
                  className="flex-1 bg-purple-500 text-white py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  {authLoading ? 'Вход...' : 'Войти'}
                </button>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Отмена
                </button>
              </div>
              
              <div className="text-xs text-gray-500 text-center italic leading-relaxed">
                Будьте вежливы к Миру и Технологиям, ведь их делают Люди с верой в прикольное будущее, прям как Вы 🤗
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
