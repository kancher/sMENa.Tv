'use client';

import { useEffect, useRef, useState } from 'react';

export default function StreamPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Используем домен live.kancher.ru
  const streamUrl = 'http://live.kancher.ru/hls/stream.m3u8';

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
    const interval = setInterval(checkStream, 10000);
    return () => clearInterval(interval);
  }, []);

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
                  isLoading ? 'bg-yellow-500' : 
                  isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'
                }`}></div>
                <span>{isLoading ? 'Проверка...' : isLive ? 'В ЭФИРЕ' : 'ОФФЛАЙН'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="bg-black rounded-xl overflow-hidden">
          <div className="relative aspect-video bg-gray-900">
            <video
              ref={videoRef}
              controls
              autoPlay
              muted
              playsInline
              className="w-full h-full"
            >
              <source src={streamUrl} type="application/vnd.apple.mpegurl" />
              Ваш браузер не поддерживает видео поток.
            </video>
          </div>
        </div>
      </main>
    </div>
  );
}
