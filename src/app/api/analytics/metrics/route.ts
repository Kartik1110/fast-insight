import { NextResponse } from 'next/server'
import { getAnalyticsMetrics } from '@/lib/analytics'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    
    const metrics = await getAnalyticsMetrics(siteId || undefined)
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Failed to fetch analytics metrics:', error)
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
} 