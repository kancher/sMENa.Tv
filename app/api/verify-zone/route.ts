import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN
    const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID

    // Проверяем Zone ID через простой API запрос
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

    const data = await response.json()
    
    return NextResponse.json({
      zoneCheck: data.success ? 'SUCCESS' : 'FAILED',
      zoneDetails: data.success ? {
        zoneName: data.result.name,
        status: data.result.status,
        plan: data.result.plan.name
      } : data.errors,
      rawResponse: data
    })
    
  } catch (error) {
    return NextResponse.json({ error: error.message })
  }
}
