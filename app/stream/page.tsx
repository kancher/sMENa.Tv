// app/stream/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

export default function StreamPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Используем НАПРЯМУЮ ваш домен с HTTPS
  const streamUrl = 'https://live.kancher.ru/hls/stream.m3u8';

  useEffect(() => {
    const checkStream = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(streamUrl, { method: 'HEAD' });
        setIsLive(response.ok);
        setError('');
      } catch (err) {
        setIsLive(false);
        setError('Стрим офлайн. Запустите OBS.');
      } finally {
        setIsLoading(false);
      }
    };

    checkStream();
    const interval = setInterval(checkStream, 30000); // Проверка каждые 30 сек
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.log('Автовоспроизведение заблокировано'));
      });
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Network error, trying to recover');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Media error, recovering');
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
      
      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Для Safari
      video.src = streamUrl;
      video.play().catch(e => console.log('Автовоспроизведение заблокировано'));
    }
  }, [streamUrl]);

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
                   isLive ? 'В ЭФИРЕ' : 
                   error ? error : 'ОФФЛАЙН'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {error && (
          <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-red-300">{error}</p>
            <p className="text-sm text-gray-400 mt-1">
              Настройки OBS: Сервер: <code>rtmp://194.87.57.198/live</code>
            </p>
          </div>
        )}
        
        <div className="bg-black rounded-xl overflow-hidden">
          <div className="relative aspect-video bg-gray-900">
            <video
              ref={videoRef}
              controls
              autoPlay
              muted
              playsInline
              className="w-full h-full"
              poster="/placeholder.jpg"
            />
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-900/50 rounded-lg">
            <h3 className="font-medium mb-2">📡 Статус сервера</h3>
            <p className="text-sm text-gray-300">
              {isLive ? 'Сервер онлайн, принимает поток' : 'Ожидание потока от OBS'}
            </p>
          </div>
          
          <div className="p-4 bg-gray-900/50 rounded-lg">
            <h3 className="font-medium mb-2">⚙️ Настройки OBS</h3>
            <code className="text-sm bg-black p-2 rounded block">
              Сервер: rtmp://194.87.57.198/live<br/>
              Ключ: test123
            </code>
          </div>
          
          <div className="p-4 bg-gray-900/50 rounded-lg">
            <h3 className="font-medium mb-2">🔗 Прямые ссылки</h3>
            <div className="space-y-1 text-sm">
              <a href="https://live.kancher.ru/hls/stream.m3u8" 
                 target="_blank" 
                 className="text-cyan-400 hover:text-cyan-300 block">
                HLS Поток
              </a>
              <a href="http://194.87.57.198:8080/stat" 
                 target="_blank" 
                 className="text-cyan-400 hover:text-cyan-300 block">
                Статистика RTMP
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
