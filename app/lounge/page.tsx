'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

type ChatMode = 'code' | 'chat';

export default function Lounge() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Привет! Я Алиса - твой AI-помощник. Выбери режим общения выше!',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('chat');
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

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Это ответ в режиме ${chatMode === 'code' ? 'программирования' : 'общения'}. В реальной версии здесь будет ответ от AI!`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex flex-col">
      
      {/* Шапка */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors no-underline text-gray-700"
            >
              ← Назад
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">Гостиная</h1>
          </div>
          
          {/* Переключатель режимов */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChatMode('chat')}
              className={`px-4 py-2 rounded-md transition-all ${
                chatMode === 'chat' 
                  ? 'bg-white shadow-sm text-gray-800' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              💬 Общение
            </button>
            <button
              onClick={() => setChatMode('code')}
              className={`px-4 py-2 rounded-md transition-all ${
                chatMode === 'code' 
                  ? 'bg-white shadow-sm text-gray-800' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              💻 Код
            </button>
          </div>
        </div>
      </header>

      {/* Область сообщений */}
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
                    : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.text}</div>
                <div
                  className={`text-xs mt-2 ${
                    message.isUser ? 'text-cyan-100' : 'text-gray-400'
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
          
          {/* Индикатор загрузки */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Поле ввода */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 bg-gray-100 rounded-2xl border border-gray-200 focus-within:border-cyan-500 transition-colors">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  chatMode === 'code' 
                    ? 'Задай вопрос по программированию...' 
                    : 'Напиши сообщение...'
                }
                className="w-full bg-transparent border-none resize-none py-3 px-4 focus:outline-none text-gray-800 placeholder-gray-500"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg active:scale-95"
            >
              Отправить
            </button>
          </div>
          
          {/* Подсказка режима */}
          <div className="text-center mt-3">
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {chatMode === 'code' ? '💻 Режим программирования' : '💬 Режим общения'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
