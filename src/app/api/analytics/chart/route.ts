import { NextResponse } from 'next/server'
import { getChartData, seedSampleData } from '@/lib/analytics'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode')
    
    // Only seed if not in real mode
    if (mode !== 'real') {
      await seedSampleData()
    }
    
    const chartData = await getChartData()
    return NextResponse.json(chartData)
  } catch (error) {
    console.error('Failed to fetch chart data:', error)
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 })
  }
} 