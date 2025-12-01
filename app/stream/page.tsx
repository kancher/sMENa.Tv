'use client';

import { useEffect, useRef, useState } from 'react';

export default function StreamPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [kulyaStatus, setKulyaStatus] = useState(false);

  // Используем Worker для видео
  const streamUrl = 'https://video-proxy.smenatv.workers.dev/hls/stream.m3u8';
  const apiStatusUrl = 'https://video-proxy.smenatv.workers.dev/system/status';

  useEffect(() => {
    const checkAllServices = async () => {
      try {
        setIsLoading(true);
        
        // Проверяем Кулю
        const kulyaResponse = await fetch(apiStatusUrl);
        const kulyaData = await kulyaResponse.json();
        setKulyaStatus(kulyaData.success && kulyaData.status?.server_available);
        
        // Проверяем поток
        const streamResponse = await fetch(streamUrl);
        setIsLive(streamResponse.ok);
        
      } catch {
        setIsLive(false);
        setKulyaStatus(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAllServices();
    const interval = setInterval(checkAllServices, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLive) return;

    // Для браузеров с нативной поддержкой HLS
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.load();
      video.play().catch(e => console.log('Автовоспроизведение:', e.message));
    }
    // Для других браузеров
    else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.onload = () => {
        if ((window as any).Hls && (window as any).Hls.isSupported()) {
          const hls = new (window as any).Hls();
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on((window as any).Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(e => console.log('Автовоспроизведение:', e.message));
          });
        }
      };
      document.head.appendChild(script);
    }
  }, [isLive]);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-black/80 border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg"></div>
            <div>
              <h1 className="text-lg font-medium">sMeNa.Tv LIVE</h1>
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  isLoading ? 'bg-yellow-500 animate-pulse' : 
                  isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'
                }`}></div>
                <span>
                  {isLoading ? 'Проверка...' : 
                   isLive ? 'В ЭФИРЕ' : 'ОФФЛАЙН'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {/* Плеер */}
        <div className="bg-black rounded-xl overflow-hidden mb-6">
          <div className="relative aspect-video bg-gray-900">
            <video
              ref={videoRef}
              controls
              autoPlay
              muted
              playsInline
              className="w-full h-full"
              poster="/stream-poster.jpg"
            >
              Ваш браузер не поддерживает HLS поток.
            </video>
          </div>
        </div>

        {/* Статус сервисов */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${kulyaStatus ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${kulyaStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">Куля (AI API)</span>
            </div>
            <p className="text-sm">{kulyaStatus ? '✅ Работает' : '❌ Недоступна'}</p>
          </div>
          
          <div className={`p-4 rounded-lg ${isLive ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">Видео поток</span>
            </div>
            <p className="text-sm">{isLive ? '✅ В эфире' : '❌ Офлайн'}</p>
          </div>
          
          <div className="p-4 bg-blue-900/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium">CloudFlare Worker</span>
            </div>
            <p className="text-sm">✅ Активен</p>
          </div>
        </div>

        {/* Информация */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-gray-900/50 rounded-xl">
            <h3 className="text-xl font-semibold mb-4">⚙️ Настройки OBS</h3>
            <div className="bg-black p-4 rounded-lg font-mono text-sm">
              <div className="mb-3">
                <div className="text-gray-400 text-xs mb-1">Сервер:</div>
                <div className="text-green-400">rtmp://194.87.57.198/live</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Ключ потока:</div>
                <div className="text-yellow-400">test123</div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-900/50 rounded-xl">
            <h3 className="text-xl font-semibold mb-4">🔗 Полезные ссылки</h3>
            <div className="space-y-3">
              <a 
                href="https://video-proxy.smenatv.workers.dev/hls/stream.m3u8" 
                target="_blank"
                className="block p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition group"
              >
                <div className="font-medium">HLS поток (через Worker)</div>
                <div className="text-sm text-gray-400 truncate group-hover:text-gray-300">
                  video-proxy.smenatv.workers.dev/hls/stream.m3u8
                </div>
              </a>
              <a 
                href="https://api.kancher.ru/hls/stream.m3u8" 
                target="_blank"
                className="block p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition group"
              >
                <div className="font-medium">HLS поток (напрямую)</div>
                <div className="text-sm text-gray-400 truncate group-hover:text-gray-300">
                  api.kancher.ru/hls/stream.m3u8
                </div>
              </a>
              <a 
                href="https://api.kancher.ru/stat" 
                target="_blank"
                className="block p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition group"
              >
                <div className="font-medium">Статистика RTMP</div>
                <div className="text-sm text-gray-400 group-hover:text-gray-300">
                  api.kancher.ru/stat
                </div>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
