'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [showLicensePanel, setShowLicensePanel] = useState(false);

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

          {/* Кнопки действий */}
          <div className="flex justify-center gap-4">
            <Link 
              href="/lounge"
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-all text-sm font-medium"
            >
              Исследовать
            </Link>
            <Link 
              href="/logbook"
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-full hover:opacity-90 transition-all text-sm font-medium"
            >
              БортЖурнал
            </Link>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200/50 p-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-sm text-gray-500 mb-2">
            sMeNa.Tv 2017~2025
          </div>
          <button 
            onClick={() => setShowLicensePanel(true)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Информация о лицензии
          </button>
        </div>
      </footer>

      {/* Выезжающая панель лицензии */}
      {showLicensePanel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4">
          <div className="bg-white rounded-t-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="p-6">
              {/* Заголовок и кнопка закрытия */}
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-medium text-gray-900">Лицензия и информация</h3>
                <button 
                  onClick={() => setShowLicensePanel(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Лицензия */}
              <div className="space-y-6">
                <div className="text-center">
                  <a 
                    rel="license" 
                    href="https://creativecommons.org/licenses/by-sa/4.0/deed.ru"
                    className="inline-block hover:opacity-80 transition-opacity mb-4"
                  >
                    <img 
                      alt="Лицензия Creative Commons" 
                      src="https://licensebuttons.net/l/by-sa/4.0/88x31.png" 
                    />
                  </a>
                </div>
                
                {/* Стихотворное форматирование */}
                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    sMeNa.Tv 2017~2025
                  </p>
                  
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>Материалы этого сайта</p>
                    <p>Распространяются свободно</p>
                    <p>По лицензии открытой</p>
                    <p>Creative Commons</p>
                  </div>

                  {/* Волшебный блок с градиентом */}
                  <div className="bg-gradient-to-br from-cyan-50 via-purple-50 to-pink-50 p-6 rounded-2xl border border-cyan-200/50 shadow-sm">
                    <p className="text-sm font-medium mb-3 bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                      Что это значит?
                    </p>
                    <div className="space-y-2 text-sm text-gray-700 text-center">
                      <p>Вы можете свободно использовать</p>
                      <p>Адаптировать и распространять</p>
                      <p>Материалы проекта при условии:</p>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-center">
                      <p className="text-cyan-700">✓ Указания авторства</p>
                      <p className="text-purple-700">✓ Распространения на тех же условиях</p>
                    </div>
                  </div>

                  {/* Заключительные строки */}
                  <div className="space-y-2 text-sm text-gray-600 pt-4">
                    <p>Делись творчеством свободно</p>
                    <p>И мир станет ярче вместе с нами</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Стили для анимации */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
