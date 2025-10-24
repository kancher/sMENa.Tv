// app/page.tsx - С CLOUDFLARE ANALYTICS
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// Типы для данных Cloudflare Analytics
interface VisitorStats {
  success: boolean;
  totalVisitors: number;
  uniqueVisitors: number;
  todayVisitors: number;
  bandwidth: number;
  requests: number;
  lastUpdated: string;
  message?: string;
}

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [visitors, setVisitors] = useState(0);
  const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Счётчик до 4 ноября 2025
    const launchDate = new Date('2025-11-04T00:00:00').getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate - now;
      
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    // 🔥 ЗАГРУЗКА СТАТИСТИКИ CLOUDFLARE
    const fetchCloudflareStats = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching visitor stats...');
        
        const response = await fetch('/api/cloudflare-stats');
        const data: VisitorStats = await response.json();
        
        setVisitorStats(data);
        setVisitors(data.totalVisitors);
        console.log('✅ Stats loaded:', data);
        
      } catch (error) {
        console.error('❌ Failed to load stats:', error);
        // Используем fallback данные
        setVisitors(1342);
      } finally {
        setLoading(false);
      }
    };

    fetchCloudflareStats();
    
    // Обновляем статистику каждые 5 минут
    const statsInterval = setInterval(fetchCloudflareStats, 5 * 60 * 1000);
    
    return () => {
      clearInterval(timer);
      clearInterval(statsInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex flex-col">
      {/* Header - Centered Logo */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              <img 
                src="/images/logo.png" 
                alt="sMeNa.Tv" 
                className="w-8 h-8"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <div 
                className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg hidden"
                style={{ display: 'none' }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 font-light">
              sMeNa.Tv ~ Это Ты!
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-4xl">
          {/* Main Slogan */}
          <div className="mb-16">
            <h1 className="text-5xl md:text-7xl font-light text-gray-900 mb-6 leading-tight">
              МЕНЯЙся
              <br />
              к <span className="bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">ЛУЧшему</span>,
            </h1>
            <div className="text-2xl md:text-3xl text-gray-600 font-light">
              А мы...А МЫ с тобой!
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="mb-16">
            <div className="text-sm text-gray-500 uppercase tracking-wider mb-6">
              До запуска осталось
            </div>
            <div className="flex justify-center gap-8 md:gap-12">
              {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="text-center">
                  <div className="text-3xl md:text-4xl font-light text-gray-900 mb-2">
                    {value.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">
                    {unit === 'days' ? 'дней' : 
                     unit === 'hours' ? 'часов' : 
                     unit === 'minutes' ? 'минут' : 'секунд'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 🔥 ОБНОВЛЁННЫЙ БЛОК СТАТИСТИКИ CLOUDFLARE */}
          <div className="mb-12">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              {loading ? 'Загрузка статистики...' : 'Посетителей сегодня'}
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center gap-2 py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
                <span className="text-sm text-gray-500">Загрузка...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-light text-gray-900 mb-2">
                  {visitors.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400 space-y-1">
                  {visitorStats && visitorStats.success ? (
                    <>
                      <div>+{visitorStats.todayVisitors} сегодня</div>
                      <div>{visitorStats.uniqueVisitors.toLocaleString()} уникальных</div>
                    </>
                  ) : (
                    <>
                      <div>Реальные данные скоро появятся</div>
                      <div className="text-orange-500 text-xs">⚠️ Тестовый режим</div>
                    </>
                  )}
                  <div className="text-xs">[бЭтка 5.2 от 2025.10.24~го]</div>
                </div>
              </>
            )}
          </div>

          {/* Single CTA Button */}
          <div className="flex justify-center">
            <Link 
              href="/lounge"
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-all text-sm font-medium"
            >
              Исследовать
            </Link>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200/50 p-8">
        <div className="max-w-6xl mx-auto text-center">
          {/* Пустой футер для баланса */}
        </div>
      </footer>
    </div>
  );
}
