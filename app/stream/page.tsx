'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

export default function StreamPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [streamError, setStreamError] = useState('');

  // Поток с сервера
  const streamUrl = 'https://live.kancher.ru/stream/stream.m3u8';

  // Проверка доступности стрима
  useEffect(() => {
    const checkStream = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(streamUrl, { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        
        if (response.ok) {
          setIsLive(true);
          setStreamError('');
        } else {
          setIsLive(false);
          setStreamError('Стрим недоступен');
        }
      } catch (error) {
        setIsLive(false);
        setStreamError('Ошибка подключения к стриму');
      } finally {
        setIsLoading(false);
      }
    };

    checkStream();
    const interval = setInterval(checkStream, 10000);
    return () => clearInterval(interval);
  }, []);

  // Инициализация HLS плеера
  useEffect(() => {
    if (videoRef.current && isLive) {
      const video = videoRef.current;
      
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: false,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(console.error);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS error:', data);
          if (data.fatal) {
            setIsLive(false);
            setStreamError('Ошибка воспроизведения потока');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Для Safari
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(console.error);
        });
      }
    }
  }, [isLive]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-sm border-b border-gray-800 p-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg"></div>
            <div>
              <h1 className="text-lg font-medium">sMeNa.Tv LIVE</h1>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                {isLoading ? (
                  <>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span>ПРОВЕРКА...</span>
                  </>
                ) : isLive ? (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span>В ЭФИРЕ</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span>ОФФЛАЙН</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-400">
            Сервер: 194.87.57.198
          </div>
        </div>
      </header>

      {/* Video Player */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="bg-black rounded-xl overflow-hidden shadow-2xl">
          {/* Video Container */}
          <div className="relative aspect-video bg-gray-900">
            {isLive ? (
              <video
                ref={videoRef}
                controls
                autoPlay
                muted
                playsInline
                className="w-full h-full object-contain"
              >
                Ваш браузер не поддерживает видео поток.
              </video>
            ) : (
              <div className="flex items-center justify-center h-full flex-col gap-4">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-medium mb-2">
                    {isLoading ? 'Проверяем соединение...' : 'Трансляция скоро начнется'}
                  </h3>
                  <p className="text-gray-400">
                    {isLoading ? 'Подключаемся к серверу...' : 'Ожидайте начала эфира'}
                  </p>
                  {streamError && (
                    <p className="text-red-400 text-sm mt-2">{streamError}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Stream Info */}
          <div className="p-6 bg-gray-900/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Статус трансляции</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    isLive ? 'bg-red-500 animate-pulse' : 
                    isLoading ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}></div>
                  <span>
                    {isLoading ? 'Проверка...' : 
                     isLive ? 'В прямом эфире' : 'Оффлайн'}
                  </span>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Качество</h3>
                <div className="text-cyan-400">Адаптивное HLS</div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Подключение</h3>
                <div className="text-sm text-gray-300">
                  <div>RTMP: rtmp://194.87.57.198:1935/live</div>
                  <div>HLS: http://194.87.57.198/stream/stream.m3u8</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-gray-900 rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">📡 Инструкция для стримера</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">OBS Настройки</h4>
              <p><strong>Сервер:</strong> <code className="bg-gray-700 px-1 rounded">rtmp://194.87.57.198:1935/live</code></p>
              <p><strong>Ключ потока:</strong> <code className="bg-gray-700 px-1 rounded">stream</code></p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Техническая информация</h4>
              <p><strong>HLS поток:</strong> <code className="bg-gray-700 px-1 rounded">/stream/stream.m3u8</code></p>
              <p><strong>Статистика:</strong> <code className="bg-gray-700 px-1 rounded">/stat</code></p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/80 border-t border-gray-800 p-6 mt-8">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>sMeNa.Tv LIVE Streaming • HLS • RTMP</p>
          <p className="text-sm mt-2">Для начала трансляции подключитесь через OBS к серверу</p>
        </div>
      </footer>
    </div>
  );
}
