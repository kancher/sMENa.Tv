import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      todayVisitors: 0,
      totalVisitors: 0,
      uniqueVisitors: 0,
      pageViews: 0,
      online: 0,
      lastUpdated: new Date().toISOString(),
      message: '📊 Статистика готовится'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      todayVisitors: 0,
      totalVisitors: 0,
      uniqueVisitors: 0,
      pageViews: 0,
      online: 0,
      lastUpdated: new Date().toISOString(),
      message: '🔄 Настройка аналитики'
    });
  }
}
