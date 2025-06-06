import { NextResponse } from 'next/server'
import { getTrafficSources } from '@/lib/analytics'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    
    const trafficSources = await getTrafficSources(siteId || undefined)
    return NextResponse.json(trafficSources)
  } catch (error) {
    console.error('Failed to fetch traffic sources:', error)
    return NextResponse.json({ error: 'Failed to fetch traffic sources' }, { status: 500 })
  }
} 