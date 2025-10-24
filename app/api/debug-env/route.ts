import { NextResponse } from 'next/server'

export async function GET() {
  const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN
  const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID
  
  return NextResponse.json({
    environment: 'production',
    variablesConfigured: {
      hasToken: !!CLOUDFLARE_API_TOKEN,
      hasZoneId: !!CLOUDFLARE_ZONE_ID,
      tokenLength: CLOUDFLARE_API_TOKEN?.length || 0,
      zoneIdPreview: CLOUDFLARE_ZONE_ID ? `${CLOUDFLARE_ZONE_ID.substring(0, 8)}...` : 'missing'
    },
    expected: {
      tokenLength: '40+ characters',
      zoneIdLength: '32 characters'
    }
  })
}
