'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [showLicensePanel, setShowLicensePanel] = useState(false);
  const [showKulyaMenu, setShowKulyaMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Переключение меню
  const toggleMenu = () => {
    setShowKulyaMenu(!showKulyaMenu);
  };

  // Закрытие меню при выборе пункта
  const handleMenuSelect = () => {
    setShowKulyaMenu(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex flex-col safe-area-inset">
      {/* Header - Centered Logo */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-6 sticky top-0 z-40">
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
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-4xl w-full">
          {/* Main Slogan */}
          <div className="mb-12 md:mb-16">
            <h1 className="text-4xl md:text-7xl font-light text-gray-900 mb-4 md:mb-6 leading-tight">
              МЕНЯЙся
              <br />
              к <span className="bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">ЛУЧшему</span>,
            </h1>
            <div className="text-xl md:text-3xl text-gray-600 font-light">
              А мы...А МЫ с тобой!
            </div>
          </div>

          {/* Компактная кнопка с меню */}
          <div className="relative inline-block">
            {/* Основная кнопка */}
            <button 
              onClick={toggleMenu}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:opacity-90 transition-all text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 min-h-[48px] flex items-center gap-2"
            >
              <span>Исследовать</span>
              <span className="text-xs transition-transform duration-200">
                {showKulyaMenu ? '▲' : '▼'}
              </span>
            </button>

            {/* Десктопное меню (выпадающее) */}
            {!isMobile && showKulyaMenu && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200/50 backdrop-blur-sm z-50 animate-fade-in">
                <div className="p-2 space-y-1">
                  <Link 
                    href="/lounge"
                    onClick={handleMenuSelect}
                    className="flex items-center gap-3 w-full px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">Куля 1.0</div>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded group-hover:bg-gray-200">Классика</span>
                  </Link>
                  
                  <div className="h-px bg-gray-200/50 mx-2"></div>
                  
                  <Link 
                    href="/kulya2"
                    onClick={handleMenuSelect}
                    className="flex items-center gap-3 w-full px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">Куля 2.0</div>
                    </div>
                    <span className="text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white px-1.5 py-0.5 rounded">NEW</span>
                  </Link>
                  
                  <div className="h-px bg-gray-200/50 mx-2"></div>
                  
                  <Link 
                    href="/logbook"
                    onClick={handleMenuSelect}
                    className="flex items-center gap-3 w-full px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">БортЖурнал</div>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Мобильное меню (выезжающее снизу) */}
          {isMobile && showKulyaMenu && (
            <div className="fixed inset-0 z-50">
              {/* Overlay */}
              <div 
                className="absolute inset-0 bg-black/50"
                onClick={toggleMenu}
              />
              
              {/* Меню */}
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl animate-slide-up">
                <div className="p-4">
                  {/* Заголовок и кнопка закрытия */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Выберите раздел</h3>
                    <button 
                      onClick={toggleMenu}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Пункты меню */}
                  <div className="space-y-2">
                    <Link 
                      href="/lounge"
                      onClick={handleMenuSelect}
                      className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors active:bg-gray-100 border border-gray-200/50"
                    >
                      <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">Куля 1.0</div>
                        <div className="text-xs text-gray-400">Классическая версия</div>
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Классика</span>
                    </Link>
                    
                    <Link 
                      href="/kulya2"
                      onClick={handleMenuSelect}
                      className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors active:bg-gray-100 border border-gray-200/50"
                    >
                      <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">Куля 2.0</div>
                        <div className="text-xs text-gray-400">Умный AI-помощник</div>
                      </div>
                      <span className="text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-1 rounded">NEW</span>
                    </Link>
                    
                    <Link 
                      href="/logbook"
                      onClick={handleMenuSelect}
                      className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors active:bg-gray-100 border border-gray-200/50"
                    >
                      <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">БортЖурнал</div>
                        <div className="text-xs text-gray-400">Хроники проекта</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200/50 p-6 md:p-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-sm text-gray-500 mb-2">
            sMeNa.Tv 2017~2025
          </div>
          <button 
            onClick={() => setShowLicensePanel(true)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors active:text-gray-700"
          >
            Информация о лицензии
          </button>
        </div>
      </footer>

      {/* Выезжающая панель лицензии */}
      {showLicensePanel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4 safe-area-inset">
          <div className="bg-white rounded-t-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="p-6">
              {/* Заголовок и кнопка закрытия */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Лицензия Creative Commons</h3>
                <button 
                  onClick={() => setShowLicensePanel(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-xl p-2 active:bg-gray-100 rounded-lg"
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
                    className="inline-block hover:opacity-80 transition-opacity mb-4 active:opacity-70"
                  >
                    <img 
                      alt="Лицензия Creative Commons" 
                      src="https://licensebuttons.net/l/by-sa/4.0/88x31.png" 
                      className="h-8 w-auto"
                    />
                  </a>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="space-y-3 text-sm text-gray-700">
                    <p><strong>sMeNa.Tv 2017~2025</strong></p>
                    <p>Город-Герой Севастополь</p>
                    <p>Республика Крым</p>
                    <p>Российская Федерация</p>
                  </div>

                  <div className="bg-gradient-to-br from-cyan-50 via-purple-50 to-pink-50 p-4 md:p-6 rounded-2xl border border-cyan-200/50 shadow-sm">
                    <p className="text-sm font-medium mb-3 bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                      Creative Commons Attribution-ShareAlike 4.0
                    </p>
                    <div className="space-y-3 text-sm text-gray-700 text-left">
                      <p className="text-green-600 flex items-start gap-2">
                        <span>✅</span>
                        <span><strong>Можно:</strong> использовать, адаптировать, распространять</span>
                      </p>
                      <p className="text-green-600 flex items-start gap-2">
                        <span>✅</span>
                        <span><strong>Можно:</strong> даже в коммерческих целях</span>
                      </p>
                      <p className="text-blue-600 flex items-start gap-2">
                        <span>📝</span>
                        <span><strong>Условие:</strong> указание авторства (ссылка на sMeNa.Tv)</span>
                      </p>
                      <p className="text-blue-600 flex items-start gap-2">
                        <span>🔄</span>
                        <span><strong>Условие:</strong> распространение на тех же условиях</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 pt-4 space-y-2">
                    <p>Материалы созданы человеком и ИИ в со-творчестве</p>
                    <p>Лицензия гарантирует свободу использования и развития</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Стили для анимации */}
      <style jsx global>{`
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
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, -5px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .safe-area-inset {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
}
