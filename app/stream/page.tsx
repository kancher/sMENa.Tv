'use client';

import { useEffect, useRef, useState } from 'react';

export default function StreamPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hls, setHls] = useState<any>(null);

  // Ваш Worker URL - добавляем путь к HLS
  const streamUrl = 'https://video-proxy.smenatv.workers.dev/hls/stream.m3u8';

  useEffect(() => {
    const checkStream = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(streamUrl);
        setIsLive(response.ok);
      } catch {
        setIsLive(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkStream();
    const interval = setInterval(checkStream, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Для браузеров с нативной поддержкой HLS (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.play().catch(e => console.log('Автовоспроизведение:', e.message));
    } 
    // Для других браузеров используем hls.js
    else if (typeof window !== 'undefined') {
      import('hls.js').then((Hls) => {
        if (Hls.default.isSupported()) {
          const hlsInstance = new Hls.default({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          
          hlsInstance.on(Hls.default.Events.MANIFEST_PARSED, () => {
            video.play().catch(e => console.log('Автовоспроизведение:', e.message));
          });
          
          setHls(hlsInstance);
        }
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-black/80 border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg"></div>
            <div>
              <h1 className="text-lg font-medium">sMeNa.Tv LIVE через CloudFlare Worker</h1>
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  isLoading ? 'bg-yellow-500' : 
                  isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'
                }`}></div>
                <span>
                  {isLoading ? 'Проверка...' : 
                   isLive ? 'В ЭФИРЕ (через Worker)' : 'ОФФЛАЙН'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="bg-black rounded-xl overflow-hidden mb-6">
          <div className="relative aspect-video bg-gray-900">
            <video
              ref={videoRef}
              controls
              autoPlay
              muted
              playsInline
              className="w-full h-full"
            >
              Ваш браузер не поддерживает видео поток.
            </video>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-gray-900/50 rounded-xl">
            <h3 className="text-xl font-semibold mb-4">📡 Статус системы</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Worker: video-proxy.smenatv.workers.dev</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>VPS: 194.87.57.198:8080</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span>Frontend: CloudFlare Pages</span>
              </li>
            </ul>
          </div>

          <div className="p-6 bg-gray-900/50 rounded-xl">
            <h3 className="text-xl font-semibold mb-4">🔗 Тестовые ссылки</h3>
            <div className="space-y-2">
              <a 
                href="https://video-proxy.smenatv.workers.dev/hls/stream.m3u8" 
                target="_blank"
                className="block p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
              >
                <div className="font-medium">HLS через Worker</div>
                <div className="text-sm text-gray-400 truncate">
                  https://video-proxy.smenatv.workers.dev/hls/stream.m3u8
                </div>
              </a>
              <a 
                href="http://194.87.57.198:8080/hls/stream.m3u8" 
                target="_blank"
                className="block p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
              >
                <div className="font-medium">Прямой HLS (без Worker)</div>
                <div className="text-sm text-gray-400 truncate">
                  http://194.87.57.198:8080/hls/stream.m3u8
                </div>
              </a>
              <a 
                href="http://194.87.57.198:8080/stat" 
                target="_blank"
                className="block p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
              >
                <div className="font-medium">Статистика RTMP</div>
                <div className="text-sm text-gray-400">http://194.87.57.198:8080/stat</div>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 p-6 bg-blue-900/20 border border-blue-700 rounded-xl">
          <h3 className="text-lg font-semibold mb-3">⚙️ Настройки OBS</h3>
          <div className="bg-black p-4 rounded-lg font-mono text-sm">
            <div className="mb-2">
              <span className="text-gray-400">Сервер:</span> 
              <span className="text-green-400 ml-2">rtmp://194.87.57.198/live</span>
            </div>
            <div>
              <span className="text-gray-400">Ключ потока:</span> 
              <span className="text-yellow-400 ml-2">test123</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
