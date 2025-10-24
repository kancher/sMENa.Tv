import { NextResponse } from 'next/server'

// Простой счётчик с реалистичной логикой
let totalVisits = 1568
let lastReset = new Date().toDateString()

export async function GET() {
  try {
    const today = new Date().toDateString()
    
    // Сбрасываем дневной счётчик если новый день
    if (today !== lastReset) {
      lastReset = today
    }
    
    // Увеличиваем счётчики с реалистичной логикой
    totalVisits += Math.floor(Math.random() * 3) + 1 // 1-4 новых визита
    
    const now = new Date()
    const hour = now.getHours()
    
    // Реалистичное распределение по времени суток
    let todayVisitors = 0
    if (hour >= 9 && hour <= 18) {
      // Днём больше трафика
      todayVisitors = Math.floor(Math.random() * 15) + 10 // 10-25 сегодня
    } else {
      // Вечером/ночью меньше
      todayVisitors = Math.floor(Math.random() * 8) + 5 // 5-12 сегодня
    }
    
    // Уникальные посетители ~70% от общего числа
    const uniqueVisitors = Math.floor(totalVisits * 0.7)
    
    return NextResponse.json({
      success: true,
      totalVisitors: totalVisits,
      uniqueVisitors: uniqueVisitors,
      todayVisitors: todayVisitors,
      online: Math.floor(Math.random() * 8) + 3, // 3-10 онлайн
      lastUpdated: now.toISOString(),
      message: 'Realistic simulated data'
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      totalVisitors: 1342,
      uniqueVisitors: 892,
      todayVisitors: 47,
      online: 5,
      lastUpdated: new Date().toISOString(),
      message: 'Fallback data'
    })
  }
}
