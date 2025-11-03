'use client';

import Link from 'next/link';

export default function Logbook() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
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
              href="/lounge" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Лаунж
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
            📖 БортЖурнал
          </h1>
          <p className="text-gray-600 text-lg">
            Хроники проекта sMeNa.Tv
          </p>
        </div>

        {/* Первая запись */}
        <article className="bg-white rounded-2xl border border-gray-200/50 p-8 shadow-sm max-w-2xl mx-auto">
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

        {/* Пустое пространство для будущих записей */}
        <div className="text-center mt-12">
          <div className="text-gray-400 text-sm">
            Следите за обновлениями... Скоро здесь появятся новые записи
          </div>
        </div>
      </main>
    </div>
  );
}
