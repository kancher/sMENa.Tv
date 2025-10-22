'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date('2025-11-04').getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center p-6 font-sans select-none">
      
      <div className="text-center w-full max-w-sm">
        
        {/* Логотип */}
        <div className="w-20 h-20 mx-auto mb-8 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-xl">
          {/* Проверяем наличие логотипа */}
          <img 
            src="/images/logo.png" 
            alt="sMeNa.Tv" 
            className="w-12 h-12 object-contain"
            onError={(e) => {
              // Если картинка не загрузилась, показываем текстовый логотип
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling && ((e.currentTarget.nextSibling as HTMLElement).style.display = 'block');
            }}
          />
          <div className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent hidden">
            S
          </div>
        </div>

        {/* Заголовок */}
        <h1 className="text-4xl font-bold mb-6 text-gray-800 tracking-tight">
          <span className="bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
            sMeNa
          </span>
          <span className="text-gray-700">.Tv</span>
        </h1>

        {/* Подзаголовок */}
        <p className="text-sm text-gray-500 mb-12 tracking-wider uppercase font-light leading-relaxed">
          МЕНЯЙся К ЛУЧШЕМУ, А Мы...<br />А МЫ 🤗 С ТОБОЙ!
        </p>

        {/* Счетчик */}
        <div className="flex justify-center items-center gap-2 mb-12">
          {Object.entries(timeLeft).map(([key, value], index) => (
            <div key={key} className="flex items-center">
              <div className="text-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl px-3 py-4 border border-gray-200 shadow-md transition-all duration-300 hover:shadow-lg">
                  <div className="text-2xl font-mono font-semibold text-gray-800 tabular-nums mb-1">
                    {value.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest font-medium">
                    {key === 'days' ? 'дней' : 
                     key === 'hours' ? 'час' : 
                     key === 'minutes' ? 'мин' : 'сек'}
                  </div>
                </div>
              </div>
              {index < 3 && (
                <div className="text-gray-300 mx-1 text-lg font-light">:</div>
              )}
            </div>
          ))}
        </div>

        {/* Простые но стильные кнопки */}
        <div className="flex gap-4 justify-center mb-8">
          <button className="bg-white/90 text-gray-700 px-8 py-3 rounded-xl border border-gray-300 shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-white hover:-translate-y-0.5 font-medium">
            Гостиная
          </button>
          <button className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-3 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 font-medium">
            Мастерская
          </button>
        </div>

        {/* Статус бар */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400 tracking-widest font-light">
            БЭтка №3.1 от 2025.10.22
          </span>
        </div>

      </div>
    </div>
  );
}
