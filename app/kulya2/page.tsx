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

  // При загрузке проверяем аутентификацию
  useEffect(() => {
    const token = localStorage.getItem('kulya_token');
    if (token) {
      checkAuth(token);
    } else {
      setShowAuthModal(true);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        setShowAuthModal(true);
      }
    } catch (error) {
      localStorage.removeItem('kulya_token');
      setShowAuthModal(true);
    }
  };

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
      } else {
        alert(data.error || 'Ошибка аутентификации');
      }
    } catch (error) {
      alert('Ошибка подключения к серверу');
    } finally {
      setAuthLoading(false);
    }
  };

  const addWelcomeMessage = (user: User) => {
    const welcomeMessage: Message = {
      id: 'welcome',
      text: `Привет! Я Куля 💃 Рада тебя видеть, ${user.username} ${user.emoji}! Выбери режим общения!`,
      isUser: false,
      timestamp: new Date(),
      mode: 'common',
      user: user
    };
    setMessages([welcomeMessage]);
  };

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

  const handleLogout = () => {
    localStorage.removeItem('kulya_token');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setMessages([]);
    setShowAuthModal(true);
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: `Чат очищен! Выбери режим и погнали, ${currentUser?.username} ${currentUser?.emoji}! 💫`,
        isUser: false,
        timestamp: new Date(),
        mode: currentMode,
        user: currentUser
      }
    ]);
  };

  // ... остальные функции (getStatusColor, getStatusText и т.д.)

  // Модальное окно аутентификации
  if (showAuthModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">💃</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Куля 4.0</h1>
            <p className="text-gray-600 mt-2">Представьтесь для доступа к чату</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)}
                placeholder="Введите ваше имя..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            
            <button
              onClick={handleLogin}
              disabled={!authUsername.trim() || authLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium disabled:opacity-50 transition-all hover:shadow-lg"
            >
              {authLoading ? 'Вход...' : 'Войти в чат'}
            </button>
            
            <div className="text-center text-sm text-gray-500">
              Примеры: Kancher, Creator1, Moderator1, User1
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Основной интерфейс чата
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-cyan-50 flex flex-col">
      {/* Хедер с информацией о пользователе */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors no-underline text-gray-600">
              ← На главную
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">💃</span>
              </div>
              <div>
                <h1 className="text-lg font-medium text-gray-900">Куля 4.0</h1>
                <p className="text-xs text-gray-500">
                  {currentUser?.username} {currentUser?.emoji} • {currentUser?.role}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Выйти
            </button>
            {/* ... остальные кнопки */}
          </div>
        </div>
      </header>

      {/* Остальной интерфейс аналогично предыдущей версии, но с учётом currentUser */}
      {/* ... */}
    </div>
  );
}
