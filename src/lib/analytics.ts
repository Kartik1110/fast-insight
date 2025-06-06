import { PrismaClient, EventType } from '@prisma/client'

const prisma = new PrismaClient()

export interface AnalyticsMetrics {
  visitors: { value: number; change: number; trend: 'up' | 'down' }
  pageviews: { value: number; change: number; trend: 'up' | 'down' }
  bounceRate: { value: number; change: number; trend: 'up' | 'down' }
  revenue: { value: number; change: number; trend: 'up' | 'down' }
  avgSessionDuration: { value: number; change: number; trend: 'up' | 'down' }
  conversionRate: { value: number; change: number; trend: 'up' | 'down' }
}

export interface ChartData {
  name: string
  visitors: number
  pageviews: number
  revenue: number
}

export interface TrafficSource {
  name: string
  visitors: number
  percentage: number
}

export async function getAnalyticsMetrics(siteId?: string): Promise<AnalyticsMetrics> {
  const now = new Date()
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  
  // Get current period data (last 7 days)
  const currentEvents = await prisma.event.findMany({
    where: {
      timestamp: { gte: lastWeek },
      ...(siteId && { siteId })
    }
  })
  
  // Get previous period data (7-14 days ago)
  const previousEvents = await prisma.event.findMany({
    where: {
      timestamp: { gte: twoWeeksAgo, lt: lastWeek },
      ...(siteId && { siteId })
    }
  })
  
  // Calculate metrics
  const currentVisitors = new Set(currentEvents.map(e => e.visitorId)).size
  const previousVisitors = new Set(previousEvents.map(e => e.visitorId)).size
  const visitorsChange = calculateChange(currentVisitors, previousVisitors)
  
  const currentPageviews = currentEvents.filter(e => e.type === 'PAGEVIEW').length
  const previousPageviews = previousEvents.filter(e => e.type === 'PAGEVIEW').length
  const pageviewsChange = calculateChange(currentPageviews, previousPageviews)
  
  const currentRevenue = currentEvents
    .filter(e => e.revenue && e.revenue > 0)
    .reduce((sum, e) => sum + (e.revenue || 0), 0)
  const previousRevenue = previousEvents
    .filter(e => e.revenue && e.revenue > 0)
    .reduce((sum, e) => sum + (e.revenue || 0), 0)
  const revenueChange = calculateChange(currentRevenue, previousRevenue)
  
  // Calculate bounce rate (simplified: sessions with only 1 pageview)
  const currentSessions = groupBy(currentEvents.filter(e => e.type === 'PAGEVIEW'), 'sessionId')
  const currentBounces = Object.values(currentSessions).filter(events => events.length === 1).length
  const currentBounceRate = Object.keys(currentSessions).length > 0 ? currentBounces / Object.keys(currentSessions).length : 0
  
  const previousSessions = groupBy(previousEvents.filter(e => e.type === 'PAGEVIEW'), 'sessionId')
  const previousBounces = Object.values(previousSessions).filter(events => events.length === 1).length
  const previousBounceRate = Object.keys(previousSessions).length > 0 ? previousBounces / Object.keys(previousSessions).length : 0
  const bounceRateChange = calculateChange(currentBounceRate, previousBounceRate)
  
  // Calculate average session duration (simplified)
  const avgSessionDuration = 245 // Mock for now
  const conversionRate = currentVisitors > 0 ? (currentEvents.filter(e => e.revenue && e.revenue > 0).length / currentVisitors) : 0
  
  return {
    visitors: { 
      value: currentVisitors, 
      change: visitorsChange, 
      trend: visitorsChange >= 0 ? 'up' : 'down' 
    },
    pageviews: { 
      value: currentPageviews, 
      change: pageviewsChange, 
      trend: pageviewsChange >= 0 ? 'up' : 'down' 
    },
    bounceRate: { 
      value: currentBounceRate, 
      change: bounceRateChange, 
      trend: bounceRateChange <= 0 ? 'up' : 'down' // Lower bounce rate is better
    },
    revenue: { 
      value: currentRevenue, 
      change: revenueChange, 
      trend: revenueChange >= 0 ? 'up' : 'down' 
    },
    avgSessionDuration: { 
      value: avgSessionDuration, 
      change: 5.2, 
      trend: 'up' 
    },
    conversionRate: { 
      value: conversionRate, 
      change: 2.1, 
      trend: 'up' 
    }
  }
}

export async function getChartData(siteId?: string): Promise<ChartData[]> {
  const now = new Date()
  const days = 7
  const data: ChartData[] = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
    
    const dayEvents = await prisma.event.findMany({
      where: {
        timestamp: { gte: startOfDay, lt: endOfDay },
        ...(siteId && { siteId })
      }
    })
    
    const visitors = new Set(dayEvents.map(e => e.visitorId)).size
    const pageviews = dayEvents.filter(e => e.type === 'PAGEVIEW').length
    const revenue = dayEvents
      .filter(e => e.revenue && e.revenue > 0)
      .reduce((sum, e) => sum + (e.revenue || 0), 0)
    
    data.push({
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      visitors,
      pageviews,
      revenue
    })
  }
  
  return data
}

export async function getTrafficSources(siteId?: string): Promise<TrafficSource[]> {
  const now = new Date()
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  const events = await prisma.event.findMany({
    where: {
      timestamp: { gte: lastWeek },
      type: 'PAGEVIEW',
      ...(siteId && { siteId })
    },
    select: { referrer: true, visitorId: true }
  })
  
  const sources = new Map<string, Set<string>>()
  
  events.forEach(event => {
    const source = categorizeReferrer(event.referrer)
    if (!sources.has(source)) {
      sources.set(source, new Set())
    }
    sources.get(source)!.add(event.visitorId)
  })
  
  const totalVisitors = new Set(events.map(e => e.visitorId)).size
  
  return Array.from(sources.entries())
    .map(([name, visitors]) => ({
      name,
      visitors: visitors.size,
      percentage: totalVisitors > 0 ? (visitors.size / totalVisitors) * 100 : 0
    }))
    .sort((a, b) => b.visitors - a.visitors)
}

// Helper functions
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

function categorizeReferrer(referrer: string | null): string {
  if (!referrer || referrer === '') return 'Direct'
  
  if (referrer.includes('google.com')) return 'Organic Search'
  if (referrer.includes('facebook.com') || referrer.includes('twitter.com') || referrer.includes('instagram.com')) return 'Social Media'
  if (referrer.includes('ads') || referrer.includes('campaign')) return 'Paid Ads'
  
  return 'Referral'
}

// Seed some sample data for testing
export async function seedSampleData() {
  // Check if we already have data
  const existingEvents = await prisma.event.count()
  if (existingEvents > 0) {
    console.log(`📊 Database already has ${existingEvents} events, skipping seed`)
    return
  }
  
  // Check if user already exists
  let user = await prisma.user.findUnique({
    where: { email: 'demo@fastinsight.com' }
  })
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'demo@fastinsight.com',
        name: 'Demo User',
        role: 'OWNER'
      }
    })
  }
  
  // Check if site already exists
  let site = await prisma.site.findUnique({
    where: { websiteId: 'fi_684301d51cba1db8fd23052a' }
  })
  
  if (!site) {
    site = await prisma.site.create({
      data: {
        websiteId: 'fi_684301d51cba1db8fd23052a',
        domain: 'mywebsite.com',
        name: 'My Website',
        userId: user.id
      }
    })
  }
  
  // Generate sample events for the last 14 days (so we have comparison data)
  const now = new Date()
  const sampleEvents = []
  
  for (let day = 13; day >= 0; day--) {
    const date = new Date(now.getTime() - day * 24 * 60 * 60 * 1000)
    const eventsPerDay = Math.floor(Math.random() * 30) + 5 // Fewer events to not overwhelm real data
    
    for (let i = 0; i < eventsPerDay; i++) {
      const visitorId = `visitor_${Math.floor(Math.random() * 15) + 1}`
      const sessionId = `session_${visitorId}_${day}`
      
      // Pageview event
      sampleEvents.push({
        siteId: site.id,
        sessionId,
        visitorId,
        type: 'PAGEVIEW',
        name: 'pageview',
        url: `https://mywebsite.com${['/', '/about', '/pricing', '/contact'][Math.floor(Math.random() * 4)]}`,
        referrer: [null, 'https://google.com', 'https://facebook.com', 'https://twitter.com'][Math.floor(Math.random() * 4)],
        timestamp: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000)
      })
      
      // Random custom events
      if (Math.random() < 0.2) {
        sampleEvents.push({
          siteId: site.id,
          sessionId,
          visitorId,
          type: 'CUSTOM',
          name: ['signup', 'download', 'contact'][Math.floor(Math.random() * 3)],
          url: 'https://mywebsite.com',
          timestamp: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000)
        })
      }
      
      // Random revenue events
      if (Math.random() < 0.03) {
        sampleEvents.push({
          siteId: site.id,
          sessionId,
          visitorId,
          type: 'REVENUE',
          name: 'purchase',
          url: 'https://mywebsite.com/checkout',
          revenue: [9.99, 29.99, 99.99][Math.floor(Math.random() * 3)],
          currency: 'USD',
          timestamp: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000)
        })
      }
    }
  }
  
  // Insert all events
  for (const event of sampleEvents) {
    await prisma.event.create({ 
      data: {
        siteId: event.siteId,
        sessionId: event.sessionId,
        visitorId: event.visitorId,
        type: event.type as EventType,
        name: event.name,
        url: event.url,
        referrer: event.referrer || null,
        revenue: event.revenue || null,
        currency: event.currency || null,
        timestamp: event.timestamp
      }
    })
  }
  
  console.log(`✅ Seeded ${sampleEvents.length} sample events`)
}

// Clear sample data to get real analytics
export async function clearSampleData() {
  try {
    // Delete all events from the sample site
    const sampleSite = await prisma.site.findUnique({
      where: { websiteId: 'fi_684301d51cba1db8fd23052a' }
    })
    
    if (sampleSite) {
      const deletedEvents = await prisma.event.deleteMany({
        where: { siteId: sampleSite.id }
      })
      console.log(`🗑️  Cleared ${deletedEvents.count} sample events`)
    }
  } catch (error) {
    console.error('Failed to clear sample data:', error)
  }
}

// Get real analytics without seeding
export async function getRealAnalyticsMetrics(siteId?: string): Promise<AnalyticsMetrics> {
  const now = new Date()
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  
  // Get current period data (last 7 days)
  const currentEvents = await prisma.event.findMany({
    where: {
      timestamp: { gte: lastWeek },
      ...(siteId && { siteId })
    }
  })
  
  // Get previous period data (7-14 days ago)
  const previousEvents = await prisma.event.findMany({
    where: {
      timestamp: { gte: twoWeeksAgo, lt: lastWeek },
      ...(siteId && { siteId })
    }
  })
  
  console.log(`📊 Current period: ${currentEvents.length} events, Previous period: ${previousEvents.length} events`)
  
  // Calculate metrics
  const currentVisitors = new Set(currentEvents.map(e => e.visitorId)).size
  const previousVisitors = new Set(previousEvents.map(e => e.visitorId)).size
  const visitorsChange = calculateChange(currentVisitors, previousVisitors)
  
  const currentPageviews = currentEvents.filter(e => e.type === 'PAGEVIEW').length
  const previousPageviews = previousEvents.filter(e => e.type === 'PAGEVIEW').length
  const pageviewsChange = calculateChange(currentPageviews, previousPageviews)
  
  const currentRevenue = currentEvents
    .filter(e => e.revenue && e.revenue > 0)
    .reduce((sum, e) => sum + (e.revenue || 0), 0)
  const previousRevenue = previousEvents
    .filter(e => e.revenue && e.revenue > 0)
    .reduce((sum, e) => sum + (e.revenue || 0), 0)
  const revenueChange = calculateChange(currentRevenue, previousRevenue)
  
  // Calculate bounce rate (simplified: sessions with only 1 pageview)
  const currentSessions = groupBy(currentEvents.filter(e => e.type === 'PAGEVIEW'), 'sessionId')
  const currentBounces = Object.values(currentSessions).filter(events => events.length === 1).length
  const currentBounceRate = Object.keys(currentSessions).length > 0 ? currentBounces / Object.keys(currentSessions).length : 0
  
  const previousSessions = groupBy(previousEvents.filter(e => e.type === 'PAGEVIEW'), 'sessionId')
  const previousBounces = Object.values(previousSessions).filter(events => events.length === 1).length
  const previousBounceRate = Object.keys(previousSessions).length > 0 ? previousBounces / Object.keys(previousSessions).length : 0
  const bounceRateChange = calculateChange(currentBounceRate, previousBounceRate)
  
  // Calculate average session duration (simplified)
  const avgSessionDuration = 245 // Mock for now
  const conversionRate = currentVisitors > 0 ? (currentEvents.filter(e => e.revenue && e.revenue > 0).length / currentVisitors) : 0
  
  return {
    visitors: { 
      value: currentVisitors, 
      change: visitorsChange, 
      trend: visitorsChange >= 0 ? 'up' : 'down' 
    },
    pageviews: { 
      value: currentPageviews, 
      change: pageviewsChange, 
      trend: pageviewsChange >= 0 ? 'up' : 'down' 
    },
    bounceRate: { 
      value: currentBounceRate, 
      change: bounceRateChange, 
      trend: bounceRateChange <= 0 ? 'up' : 'down' // Lower bounce rate is better
    },
    revenue: { 
      value: currentRevenue, 
      change: revenueChange, 
      trend: revenueChange >= 0 ? 'up' : 'down' 
    },
    avgSessionDuration: { 
      value: avgSessionDuration, 
      change: 5.2, 
      trend: 'up' 
    },
    conversionRate: { 
      value: conversionRate, 
      change: 2.1, 
      trend: 'up' 
    }
  }
} 