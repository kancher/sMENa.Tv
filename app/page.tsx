'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [visitors, setVisitors] = useState(12547); // Стартовое значение для демонстрации
  const [online, setOnline] = useState(42); // Стартовое значение онлайн

  useEffect(() => {
    // Простая симуляция живых данных
    const interval = setInterval(() => {
      setVisitors(prev => prev + Math.floor(Math.random() * 3));
      setOnline(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(15, prev + change);
      });
    }, 30000); // Обновление каждые 30 секунд

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex flex-col">
      {/* Header - Centered Logo */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              <img 
                src="/images/logo.png" 
                alt="sMeNa.Tv" 
                className="w-8 h-8"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <div 
                className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg hidden"
                style={{ display: 'none' }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 font-light">
              sMeNa.Tv ~ Это Ты!
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-4xl">
          {/* Main Slogan */}
          <div className="mb-16">
            <h1 className="text-5xl md:text-7xl font-light text-gray-900 mb-6 leading-tight">
              МЕНЯЙся
              <br />
              к <span className="bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">ЛУЧшему</span>,
            </h1>
            <div className="text-2xl md:text-3xl text-gray-600 font-light">
              А мы...А МЫ с тобой!
            </div>
          </div>

          {/* Launch Celebration */}
          <div className="mb-16">
            <div className="text-sm text-gray-500 uppercase tracking-wider mb-4">
              🎉 Проект запущен!
            </div>
            <div className="text-lg text-gray-700 font-light">
              4 ноября 2025 • Спасибо, что вы с нами
            </div>
          </div>

          {/* 🔥 КОМПАКТНАЯ СТАТИСТИКА */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 px-4 py-2 shadow-sm">
              {/* Основной счётчик */}
              <div className="text-center">
                <div className="text-lg font-medium text-gray-900">
                  {visitors.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">посетителей</div>
              </div>

              {/* Разделитель */}
              <div className="w-px h-6 bg-gray-200"></div>

              {/* Онлайн */}
              <div className="text-center">
                <div className="text-sm font-medium text-blue-600 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  {online}
                </div>
                <div className="text-xs text-gray-500">онлайн</div>
              </div>
            </div>
          </div>

          {/* Single CTA Button */}
          <div className="flex justify-center">
            <Link 
              href="/lounge"
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-all text-sm font-medium"
            >
              Исследовать
            </Link>
          </div>
        </div>
      </main>

      {/* Footer with License */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200/50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Лицензия Creative Commons */}
          <div className="mb-4">
            <a 
              rel="license" 
              href="https://creativecommons.org/licenses/by-sa/4.0/deed.ru"
              className="inline-block hover:opacity-80 transition-opacity"
            >
              <img 
                alt="Лицензия Creative Commons" 
                style={{ borderWidth: 0 }} 
                src="https://licensebuttons.net/l/by-sa/4.0/88x31.png" 
              />
            </a>
          </div>
          
          <div className="text-xs text-gray-600 max-w-2xl mx-auto leading-relaxed">
            <p>
              Материалы сайта <a href="https://sMeNa.Tv" className="text-purple-600 hover:text-purple-800">sMeNa.Tv</a>, 
              если не указано иное, распространяются по лицензии{' '}
              <a 
                rel="license" 
                href="https://creativecommons.org/licenses/by-sa/4.0/deed.ru"
                className="text-purple-600 hover:text-purple-800"
              >
                Creative Commons «Attribution-ShareAlike» 4.0 Всемирная
              </a>.
            </p>
            <p className="mt-2 text-gray-500">
              Вы можете свободно делиться и адаптировать материалы, при условии указания авторства 
              и лицензирования производных работ на тех же условиях.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
