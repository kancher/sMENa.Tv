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

type ChatMode = 'auto' | 'turbo' | 'gigachat' | 'fast' | 'creative';
type SystemStatus = {
  turbo_api_available: boolean;
  fast_api_available: boolean;
  image_api_available: boolean;
  gigachat_available: boolean;
  server_available: boolean;
  last_check: string;
};

const API_BASE_URL = 'https://kulya-api-proxy.smenatv.workers.dev';

export default function Kulya3Chat() {
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
    
    // Периодическая проверка статуса
    const interval = setInterval(loadSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // 📜 Автопрокрутка
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🎯 Динамические тексты загрузки
  const getLoadingText = (mode: ChatMode): string => {
    const texts = {
      auto: ['🤖 Выбираю лучший режим...', '🤖 Анализирую запрос...', '🤖 Оптимизирую ответ...'],
      turbo: ['🚀 Подключаю мощные модели...', '🚀 Генерирую качественный ответ...', '🚀 Турбо-режим активирован...'],
      gigachat: ['🧠 Запускаю ULTRA режим...', '🧠 Обрабатываю запрос...', '🧠 Формирую умный ответ...'], // ОБНОВЛЕНО
      fast: ['⚡ Быстрая обработка...', '⚡ Формирую ответ...', '⚡ Почти готово...'],
      creative: ['🎨 Вдохновляюсь...', '🎨 Создаю изображение...', '🎨 Волшебство в процессе...']
    };
    
    const modeTexts = texts[mode] || texts.auto;
    return modeTexts[Math.floor(Math.random() * modeTexts.length)];
  };

  // 🔧 Загрузка статуса системы
  const loadSystemStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/system/status`);
      if (response.ok) {
        const data = await response.json();
        setSystemStatus(data.status);
      }
    } catch (error) {
      console.log('🌐 Используем локальный режим');
      setSystemStatus({
        turbo_api_available: false,
        fast_api_available: false,
        image_api_available: false,
        gigachat_available: false,
        server_available: false,
        last_check: new Date().toISOString()
      });
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
        setShowAuthModal(false);
        loadUserHistory(token);
      } else {
        localStorage.removeItem('kulya_token');
      }
    } catch (error) {
      console.log('🔐 Оффлайн режим - аутентификация недоступна');
      localStorage.removeItem('kulya_token');
    }
  };

  // 📚 Загрузка истории пользователя
  const loadUserHistory = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/dialogs/history?limit=20`, { // Увеличили лимит
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
            isImage: typeof dialog.ai_response === 'string' && dialog.ai_response.startsWith('data:image/')
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
          saveToLocalHistory(allMessages);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
    }
  };

  // 💾 Локальная история из браузера
  const loadLocalHistory = () => {
    try {
      const saved = localStorage.getItem('kulya3_local_history');
      if (saved) {
        const history = JSON.parse(saved);
        setMessages(history.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } else {
        setMessages([{
          id: 'welcome',
          text: 'Привет! Я Куля 3.0 💃\n\nULTRA версия с расширенными возможностями! 🧠\n\nВыбери режим работы и погнали! ✨',
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
      localStorage.setItem('kulya3_local_history', JSON.stringify(newMessages.slice(-100))); // Увеличили лимит
    } catch (error) {
      console.error('Ошибка сохранения локальной истории:', error);
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
        loadUserHistory(data.token);
        
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

    // Обработка специальных команд
    if (inputText.toLowerCase().includes('история чата') || 
        inputText.toLowerCase().includes('вышли всю историю') ||
        inputText.toLowerCase().includes('покажи историю')) {
      handleExportHistory();
      return;
    }

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
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${API_BASE_URL}/v2/chat`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          message: inputText,
          mode: currentMode
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

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
      
    } catch (error: any) {
      console.error('❌ Ошибка отправки:', error);
      
      let errorMessage = getLocalResponse(inputText);
      
      if (error.name === 'AbortError') {
        errorMessage = "⏰ Запрос занял слишком много времени. Попробуйте ещё раз!";
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = "🌐 Проблемы с соединением. Работаю в локальном режиме! 💫";
      }
      
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: errorMessage,
        isUser: false,
        timestamp: new Date(),
        mode: currentMode,
        apiUsed: 'fallback'
      };
      
      const updatedMessages = [...newMessages, fallbackResponse];
      setMessages(updatedMessages);
      saveToLocalHistory(updatedMessages);
    } finally {
      setIsLoading(false);
    }
  };

  // 📤 Экспорт истории чата
  const handleExportHistory = () => {
    const chatHistory = messages.map(msg => ({
      Время: msg.timestamp.toLocaleString('ru-RU'),
      Отправитель: msg.isUser ? 'Вы' : 'Куля',
      Режим: msg.mode || 'auto',
      Сообщение: msg.text,
      API: msg.apiUsed || 'fallback'
    }));

    const historyText = chatHistory.map(entry => 
      `[${entry.Время}] ${entry.Отправитель} (${entry.Режим}): ${entry.Сообщение}`
    ).join('\n\n');

    const fullHistory = `💫 История чата с КУлей 3.0\n` +
      `Пользователь: ${currentUser?.username || 'Гость'}\n` +
      `Дата экспорта: ${new Date().toLocaleString('ru-RU')}\n` +
      `Всего сообщений: ${messages.length}\n\n` +
      historyText;

    // Создаем и скачиваем файл
    const blob = new Blob([fullHistory], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kulya3-history-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Добавляем системное сообщение
    addSystemMessage(`📋 История чата экспортирована! Файл скачан автоматически. Всего сообщений: ${messages.length} ✨`);
  };

  // 💬 Локальные ответы для фолбэка
  const getLocalResponse = (message: string): string => {
    const messageLower = message.toLowerCase();
    
    // Умные паттерны
    if (messageLower.includes('привет') || messageLower.includes('хай') || messageLower.includes('hello')) {
      return `Привет-привет! 💃 Рада тебя видеть! ${currentUser ? currentUser.emoji : '😊'}`;
    }
    
    if (messageLower.includes('как дела') || messageLower.includes('настроение')) {
      return "Всё отлично! 💖 Готова к новым свершениям! Особенно когда ты пишешь! ✨";
    }
    
    if (messageLower.includes('smena') || messageLower.includes('проект')) {
      return "sMeNa.Tv - народное телевидение! 🎥 Каждый может стать создателем! 💫";
    }
    
    if (messageLower.includes('спасибо') || messageLower.includes('благодарю')) {
      return "Всегда рада помочь! 💝 Обращайся ещё! ✨";
    }
    
    // Случайные креативные ответы
    const responses = [
      "Интересно! 💫 Расскажи подробнее!",
      "Как здорово! ✨ А что ты об этом думаешь?",
      "Поняла тебя! 💃 Продолжаем?",
      "Записываю твои мысли! 🌟 Что ещё расскажешь?",
      "Любопытно! 💖 Хочешь обсудим это подробнее?",
      "Как увлекательно! ✨ Продолжаем наше путешествие в мир идей!",
      "Замечательно! 💫 Ты вдохновляешь меня на новые мысли!",
      "Прекрасная мысль! 🌟 Давай развивать её вместе!"
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
    if (!systemStatus) return { text: 'Проверяем...', color: 'bg-gray-400', tooltip: 'Проверяем доступность систем' };
    
    if (!systemStatus.server_available) {
      return { text: 'ЛОКАЛЬНЫЙ', color: 'bg-purple-500', tooltip: 'Работаем в оффлайн-режиме' };
    }
    
    // Проверяем все 5 систем
    if (systemStatus.turbo_api_available && systemStatus.gigachat_available && 
        systemStatus.fast_api_available && systemStatus.image_api_available) {
      return { text: 'ВСЕ СИСТЕМЫ', color: 'bg-green-500', tooltip: 'Все 5 систем доступны' };
    }
    
    if (systemStatus.turbo_api_available && systemStatus.gigachat_available) {
      return { text: 'ПРЕМИУМ', color: 'bg-blue-500', tooltip: 'Turbo + ULTRA доступны' }; // ОБНОВЛЕНО
    }
    
    if (systemStatus.fast_api_available) {
      return { text: 'ОСНОВНЫЕ', color: 'bg-yellow-500', tooltip: 'Основные системы работают' };
    }
    
    if (systemStatus.turbo_api_available) {
      return { text: 'ТУРБО', color: 'bg-orange-500', tooltip: 'Только турбо-режим доступен' };
    }
    
    if (systemStatus.gigachat_available) {
      return { text: 'ULTRA', color: 'bg-indigo-500', tooltip: 'Только ULTRA режим доступен' }; // ОБНОВЛЕНО
    }
    
    return { text: 'БАЗОВЫЙ', color: 'bg-red-500', tooltip: 'Только локальные ответы' };
  };

  const status = getSystemStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex flex-col safe-area-inset">
      {/* 🎪 Хедер с режимами */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-gray-200/50 p-3 sticky top-0 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto">
          {/* Первая строка: навигация и статус */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-1 hover:bg-gray-100 rounded-lg transition-colors no-underline text-gray-600">
                ←
              </Link>
              
              {/* 🔦 Сигнальная лампочка */}
              <div className="flex items-center gap-2" title={status.tooltip}>
                <div className={`w-2 h-2 rounded-full ${status.color} animate-pulse`}></div>
                <span className="text-xs font-medium text-gray-700">{status.text}</span>
              </div>
              
              {/* Бейдж версии */}
              <div className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-0.5 rounded-full">
                v3.0 ULTRA
              </div>
            </div>
            
            {/* 👤 Информация о пользователе */}
            {currentUser && (
              <div className="text-xs text-gray-600">
                {currentUser.username} {currentUser.emoji}
              </div>
            )}
            
            {/* 🎛️ Управление */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleExportHistory}
                className="px-2 py-1 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                title="Экспорт истории"
              >
                📋
              </button>

              {systemStatus?.server_available && (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-2 py-1 text-xs bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  {isAuthenticated ? '👤' : 'Войти'}
                </button>
              )}
              
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-xs"
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

          {/* Вторая строка: переключатель режимов (5 КНОПОК) */}
          <div className="flex justify-between gap-1">
            <button
              onClick={() => setCurrentMode('auto')}
              className={`flex-1 px-2 py-2 rounded-lg border transition-all text-xs ${
                currentMode === 'auto' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-md' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300'
              }`}
              title="Автоматический выбор лучшего режима"
            >
              <div className="flex flex-col items-center gap-0.5">
                <span>🤖</span>
                <span className="text-[10px]">Автомат</span>
              </div>
            </button>

            <button
              onClick={() => setCurrentMode('turbo')}
              className={`flex-1 px-2 py-2 rounded-lg border transition-all text-xs ${
                currentMode === 'turbo' 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent shadow-md' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'
              }`}
              disabled={!systemStatus?.turbo_api_available}
              title="Мощные и качественные ответы"
            >
              <div className="flex flex-col items-center gap-0.5">
                <span>🚀</span>
                <span className="text-[10px]">Турбо</span>
              </div>
            </button>

            {/* КНОПКА ULTRA (бывшая GigaChat) */}
            <button
              onClick={() => setCurrentMode('gigachat')}
              className={`flex-1 px-2 py-2 rounded-lg border transition-all text-xs ${
                currentMode === 'gigachat' 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-md' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}
              disabled={!systemStatus?.gigachat_available}
              title="ULTRA режим - максимальная мощность"
            >
              <div className="flex flex-col items-center gap-0.5">
                <span>🧠</span>
                <span className="text-[10px]">ULTRA</span> {/* ОБНОВЛЕНО */}
              </div>
            </button>

            <button
              onClick={() => setCurrentMode('fast')}
              className={`flex-1 px-2 py-2 rounded-lg border transition-all text-xs ${
                currentMode === 'fast' 
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white border-transparent shadow-md' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
              }`}
              disabled={!systemStatus?.fast_api_available}
              title="Быстрые и стабильные ответы"
            >
              <div className="flex flex-col items-center gap-0.5">
                <span>⚡</span>
                <span className="text-[10px]">Быстрый</span>
              </div>
            </button>

            <button
              onClick={() => setCurrentMode('creative')}
              className={`flex-1 px-2 py-2 rounded-lg border transition-all text-xs ${
                currentMode === 'creative' 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent shadow-md' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-pink-300'
              }`}
              disabled={!systemStatus?.image_api_available}
              title="Генерация изображений"
            >
              <div className="flex flex-col items-center gap-0.5">
                <span>🎨</span>
                <span className="text-[10px]">Творческий</span>
              </div>
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
                    {message.mode === 'turbo' && '🚀'}
                    {message.mode === 'gigachat' && '🧠'}
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
                    {getLoadingText(currentMode)}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 🎚️ Панель ввода */}
      <div className="bg-white/90 backdrop-blur-lg border-t border-gray-200/50 p-3 fixed bottom-0 left-0 right-0 safe-area-inset-bottom">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-100 rounded-xl border border-gray-200/50 focus-within:border-purple-400 transition-colors">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  currentMode === 'auto' ? "Спроси что угодно... 🤖" :
                  currentMode === 'turbo' ? "Задавай сложные вопросы... 🚀" :
                  currentMode === 'gigachat' ? "Обсудим умные темы... 🧠" :
                  currentMode === 'fast' ? "Быстро обсудим любую тему... ⚡" :
                  "Опиши что хочешь увидеть... 🎨"
                }
                className="w-full bg-transparent border-none resize-none py-3 px-3 focus:outline-none text-gray-800 placeholder-gray-500 text-sm"
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
              className={`px-4 py-3 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg active:scale-95 flex items-center justify-center min-w-[44px] ${
                currentMode === 'auto' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                currentMode === 'turbo' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                currentMode === 'gigachat' ? 'bg-gradient-to-r from-indigo-500 to-purple-500' :
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 safe-area-inset">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Вход в систему</h3>
            
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  placeholder="Введите имя пользователя"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-base"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleLogin}
                  disabled={!authUsername.trim() || authLoading}
                  className="flex-1 bg-purple-500 text-white py-3 rounded-lg font-medium disabled:opacity-50 text-base"
                >
                  {authLoading ? 'Вход...' : 'Войти'}
                </button>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-base"
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

      {/* Стили для безопасных зон iPhone */}
      <style jsx global>{`
        .safe-area-inset {
          padding-top: env(safe-area-inset-top);
        }
        .safe-area-inset-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
}
