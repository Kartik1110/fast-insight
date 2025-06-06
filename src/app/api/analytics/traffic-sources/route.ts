import { NextResponse } from 'next/server'
import { getTrafficSources, seedSampleData } from '@/lib/analytics'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode')
    
    // Only seed if not in real mode
    if (mode !== 'real') {
      await seedSampleData()
    }
    
    const trafficSources = await getTrafficSources()
    return NextResponse.json(trafficSources)
  } catch (error) {
    console.error('Failed to fetch traffic sources:', error)
    return NextResponse.json({ error: 'Failed to fetch traffic sources' }, { status: 500 })
  }
} 