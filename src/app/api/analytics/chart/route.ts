import { NextResponse } from 'next/server'
import { getChartData } from '@/lib/analytics'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    
    const chartData = await getChartData(siteId || undefined)
    return NextResponse.json(chartData)
  } catch (error) {
    console.error('Failed to fetch chart data:', error)
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 })
  }
} 