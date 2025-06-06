import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // Get recent events
    const events = await prisma.event.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        site: {
          select: {
            domain: true,
            websiteId: true
          }
        }
      }
    })
    
    // Get total count
    const totalEvents = await prisma.event.count()
    
    // Get stats by type
    const eventStats = await prisma.event.groupBy({
      by: ['type'],
      _count: true,
      orderBy: {
        _count: {
          type: 'desc'
        }
      }
    })
    
    // Get unique visitors count
    const uniqueVisitors = await prisma.event.findMany({
      select: { visitorId: true },
      distinct: ['visitorId']
    })
    
    const stats = {
      totalEvents,
      uniqueVisitors: uniqueVisitors.length,
      eventsByType: eventStats,
      recentEvents: events.slice(0, 10) // Show only 10 most recent for readability
    }
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return NextResponse.json({ error: 'Failed to fetch events', details: (error as Error).message }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 