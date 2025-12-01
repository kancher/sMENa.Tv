'use client';

import { useEffect, useState } from 'react';
import NativePlayer from './components/NativePlayer';
import VideoJSPlayer from './components/VideoJSPlayer';
import ClapprPlayer from './components/ClapprPlayer';
import PlyrPlayer from './components/PlyrPlayer';
import JWPlayer from './components/JWPlayer';

const STREAM_URL = 'https://live.kancher.ru/stream/stream.m3u8';

export default function StreamPage() {
  const [activeTab, setActiveTab] = useState('native');
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStream = async () => {
      try {
        const response = await fetch(STREAM_URL, { method: 'HEAD' });
        setIsLive(response.ok);
      } catch {
        setIsLive(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkStream();
    const interval = setInterval(checkStream, 10000);
    return () => clearInterval(interval);
  }, []);

  const players = {
    native: {
      name: 'HLS.js',
      description: 'Нативный HLS плеер - стабильный и быстрый',
      pros: ['🚀 Высокая скорость', '🔧 Простая настройка', '📱 Отличная совместимость'],
      cons: ['⚡ Базовый функционал', '🎨 Простой дизайн']
    },
    videojs: {
      name: 'Video.js',
      description: 'Профессиональный плеер с плагинами',
      pros: ['🎬 Качественное воспроизведение', '🔧 Много плагинов', '📊 Расширенная статистика'],
      cons: ['📦 Большой размер', '🎯 Сложнее настройка']
    },
    clappr: {
      name: 'Clappr',
      description: 'Современный плеер с поддержкой чата',
      pros: ['💬 Встроенный чат', '🎨 Современный UI', '📱 Адаптивный дизайн'],
      cons: ['⚠️ Меньше документации', '🔧 Ограниченные настройки']
    },
    plyr: {
      name: 'Plyr',
      description: 'Красивый и минималистичный плеер',
      pros: ['✨ Красивый дизайн', '📱 Полностью адаптивный', '⚡ Быстрая загрузка'],
      cons: ['🔧 Ограниченные функции', '📊 Нет расширенной статистики']
    },
    jwplayer: {
      name: 'JW Player',
      description: 'Мощный плеер с аналитикой (бесплатная версия)',
      pros: ['📊 Подробная аналитика', '🎬 Высокое качество', '🔧 Много настроек'],
      cons: ['⚠️ Ограничения в бесплатной версии', '📦 Тяжелый']
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-lg border-b border-gray-800 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">🎥</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">sMeNa.Tv LIVE Studio</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
                  <span className="text-sm text-gray-300">
                    {isLoading ? 'Проверка...' : isLive ? 'В ЭФИРЕ • Поток активен' : 'ОФФЛАЙН • Ожидание трансляции'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
              <p className="text-sm text-cyan-300">🔗 Поток: <code className="bg-gray-900 px-2 py-1 rounded">live.kancher.ru</code></p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        {/* Stream URL Info */}
        <div className="mb-8 p-4 bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-2xl border border-purple-500/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">📡 Трансляция в реальном времени</h2>
              <p className="text-gray-300 text-sm">
                Выберите плеер для просмотра. Все плееры с открытым исходным кодом и бесплатные.
              </p>
            </div>
            <div className="bg-black/50 rounded-lg p-3 border border-gray-700">
              <p className="text-sm font-mono">🎬 HLS: <span className="text-cyan-300">{STREAM_URL}</span></p>
            </div>
          </div>
        </div>

        {/* Player Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(players).map(([key, player]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === key
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                {player.name}
              </button>
            ))}
          </div>

          {/* Player Card */}
          <div className="bg-gray-900/50 rounded-2xl border border-gray-700 overflow-hidden">
            {/* Player Header */}
            <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-black">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <h3 className="text-xl font-bold">{players[activeTab].name}</h3>
                  <p className="text-gray-400 mt-1">{players[activeTab].description}</p>
                </div>
                <div className="flex gap-2">
                  {players[activeTab].pros.map((pro, idx) => (
                    <span key={idx} className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-lg border border-green-800/50">
                      {pro}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Player Container */}
            <div className="p-4">
              <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4 border border-gray-800">
                {isLive ? (
                  <div className="w-full h-full">
                    {activeTab === 'native' && <NativePlayer streamUrl={STREAM_URL} />}
                    {activeTab === 'videojs' && <VideoJSPlayer streamUrl={STREAM_URL} />}
                    {activeTab === 'clappr' && <ClapprPlayer streamUrl={STREAM_URL} />}
                    {activeTab === 'plyr' && <PlyrPlayer streamUrl={STREAM_URL} />}
                    {activeTab === 'jwplayer' && <JWPlayer streamUrl={STREAM_URL} />}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                    <div className="text-center p-8">
                      <div className="w-20 h-20 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
                        <span className="text-3xl">📡</span>
                      </div>
                      <h3 className="text-xl font-medium mb-2">Трансляция скоро начнется</h3>
                      <p className="text-gray-400 max-w-md mx-auto">
                        Ожидайте начала эфира. Плеер автоматически подключится к потоку когда трансляция будет активна.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Player Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                  <h4 className="font-semibold mb-2 text-green-400">✅ Преимущества</h4>
                  <ul className="space-y-1">
                    {players[activeTab].pros.map((pro, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <span className="text-green-500">✓</span> {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                  <h4 className="font-semibold mb-2 text-yellow-400">⚠️ Особенности</h4>
                  <ul className="space-y-1">
                    {players[activeTab].cons.map((con, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <span className="text-yellow-500">•</span> {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* All Players Grid */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">🎬 Сравнение всех плееров</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(players).map(([key, player]) => (
              <div
                key={key}
                className={`bg-gradient-to-b from-gray-900 to-black rounded-xl border-2 p-4 transition-all cursor-pointer hover:scale-[1.02] ${
                  activeTab === key ? 'border-cyan-500' : 'border-gray-800 hover:border-gray-600'
                }`}
                onClick={() => setActiveTab(key)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    key === 'native' ? 'bg-blue-900/30' :
                    key === 'videojs' ? 'bg-orange-900/30' :
                    key === 'clappr' ? 'bg-purple-900/30' :
                    key === 'plyr' ? 'bg-green-900/30' : 'bg-red-900/30'
                  }`}>
                    <span className="text-lg">{
                      key === 'native' ? '🔧' :
                      key === 'videojs' ? '🎬' :
                      key === 'clappr' ? '💬' :
                      key === 'plyr' ? '✨' : '📊'
                    }</span>
                  </div>
                  <div>
                    <h4 className="font-bold">{player.name}</h4>
                    <div className="flex gap-1 mt-1">
                      {player.pros.slice(0, 1).map((pro, idx) => (
                        <span key={idx} className="text-xs bg-gray-800 px-1.5 py-0.5 rounded">
                          {pro.replace(/[^a-zA-Z]/g, '')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-3">{player.description}</p>
                <div className="flex justify-between items-center">
                  <button className="text-sm px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    Выбрать
                  </button>
                  <span className="text-xs text-gray-500">бесплатно</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Info */}
        <div className="mt-12 p-6 bg-gradient-to-r from-gray-900/50 to-black/50 rounded-2xl border border-gray-800">
          <h3 className="text-xl font-bold mb-4">⚙️ Техническая информация</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/30 p-4 rounded-xl border border-gray-800">
              <h4 className="font-semibold mb-2 text-cyan-300">📡 Формат потока</h4>
              <p className="text-sm text-gray-300">HLS (HTTP Live Streaming)</p>
              <p className="text-xs text-gray-500 mt-1">Современный стандарт для онлайн-видео</p>
            </div>
            <div className="bg-black/30 p-4 rounded-xl border border-gray-800">
              <h4 className="font-semibold mb-2 text-cyan-300">🔒 Безопасность</h4>
              <p className="text-sm text-gray-300">HTTPS + SSL шифрование</p>
              <p className="text-xs text-gray-500 mt-1">Защищенное соединение</p>
            </div>
            <div className="bg-black/30 p-4 rounded-xl border border-gray-800">
              <h4 className="font-semibold mb-2 text-cyan-300">🎯 Совместимость</h4>
              <p className="text-sm text-gray-300">Все современные браузеры</p>
              <p className="text-xs text-gray-500 mt-1">Desktop & Mobile</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/80 border-t border-gray-800 mt-12 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg"></div>
                <h3 className="text-xl font-bold">sMeNa.Tv Streaming Lab</h3>
              </div>
              <p className="text-gray-400 max-w-md">
                Экспериментальная платформа для тестирования видео плееров. 
                Все решения с открытым исходным кодом.
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-500 mb-2">🚀 Технологии:</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                <span className="px-3 py-1 bg-gray-900 text-gray-300 text-sm rounded-full border border-gray-700">Next.js 14</span>
                <span className="px-3 py-1 bg-gray-900 text-gray-300 text-sm rounded-full border border-gray-700">HLS.js</span>
                <span className="px-3 py-1 bg-gray-900 text-gray-300 text-sm rounded-full border border-gray-700">NGINX + RTMP</span>
                <span className="px-3 py-1 bg-gray-900 text-gray-300 text-sm rounded-full border border-gray-700">TypeScript</span>
              </div>
            </div>
          </div>
          <div className="text-center mt-8 pt-6 border-t border-gray-800/50">
            <p className="text-gray-500 text-sm">
              sMeNa.Tv 2025 • Город-Герой Севастополь • Республика Крым • Российская Федерация
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
