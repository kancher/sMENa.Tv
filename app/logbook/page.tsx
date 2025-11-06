'use client';

import Link from 'next/link';

export default function Logbook() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 safe-area-inset">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg"></div>
            <div className="text-sm text-gray-600 font-light group-hover:text-gray-900 transition-colors">
              sMeNa.Tv ~ Это Ты!
            </div>
          </Link>
          <nav className="flex gap-4">
            <Link 
              href="/" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Главная
            </Link>
            <Link 
              href="/kulya2" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Куля 2.0
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
            📖 БортЖурнал
          </h1>
          <p className="text-gray-600 text-lg">
            Хроники проекта sMeNa.Tv
          </p>
        </div>

        <div className="space-y-8">
          {/* Запись от 6 ноября 2025 - Куля 2.0 */}
          <article className="bg-white rounded-2xl border border-gray-200/50 p-6 md:p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-2">
                ЗАПУСК КУЛИ 2.0!
              </h2>
              <time className="text-gray-500 text-sm">
                6 ноября 2025 • 20:30
              </time>
            </div>
            
            <div className="prose prose-gray max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-6 text-center">
                Исторический день! После интенсивной разработки представляем совершенно новую версию Кули - умного AI-помощника проекта sMeNa.Tv!
              </p>

              {/* Возможности Кули 2.0 */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200/50">
                  <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <span>🤖</span>
                    Умные режимы
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      <span><strong>Автомат</strong> - интеллектуальный выбор</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      <span><strong>Турбо</strong> - мощные ответы через Mistral AI</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span><strong>Быстрый</strong> - стабильные ответы</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                      <span><strong>Творческий</strong> - генерация изображений</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-xl border border-cyan-200/50">
                  <h3 className="font-semibold text-cyan-900 mb-3 flex items-center gap-2">
                    <span>🛡️</span>
                    Технологии и безопасность
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                      <span><strong>Proxy Worker</strong> - защищённые API ключи</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span><strong>Fallback система</strong> - работа без интернета</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span><strong>Telegram логи</strong> - мониторинг диалогов</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      <span><strong>Адаптивный дизайн</strong> - для всех устройств</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Достижения */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200/50 mb-6">
                <h3 className="font-semibold text-orange-900 mb-4 text-center flex items-center justify-center gap-2">
                  <span>🎯</span>
                  Ключевые достижения
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-orange-600">4</div>
                    <div className="text-xs text-orange-700">режима работы</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">100%</div>
                    <div className="text-xs text-orange-700">адаптивность</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">∞</div>
                    <div className="text-xs text-orange-700">локальная история</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">🛡️</div>
                    <div className="text-xs text-orange-700">безопасность</div>
                  </div>
                </div>
              </div>

              <div className="text-center bg-white border border-gray-200/50 rounded-2xl p-6">
                <p className="text-gray-700 font-medium mb-2">
                  🎉 Куля 2.0 готова к общению!
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Протестируйте все возможности нашего нового AI-помощника
                </p>
                <Link 
                  href="/kulya2"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:opacity-90 transition-all text-sm font-medium shadow-lg hover:shadow-xl"
                >
                  Перейти к Куле 2.0
                  <span>✨</span>
                </Link>
              </div>
            </div>
          </article>

          {/* Первая запись от 4 ноября */}
          <article className="bg-white rounded-2xl border border-gray-200/50 p-6 md:p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-2">
                ПРОЕКТ ЗАПУЩЕН!
              </h2>
              <time className="text-gray-500 text-sm">
                4 ноября 2025
              </time>
            </div>
            
            <div className="prose prose-gray max-w-none text-center">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Исторический день! После долгой подготовки и разработки проект sMeNa.Tv официально открыт для всех.
              </p>
              
              <div className="bg-gradient-to-r from-purple-50 to-cyan-50 p-6 rounded-xl border border-purple-200/50">
                <p className="text-gray-700 font-medium mb-2">
                  Спасибо, что вы с нами!
                </p>
                <p className="text-sm text-gray-600">
                  Этот проект создаётся сообществом и для сообщества. 
                  Каждый из вас — важная часть нашей истории.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200/50">
                <p className="text-sm text-gray-500">
                  sMeNa.Tv 2017~2025 • Начало большого пути
                </p>
              </div>
            </div>
          </article>
        </div>

        {/* Индикатор продолжения */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            <span>Продолжение следует...</span>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </main>

      {/* Стили для безопасных зон */}
      <style jsx global>{`
        .safe-area-inset {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
}
