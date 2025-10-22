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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 flex items-center justify-center p-6 font-sans select-none">
      
      {/* Фоновые световые эффекты */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-500"></div>
      </div>

      <div className="text-center w-full max-w-sm relative z-10">
        
        {/* Логотип-леденец */}
        <div className="w-20 h-20 mx-auto mb-8 bg-white/80 backdrop-blur-lg rounded-3xl border border-white/60 shadow-2xl flex items-center justify-center cursor-pointer transition-all duration-500 hover:scale-110 hover:rotate-6">
          <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
            S
          </div>
          {/* Блики на логотипе */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-3xl pointer-events-none"></div>
        </div>

        {/* Заголовок с лёгкой тенью */}
        <h1 className="text-4xl font-bold mb-6 text-gray-800 tracking-tight drop-shadow-sm">
          <span className="bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
            sMeNa
          </span>
          <span className="text-gray-700">.Tv</span>
        </h1>

        {/* Подзаголовок */}
        <p className="text-sm text-gray-500 mb-12 tracking-wider uppercase font-light leading-relaxed">
          МЕНЯЙся К ЛУЧШЕМУ, А Мы...<br />А МЫ 🤗 С ТОБОЙ!
        </p>

        {/* Счетчик с прозрачными карточками */}
        <div className="flex justify-center items-center gap-2 mb-12">
          {Object.entries(timeLeft).map(([key, value], index) => (
            <div key={key} className="flex items-center">
              <div className="text-center">
                <div className="bg-white/70 backdrop-blur-md rounded-2xl px-3 py-4 border border-white/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-white/80">
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

        {/* Кнопки-леденцы с 3D эффектом */}
        <div className="flex gap-4 justify-center mb-8">
          {/* Кнопка Гостиная */}
          <button className="relative bg-white/80 backdrop-blur-lg text-gray-700 px-8 py-4 rounded-2xl border border-white/60 shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:bg-white/90 group overflow-hidden">
            
            {/* Преломление света внутри кнопки */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-transparent to-purple-400/20 rounded-2xl"></div>
            
            {/* Блики */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/50 to-transparent rounded-t-2xl"></div>
            
            <span className="relative z-10 font-medium tracking-wide">Гостиная</span>
            
            {/* Цветное отражение снизу */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-60 group-hover:opacity-80 transition-opacity"></div>
          </button>

          {/* Кнопка Мастерская */}
          <button className="relative bg-gradient-to-r from-cyan-400 to-purple-400 text-white px-8 py-4 rounded-2xl border border-white/40 shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:from-cyan-500 hover:to-purple-500 group overflow-hidden">
            
            {/* Блики на цветной кнопке */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl"></div>
            
            <span className="relative z-10 font-medium tracking-wide">Мастерская</span>
            
            {/* Тень преломления */}
            <div className="absolute bottom-0 left-0 w-full h-2 bg-white/20 rounded-b-2xl group-hover:bg-white/30 transition-all"></div>
          </button>
        </div>

        {/* Статус бар */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse shadow-sm"></div>
          <span className="text-xs text-gray-400 tracking-widest font-light">
            БЭтка №2.3 от 2025.10.22
          </span>
        </div>

      </div>
    </div>
  );
}
