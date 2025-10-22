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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl w-full">
        {/* Логотип */}
        <div className="w-24 h-24 mx-auto mb-8 bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 flex items-center justify-center cursor-pointer">
          <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            S.TV
          </div>
        </div>

        {/* Заголовок */}
        <h1 className="text-6xl font-bold mb-6 text-white">
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            sMeNa
          </span>
          <span className="text-white">.Tv</span>
        </h1>

        {/* Подзаголовок */}
        <p className="text-xl text-gray-300 mb-12 tracking-widest uppercase">
          ~ это ты
        </p>

        {/* Счетчик */}
        <div className="grid grid-cols-4 gap-4 max-w-md mx-auto mb-12">
          {Object.entries(timeLeft).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                <div className="text-3xl font-mono font-bold text-white">
                  {value.toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-400 uppercase mt-2 tracking-widest">
                  {key === 'days' ? 'дней' : 
                   key === 'hours' ? 'час' : 
                   key === 'minutes' ? 'мин' : 'сек'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Навигация */}
        <div className="flex gap-4 justify-center">
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-lg text-white px-8 py-3 rounded-2xl border border-white/30 transition-all duration-300">
            Гостиная
          </button>
          <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 rounded-2xl transition-all duration-300">
            Мастерская
          </button>
        </div>

        {/* Статус */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>БЭтка №2.0 от 2025.10.22 🦊</span>
        </div>
      </div>
    </div>
  );
}
