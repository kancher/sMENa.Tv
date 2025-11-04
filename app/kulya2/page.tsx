'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

// В начало файла, после импортов
useEffect(() => {
  // Просто проверяем связь
  fetch('http://194.87.57.198:5000/')
    .then(response => response.json())
    .then(data => console.log('Куля отвечает:', data))
    .catch(error => console.error('Ошибка связи:', error));
}, []);

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isError?: boolean;
};

export default function Kulya2() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Привет! Я Куля 2.0 💫\nТеперь я живу на нашем сервере и помню все наши разговоры!',
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
      // Отправляем на НАШ сервер!
      const response = await fetch('http://194.87.57.198:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText,
          history: messages.slice(-10) // Последние 10 сообщений
        })
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.kulya_response || data.reply || 'Ой, что-то пошло не так...',
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '⚠️ Сервер временно недоступен. Проверь подключение!',
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
                <p className="text-xs text-gray-500">Живу на нашем сервере 💾</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full">
              ✅ Сервер активен
            </div>
          </div>
        </div>
      </header>

      {/* ОСТАЛЬНОЙ КОД АНАЛОГИЧЕН КУЛЕ 1.0, 
          но с другим градиентом и текстами */}
      
      {/* ... */}
    </div>
  );
}
