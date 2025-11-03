'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [visitors, setVisitors] = useState(12547);
  const [online, setOnline] = useState(42);
  const [showLicensePanel, setShowLicensePanel] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisitors(prev => prev + Math.floor(Math.random() * 3));
      setOnline(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(15, prev + change);
      });
    }, 30000);

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

            {/* Предупреждение о тестовых данных */}
            <div className="mt-3 text-center">
              <div className="text-xs text-orange-600 bg-orange-50 inline-block px-2 py-1 rounded">
                ⚠️ Счётчик в тестовом режиме • Данные не настоящие
              </div>
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
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Лицензия и статистика</h3>
                <button 
                  onClick={() => setShowLicensePanel(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Счётчики */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {visitors.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">всего посещений</div>
                </div>
                <div className="text-center text-xs text-orange-600">
                  ⚠️ Тестовый режим • Данные демонстрационные
                </div>
              </div>

              {/* Лицензия */}
              <div className="space-y-4">
                <div className="text-center">
                  <a 
                    rel="license" 
                    href="https://creativecommons.org/licenses/by-sa/4.0/deed.ru"
                    className="inline-block hover:opacity-80 transition-opacity mb-2"
                  >
                    <img 
                      alt="Лицензия Creative Commons" 
                      src="https://licensebuttons.net/l/by-sa/4.0/88x31.png" 
                    />
                  </a>
                </div>
                
                <div className="text-sm text-gray-700 leading-relaxed space-y-3">
                  <p>
                    <strong>sMeNa.Tv 2017~2025</strong> • Открытый проект сообщества
                  </p>
                  
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

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      <strong>Что это значит?</strong> Вы можете свободно использовать, 
                      адаптировать и распространять материалы проекта при условии:
                    </p>
                    <ul className="text-blue-700 text-sm mt-2 space-y-1 list-disc list-inside">
                      <li><strong>Указания авторства</strong> (ссылка на sMeNa.Tv)</li>
                      <li><strong>Распространения на тех же условиях</strong> (лицензия CC BY-SA)</li>
                    </ul>
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
