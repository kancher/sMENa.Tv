import { NextResponse } from 'next/server'

let visitCount = 0

export async function GET() {
  visitCount += 1
  
  return NextResponse.json({
    count: visitCount,
    message: `Вы посетитель №${visitCount}`
  }, {
    headers: {
      'Cache-Control': 'no-cache'
    }
  })
}
