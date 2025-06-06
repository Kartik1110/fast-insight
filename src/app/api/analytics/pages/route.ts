import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface PageAnalytics {
  path: string
  views: number
  visitors: number
  bounceRate: number
  avgTimeOnPage: number
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    
    const now = new Date()
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // Get page analytics from events
    const pageEvents = await prisma.event.findMany({
      where: {
        timestamp: { gte: lastWeek },
        type: 'PAGEVIEW',
        ...(siteId && { siteId })
      },
      select: {
        url: true,
        visitorId: true,
        sessionId: true,
        timestamp: true
      }
    })
    
    // Group by url and calculate metrics
    const pathGroups = pageEvents.reduce((acc, event) => {
      const path = new URL(event.url).pathname || '/'
      if (!acc[path]) {
        acc[path] = {
          views: 0,
          visitors: new Set(),
          sessions: new Map()
        }
      }
      
      acc[path].views++
      acc[path].visitors.add(event.visitorId)
      
      if (!acc[path].sessions.has(event.sessionId)) {
        acc[path].sessions.set(event.sessionId, [])
      }
      acc[path].sessions.get(event.sessionId)!.push(event.timestamp)
      
      return acc
    }, {} as Record<string, { views: number; visitors: Set<string>; sessions: Map<string, Date[]> }>)
    
    // Calculate page analytics
    const pageAnalytics: PageAnalytics[] = Object.entries(pathGroups)
      .map(([path, data]) => {
        const visitors = data.visitors.size
        const views = data.views
        
        // Calculate bounce rate (sessions with only 1 page view)
        const singlePageSessions = Array.from(data.sessions.values())
          .filter(timestamps => timestamps.length === 1).length
        const bounceRate = data.sessions.size > 0 ? singlePageSessions / data.sessions.size : 0
        
        // Mock average time on page for now
        const avgTimeOnPage = Math.floor(Math.random() * 180) + 30 // 30-210 seconds
        
        return {
          path,
          views,
          visitors,
          bounceRate,
          avgTimeOnPage
        }
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, 10) // Top 10 pages
    
    return NextResponse.json(pageAnalytics)
  } catch (error) {
    console.error('Failed to fetch page analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch page analytics' }, { status: 500 })
  }
} 