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

type ChatMode = 'auto' | 'advanced' | 'normal' | 'creative';
type SystemStatus = {
  turbo_api_available: boolean;
  fast_api_available: boolean;
  image_api_available: boolean;
  server_available: boolean;
  last_check: string;
};

type DailyUsage = {
  normal_api: number;
  advanced_api: number;
  creative: number;
};

type DailyLimits = {
  normal_api: number;
  advanced_api: number;
};

const API_BASE_URL = 'https://api.kancher.ru';

export default function KulyaSmartChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<ChatMode>('auto');
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>({ normal_api: 0, advanced_api: 0, creative: 0 });
  const [dailyLimits, setDailyLimits] = useState<DailyLimits>({ normal_api: 10000, advanced_api: 5000 });
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
    
    // Периодическая проверка статуса
    const interval = setInterval(loadSystemStatus, 30000);
    return () => clearInterval(interval);
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
        setDailyUsage(data.daily_usage);
        setDailyLimits(data.daily_limits);
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
        // Приветственное сообщение
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
      localStorage.setItem('kulya_local_history', JSON.stringify(newMessages.slice(-50))); // Последние 50 сообщений
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
        
        // Добавляем приветствие
        addSystemMessage(`Рада тебя видеть, ${data.user.username} ${data.user.emoji}! Теперь у тебя есть доступ к полной истории диалогов! 💫`);
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

        // Обновляем статистику использования
        loadSystemStatus();
      } else {
        throw new Error(data.error || 'Unknown error');
      }
      
    } catch (error) {
      console.error('❌ Ошибка отправки:', error);
      
      // Локальный фолбэк
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

  // 🎯 Получение статуса системы
  const getSystemStatus = () => {
    if (!systemStatus) return { text: 'Проверяем...', color: 'bg-gray-400' };
    
    if (!systemStatus.server_available) {
      return { text: 'ЛОКАЛЬНЫЙ', color: 'bg-red-500' };
    }
    
    if (systemStatus.turbo_api_available && systemStatus.fast_api_available) {
      return { text: 'ВСЕ СИСТЕМЫ', color: 'bg-green-500' };
    }
    
    if (systemStatus.fast_api_available) {
      return { text: 'ОСНОВНЫЕ', color: 'bg-yellow-500' };
    }
    
    return { text: 'БАЗОВЫЙ', color: 'bg-orange-500' };
  };

  // 📊 Прогресс-бары для нейронов
  const getProgressPercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 70) return 'bg-green-500';
    if (percentage < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const status = getSystemStatus();
  const normalProgress = getProgressPercentage(dailyUsage.normal_api, dailyLimits.normal_api);
  const advancedProgress = getProgressPercentage(dailyUsage.advanced_api, dailyLimits.advanced_api);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-cyan-50 flex flex-col">
      {/* 🎪 Компактный хедер */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-3 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto">
          {/* Первая строка: статус и управление */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-1 hover:bg-gray-100 rounded-lg transition-colors no-underline text-gray-600">
                ←
              </Link>
              
              {/* 🔦 Сигнальная лампочка */}
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${status.color} animate-pulse`}></div>
                <span className="text-sm font-medium text-gray-700">{status.text}</span>
              </div>
              
              {/* 👤 Информация о пользователе */}
              {currentUser && (
                <div className="text-sm text-gray-600">
                  {currentUser.username} {currentUser.emoji}
                </div>
              )}
            </div>
            
            {/* 🎛️ Управление */}
            <div className="flex items-center gap-2">
              {systemStatus?.server_available && (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-3 py-1 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
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

          {/* 📊 Счётчики нейронов */}
          <div className="space-y-2">
            {/* Обычный режим */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span>⚡ Обычный:</span>
                <span className="font-medium">{dailyUsage.normal_api}</span>
                <span className="text-gray-500">/ {dailyLimits.normal_api}</span>
              </div>
              <div className="text-gray-500">
                Осталось: {dailyLimits.normal_api - dailyUsage.normal_api}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${getProgressColor(normalProgress)}`}
                style={{ width: `${normalProgress}%` }}
              ></div>
            </div>

            {/* Продвинутый режим */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span>🚀 Продвинутый:</span>
                <span className="font-medium">{dailyUsage.advanced_api}</span>
                <span className="text-gray-500">/ {dailyLimits.advanced_api}</span>
              </div>
              <div className="text-gray-500">
                Осталось: {dailyLimits.advanced_api - dailyUsage.advanced_api}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${getProgressColor(advancedProgress)}`}
                style={{ width: `${advancedProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      {/* 💭 Контейнер сообщений */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="max-w-4xl mx-auto space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 relative ${
                  message.isUser
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : message.isError
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : message.isImage
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'bg-white border border-gray-200/50 text-gray-800 shadow-sm'
                }`}
              >
                {/* 🏷️ Индикатор режима */}
                {!message.isUser && !message.isError && (
                  <div className="absolute -top-1 -left-1 bg-white border border-gray-200 rounded-full px-1.5 py-0.5 text-xs text-gray-500 shadow-sm">
                    {message.mode === 'auto' && '🤖'}
                    {message.mode === 'advanced' && '🚀'}
                    {message.mode === 'normal' && '⚡'}
                    {message.mode === 'creative' && '🎨'}
                  </div>
                )}
                
                {message.isImage ? (
                  <div className="text-center">
                    <div className="text-xs mb-1 opacity-80">🎨 Сгенерировано изображение:</div>
                    {message.text && message.text.startsWith('data:image/') ? (
                      <img 
                        src={message.text} 
                        alt="Сгенерированное изображение" 
                        className="max-w-full h-auto rounded-lg mx-auto max-h-48 shadow-lg"
                      />
                    ) : (
                      <div className="bg-white/20 p-2 rounded-lg text-xs">
                        {message.text}
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
                    message.isUser ? 'text-blue-100' : 
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
                    {currentMode === 'auto' && '🤖 Выбираю лучший режим...'}
                    {currentMode === 'advanced' && '🚀 Генерирую продвинутый ответ...'}
                    {currentMode === 'normal' && '⚡ Быстро отвечаю...'}
                    {currentMode === 'creative' && '🎨 Создаю изображение...'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 🎚️ Панель управления */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 p-3 fixed bottom-0 left-0 right-0">
        <div className="max-w-4xl mx-auto">
          {/* Переключатель режимов */}
          <div className="flex justify-center gap-2 mb-3">
            <button
              onClick={() => setCurrentMode('auto')}
              className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                currentMode === 'auto' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-lg' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300'
              }`}
              title="Автоматический выбор лучшего режима"
            >
              🤖 Автомат
            </button>

            <button
              onClick={() => setCurrentMode('normal')}
              className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                currentMode === 'normal' 
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white border-transparent shadow-lg' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
              }`}
              disabled={!systemStatus?.fast_api_available}
              title="Быстрые и стабильные ответы"
            >
              ⚡ Обычный
            </button>

            <button
              onClick={() => setCurrentMode('advanced')}
              className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                currentMode === 'advanced' 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent shadow-lg' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'
              }`}
              disabled={!systemStatus?.turbo_api_available}
              title="Мощные и качественные ответы"
            >
              🚀 Продвинутый
            </button>

            <button
              onClick={() => setCurrentMode('creative')}
              className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                currentMode === 'creative' 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent shadow-lg' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-pink-300'
              }`}
              disabled={!systemStatus?.image_api_available}
              title="Генерация изображений"
            >
              🎨 Творческий
            </button>
          </div>

          {/* Поле ввода */}
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-100 rounded-xl border border-gray-200/50 focus-within:border-purple-400 transition-colors">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  currentMode === 'auto' ? "Спроси что угодно - я выберу лучший режим! 🤖" :
                  currentMode === 'advanced' ? "Задавай сложные вопросы... 🚀" :
                  currentMode === 'normal' ? "Быстро обсудим любую тему... ⚡" :
                  "Опиши что хочешь увидеть... 🎨"
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
                currentMode === 'advanced' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                currentMode === 'normal' ? 'bg-gradient-to-r from-green-500 to-blue-500' :
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
