// app/page.tsx - ЧИСТАЯ ВЕРСИЯ БЕЗ AI
'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-purple-100 flex flex-col">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">sMeNa.Tv 💜</h1>
          <nav className="flex gap-4">
            <Link 
              href="/lounge" 
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Гостиная Кули 💃
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Добро пожаловать в sMeNa.Tv! 🎬
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Народное телевидение, где каждый может стать создателем
          </p>
          <div className="space-y-4 text-gray-700">
            <p>✨ Прямые эфиры и интерактивные чаты</p>
            <p>🎨 Крутые коллаборации и творчество</p>
            <p>💫 Открытый микрофон для идей</p>
            <p className="text-lg font-semibold mt-6">
              Запуск 4 ноября 2025 года!
            </p>
          </div>
          
          <div className="mt-12">
            <Link 
              href="/lounge"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl text-lg font-semibold hover:shadow-xl transition-all hover:scale-105"
            >
              💬 Пообщаться с Кулей
              <span className="text-xl">→</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200 p-6 text-center text-gray-600">
        <p>sMeNa.Tv © 2025 - Твоя платформа для творчества и общения</p>
      </footer>
    </div>
  );
}
