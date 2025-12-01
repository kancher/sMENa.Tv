'use client';

import { useEffect, useRef, useState } from 'react';

export default function StreamPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // ДВА варианта URL для теста:
  const streamUrl1 = 'https://video-proxy.smenatv.workers.dev/hls/stream.m3u8';
  const streamUrl2 = 'https://api.kancher.ru/hls/stream.m3u8';

  // Используем Worker
  const streamUrl = streamUrl1;

  useEffect(() => {
    const checkStream = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(streamUrl);
        if (response.ok) {
          setIsLive(true);
          setError('');
        } else {
          setIsLive(false);
          setError(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (err: any) {
        setIsLive(false);
        setError(err.message || 'Ошибка подключения');
      } finally {
        setIsLoading(false);
      }
    };

    checkStream();
    const interval = setInterval(checkStream, 15000);
    return () => clearInterval(interval);
  }, [streamUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLive) return;

    // Простая инициализация видео
    video.src = streamUrl;
    video.load();
    
    // Для HLS в браузерах кроме Safari
    if (!video.canPlayType('application/vnd.apple.mpegurl')) {
      const loadHls = async () => {
        try {
          const Hls = (await import('hls.js')).default;
          if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              video.play().catch(e => console.log('Autoplay:', e.message));
            });
          }
        } catch (err) {
          console.log('HLS.js не загружен, используем нативный плеер');
        }
      };
      loadHls();
    } else {
      video.play().catch(e => console.log('Autoplay:', e.message));
    }
  }, [isLive, streamUrl]);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-bold mb-6">🎥 sMeNa.Tv LIVE</h1>
      
      {/* Статус */}
      <div className="mb-6 p-4 bg-gray-900 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-3 h-3 rounded-full ${
            isLoading ? 'bg-yellow-500 animate-pulse' : 
            isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`}></div>
          <span className="font-medium">
            {isLoading ? 'Проверка...' : isLive ? 'СТРИМ ОНЛАЙН' : 'СТРИМ ОФФЛАЙН'}
          </span>
        </div>
        
        {error && (
          <div className="text-red-400 text-sm mb-2">
            Ошибка: {error}
          </div>
        )}
        
        <div className="text-sm text-gray-400">
          URL: <code className="bg-gray-800 px-2 py-1 rounded">{streamUrl}</code>
        </div>
      </div>

      {/* Видео плеер */}
      <div className="mb-6 bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          controls
          autoPlay
          muted
          playsInline
          className="w-full aspect-video"
          poster="/stream-poster.jpg"
        >
          Ваш браузер не поддерживает видео поток.
        </video>
      </div>

      {/* Информация */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-gray-900 rounded-lg">
          <h3 className="font-bold mb-3">⚙️ Настройки OBS</h3>
          <div className="space-y-2">
            <div>
              <div className="text-gray-400 text-sm">Сервер:</div>
              <code className="text-green-400">rtmp://194.87.57.198/live</code>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Ключ потока:</div>
              <code className="text-yellow-400">test123</code>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-900 rounded-lg">
          <h3 className="font-bold mb-3">🔗 Тестовые ссылки</h3>
          <div className="space-y-2">
            <a href={streamUrl1} target="_blank" className="block p-2 bg-gray-800 rounded hover:bg-gray-700">
              <div className="text-sm">Через Worker</div>
              <div className="text-xs text-gray-400 truncate">{streamUrl1}</div>
            </a>
            <a href={streamUrl2} target="_blank" className="block p-2 bg-gray-800 rounded hover:bg-gray-700">
              <div className="text-sm">Через api.kancher.ru</div>
              <div className="text-xs text-gray-400 truncate">{streamUrl2}</div>
            </a>
            <a href="https://api.kancher.ru/stat" target="_blank" className="block p-2 bg-gray-800 rounded hover:bg-gray-700">
              <div className="text-sm">Статистика RTMP</div>
            </a>
          </div>
        </div>
      </div>

      {/* Отладка */}
      <div className="mt-6 p-4 bg-blue-900/30 rounded-lg">
        <h3 className="font-bold mb-2">🐛 Отладка</h3>
        <button 
          onClick={() => {
            fetch(streamUrl1).then(r => alert(`Worker: ${r.status}`));
            fetch(streamUrl2).then(r => alert(`API: ${r.status}`));
          }}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Проверить все ссылки
        </button>
      </div>
    </div>
  );
}
