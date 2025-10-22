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
    <div className="min-h-screen bg-[#0d0b14] flex items-center justify-center p-4 font-sans">
      <div className="text-center max-w-md w-full">
        
        {/* Логотип в стиле macOS */}
        <div className="w-20 h-20 mx-auto mb-8 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-white/10">
          <div className="text-xl font-bold text-white">S.TV</div>
        </div>

        {/* Заголовок с индивидуальными буквами */}
        <h1 className="text-4xl font-bold mb-6 text-white flex justify-center items-center gap-0.5">
          <span className="text-[95%] translate-y-[0.5px]">s</span>
          <span className="text-[102%] -translate-y-[0.5px]">M</span>
          <span className="text-[88%] translate-y-[1px] scale-95 opacity-90">e</span>
          <span className="text-[100%]">N</span>
          <span className="text-[105%] -translate-y-[1px] scale-103 font-medium">a</span>
          <span className="text-[85%] text-[#8a63d2] translate-y-[1.5px]">.</span>
          <span className="text-[95%] translate-y-[0.5px]">T</span>
          <span className="text-[100%]">v</span>
        </h1>

        {/* Подзаголовок */}
        <p className="text-xs text-gray-400 mb-12 tracking-widest uppercase font-medium">
          МЕНЯЙся К ЛУЧШЕМУ, А Мы...<br />А МЫ 🤗 С ТОБОЙ!
        </p>

        {/* Счетчик в твоём стиле */}
        <div className="grid grid-cols-4 gap-2 mb-12">
          {Object.entries(timeLeft).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-3 border border-white/10 transition-all duration-300 hover:bg-white/10">
                <div className="text-2xl font-mono font-bold text-white mb-1">
                  {value.toString().padStart(2, '0')}
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                  {key === 'days' ? 'дней' : 
                   key === 'hours' ? 'час' : 
                   key === 'minutes' ? 'мин' : 'сек'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Навигация */}
        <div className="flex gap-3 justify-center mb-8">
          <button className="bg-white/10 hover:bg-white/20 backdrop-blur-lg text-white px-6 py-2 rounded-xl border border-white/20 transition-all duration-300 text-sm font-medium">
            Гостиная
          </button>
          <button className="bg-[#8a63d2] hover:bg-[#7a53c2] text-white px-6 py-2 rounded-xl transition-all duration-300 text-sm font-medium">
            Мастерская
          </button>
        </div>

        {/* Статус бар */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400 font-medium tracking-widest">
            БЭтка №2.2 от 2025.10.22 🦊
          </span>
        </div>

      </div>
    </div>
  );
}
