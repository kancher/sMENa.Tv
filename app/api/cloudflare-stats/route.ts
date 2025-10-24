import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN
    const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID

    console.log('🔐 Environment Variables Check:', {
      hasToken: !!CLOUDFLARE_API_TOKEN,
      hasZoneId: !!CLOUDFLARE_ZONE_ID,
      tokenLength: CLOUDFLARE_API_TOKEN?.length,
      zoneIdPreview: CLOUDFLARE_ZONE_ID?.substring(0, 10) + '...'
    })

    // Проверка наличия переменных
    if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
      throw new Error(
        `Missing environment variables: ` +
        `TOKEN: ${!CLOUDFLARE_API_TOKEN ? 'MISSING' : 'OK'}, ` +
        `ZONE_ID: ${!CLOUDFLARE_ZONE_ID ? 'MISSING' : 'OK'}`
      )
    }

    // Проверка формата Zone ID (должен быть 32 символа)
    if (CLOUDFLARE_ZONE_ID.length !== 32) {
      throw new Error(`Invalid Zone ID length: ${CLOUDFLARE_ZONE_ID.length} (expected 32)`)
    }

    // Проверка формата Token (должен быть 40+ символов)
    if (CLOUDFLARE_API_TOKEN.length < 40) {
      throw new Error(`Invalid Token length: ${CLOUDFLARE_API_TOKEN.length} (expected 40+)`)
    }

    console.log('🔄 Calling Cloudflare API...')
    
    // Тестовый запрос к Cloudflare API
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const apiTest = await response.json()
    console.log('📡 Cloudflare API Test Response:', apiTest)

    if (!apiTest.success) {
      throw new Error(`Cloudflare API test failed: ${apiTest.errors?.[0]?.message || 'Unknown error'}`)
    }

    // Если тест прошел, получаем аналитику
    console.log('📊 Fetching analytics data...')
    
    const analyticsResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/analytics/dashboard?since=-1440`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!analyticsResponse.ok) {
      throw new Error(`Analytics API error: ${analyticsResponse.status}`)
    }

    const analyticsData = await analyticsResponse.json()
    console.log('✅ Analytics API response received')
    
    if (analyticsData.success && analyticsData.result) {
      const stats = analyticsData.result.totals
      
      return NextResponse.json({
        success: true,
        totalVisitors: stats.page_views?.all || 0,
        uniqueVisitors: stats.uniques?.all || 0,
        todayVisitors: stats.page_views?.all || 0, // упрощаем для теста
        bandwidth: Math.round((stats.bandwidth?.all || 0) / 1024 / 1024),
        requests: stats.requests?.all || 0,
        lastUpdated: new Date().toISOString(),
        message: 'Real Cloudflare data'
      })
    }
    
    throw new Error('Analytics data format invalid')
    
  } catch (error) {
    console.error('❌ Detailed error:', error)
    
    return NextResponse.json({
      success: false,
      totalVisitors: 1342,
      uniqueVisitors: 892,
      todayVisitors: 47,
      bandwidth: 124,
      requests: 2856,
      lastUpdated: new Date().toISOString(),
      message: `Fallback data - ${error.message}`,
      error: error.message
    })
  }
}
