'use client';

import { useEffect, useState } from 'react';
import NativePlayer from './components/NativePlayer';

const STREAM_URL = 'https://live.kancher.ru/stream/stream.m3u8';

export default function StreamPage() {
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
                <h1 className="text-2xl font-bold">sMeNa.Tv LIVE</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
                  <span className="text-sm text-gray-300">
                    {isLoading ? 'Проверка...' : isLive ? 'В ЭФИРЕ • Поток активен' : 'ОФФЛАЙН • Ожидание трансляции'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        {/* Player Container */}
        <div className="bg-gray-900/50 rounded-2xl border border-gray-700 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-black">
            <h2 className="text-xl font-bold">🎬 HLS.js Плеер</h2>
            <p className="text-gray-400 mt-1">Нативный плеер - быстрый и стабильный</p>
          </div>
          
          <div className="p-4">
            <div className="aspect-video bg-black rounded-xl overflow-hidden border border-gray-800">
              {isLive ? (
                <NativePlayer streamUrl={STREAM_URL} />
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
          </div>
        </div>

        {/* Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900/30 rounded-xl p-4 border border-gray-700/50">
            <h4 className="font-semibold mb-2 text-green-400">✅ Преимущества</h4>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Высокая скорость загрузки</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Отличная совместимость</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Простая настройка</li>
            </ul>
          </div>
          
          <div className="bg-gray-900/30 rounded-xl p-4 border border-gray-700/50">
            <h4 className="font-semibold mb-2 text-cyan-300">📡 Технологии</h4>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2"><span className="text-cyan-500">•</span> HLS (HTTP Live Streaming)</li>
              <li className="flex items-center gap-2"><span className="text-cyan-500">•</span> NGINX + RTMP сервер</li>
              <li className="flex items-center gap-2"><span className="text-cyan-500">•</span> HTTPS шифрование</li>
            </ul>
          </div>
          
          <div className="bg-gray-900/30 rounded-xl p-4 border border-gray-700/50">
            <h4 className="font-semibold mb-2 text-purple-300">🎯 Информация</h4>
            <div className="text-sm space-y-1">
              <p><span className="text-gray-500">Сервер:</span> live.kancher.ru</p>
              <p><span className="text-gray-500">Формат:</span> Адаптивный HLS</p>
              <p><span className="text-gray-500">Статус:</span> {isLive ? 'Активен' : 'Ожидание'}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/80 border-t border-gray-800 mt-12 p-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            sMeNa.Tv 2025 • Город-Герой Севастополь • Республика Крым • Российская Федерация
          </p>
        </div>
      </footer>
    </div>
  );
}
