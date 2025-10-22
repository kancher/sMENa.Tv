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
    <div className="min-h-screen bg-[#0d0b14] flex items-center justify-center p-6 font-sans select-none">
      <div className="text-center w-full max-w-sm">
        
        {/* Логотип в стеклянном стиле */}
        <div className="w-16 h-16 mx-auto mb-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl">
          <div className="text-lg font-semibold text-white/90">S</div>
        </div>

        {/* Заголовок sMeNa.Tv с акцентной точкой */}
        <h1 className="text-3xl font-bold mb-4 text-white/95 tracking-tight">
          <span className="font-light">s</span>
          <span className="font-medium">M</span>
          <span className="font-light">e</span>
          <span className="font-normal">N</span>
          <span className="font-medium">a</span>
          <span className="text-[#8a63d2] mx-0.5">.</span>
          <span className="font-normal">T</span>
          <span className="font-light">v</span>
        </h1>

        {/* Подзаголовок */}
        <p className="text-[11px] text-white/40 mb-8 tracking-[0.2em] uppercase font-light leading-relaxed">
          МЕНЯЙся К ЛУЧШЕМУ, А Мы...<br />А МЫ 🤗 С ТОБОЙ!
        </p>

        {/* Минималистичный счетчик */}
        <div className="flex justify-center items-center gap-1 mb-8">
          {Object.entries(timeLeft).map(([key, value], index) => (
            <div key={key} className="flex items-center">
              <div className="text-center">
                <div className="bg-white/3 backdrop-blur-lg rounded-lg px-3 py-2 border border-white/8 min-w-[50px]">
                  <div className="text-lg font-mono font-medium text-white/95 tabular-nums">
                    {value.toString().padStart(2, '0')}
                  </div>
                  <div className="text-[9px] text-white/30 uppercase tracking-[0.15em] mt-0.5 font-light">
                    {key === 'days' ? 'дней' : 
                     key === 'hours' ? 'час' : 
                     key === 'minutes' ? 'мин' : 'сек'}
                  </div>
                </div>
              </div>
              {index < 3 && (
                <div className="text-white/20 mx-1 text-sm font-light">:</div>
              )}
            </div>
          ))}
        </div>

        {/* Кнопки навигации */}
        <div className="flex gap-3 justify-center mb-6">
          <button className="bg-white/8 hover:bg-white/12 backdrop-blur-lg text-white/80 px-5 py-2 rounded-xl border border-white/15 transition-all duration-200 text-[13px] font-normal tracking-wide">
            Гостиная
          </button>
          <button className="bg-[#8a63d2] hover:bg-[#7b54c6] text-white px-5 py-2 rounded-xl transition-all duration-200 text-[13px] font-normal tracking-wide shadow-lg">
            Мастерская
          </button>
        </div>

        {/* Статус бар */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
          <span className="text-[10px] text-white/30 tracking-[0.1em] uppercase font-light">
            БЭтка №2.2.1 от 2025.10.22
          </span>
        </div>

      </div>
    </div>
  );
}
