// app/page.tsx - УЛУЧШЕННЫЙ APPLE-STYLE DESIGN
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [visitors, setVisitors] = useState(0);

  useEffect(() => {
    // Счётчик до 4 ноября 2025
    const launchDate = new Date('2025-11-04T00:00:00').getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate - now;
      
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    // Имитация счётчика посещений
    setVisitors(1247 + Math.floor(Math.random() * 100));

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/images/logo.png" 
              alt="sMeNa.Tv" 
              className="w-8 h-8"
              onError={(e) => {
                // Fallback если лого не загрузится
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <div 
              className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg hidden"
              style={{ display: 'none' }}
            ></div>
            <span className="text-xl font-semibold text-gray-900">sMeNa.Tv</span>
          </div>
          
          <nav className="flex gap-6">
            <Link 
              href="/lounge" 
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              Гостиная
            </Link>
          </nav>
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
              А мы...А МЫ с тобой?!
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="mb-16">
            <div className="text-sm text-gray-500 uppercase tracking-wider mb-6">
              До запуска осталось
            </div>
            <div className="flex justify-center gap-8 md:gap-12">
              {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="text-center">
                  <div className="text-3xl md:text-4xl font-light text-gray-900 mb-2">
                    {value.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">
                    {unit === 'days' ? 'дней' : 
                     unit === 'hours' ? 'часов' : 
                     unit === 'minutes' ? 'минут' : 'секунд'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center">
            <Link 
              href="/lounge"
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-all text-sm font-medium"
            >
              Исследовать
            </Link>
            <button className="px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all text-sm font-medium">
              Узнать больше
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200/50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                <img 
                  src="/images/logo.png" 
                  alt="sMeNa.Tv" 
                  className="w-6 h-6"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <div 
                  className="w-6 h-6 bg-gradient-to-r from-purple-500 to-cyan-500 rounded hidden"
                  style={{ display: 'none' }}
                ></div>
                <span className="font-semibold text-gray-900">sMeNa.Tv</span>
              </div>
            </div>
            
            {/* Visitors Counter */}
            <div className="text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Посетителей сегодня
              </div>
              <div className="text-2xl font-light text-gray-900">
                {visitors.toLocaleString()}
              </div>
            </div>
            
            <div className="text-center md:text-right">
              {/* Оставлено пустое место для будущих элементов */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
