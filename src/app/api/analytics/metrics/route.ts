import { NextResponse } from 'next/server'
import { getAnalyticsMetrics, getRealAnalyticsMetrics, seedSampleData, clearSampleData } from '@/lib/analytics'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') // 'real' or 'sample'
    const clear = searchParams.get('clear') // 'true' to clear sample data
    
    if (clear === 'true') {
      await clearSampleData()
      return NextResponse.json({ message: 'Sample data cleared' })
    }
    
    if (mode === 'real') {
      // Get real analytics without seeding
      const metrics = await getRealAnalyticsMetrics()
      return NextResponse.json(metrics)
    } else {
      // Default: seed sample data if none exists, then get analytics
      await seedSampleData()
      const metrics = await getAnalyticsMetrics()
      return NextResponse.json(metrics)
    }
  } catch (error) {
    console.error('Failed to fetch analytics metrics:', error)
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
} 