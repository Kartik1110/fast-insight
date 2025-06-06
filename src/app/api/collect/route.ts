import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    console.log('📥 Received tracking data:', data)
    
    // Handle both old and new data formats
    const websiteId = data.websiteId || data.site_id
    const visitorId = data.visitorId || data.visitor_id
    const sessionId = data.sessionId || data.session_id
    const eventType = data.type || data.event
    const url = data.href || data.url || data.path
    
    // Validate required fields
    if (!websiteId || !visitorId || !eventType) {
      console.error('❌ Missing required fields:', { websiteId, visitorId, eventType })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find the site by websiteId
    const site = await prisma.site.findUnique({
      where: { websiteId: websiteId }
    })

    if (!site) {
      console.error('❌ Site not found for ID:', websiteId)
      return NextResponse.json(
        { error: 'Invalid site ID' },
        { status: 404 }
      )
    }

    console.log('✅ Found site:', site.name)

    // Map event types to our enum
    let eventTypeEnum: 'PAGEVIEW' | 'REVENUE' | 'OUTBOUND' | 'DOWNLOAD' | 'CUSTOM' = 'PAGEVIEW'
    if (eventType === 'pageview') eventTypeEnum = 'PAGEVIEW'
    else if (eventType === 'revenue' || (data.extraData?.amount && data.extraData?.amount > 0)) eventTypeEnum = 'REVENUE'
    else if (eventType === 'external_link') eventTypeEnum = 'OUTBOUND'
    else if (eventType === 'file_download') eventTypeEnum = 'DOWNLOAD'
    else eventTypeEnum = 'CUSTOM'

    // Extract revenue data
    const revenue = data.extraData?.amount || data.amount || null
    const currency = data.extraData?.currency || data.currency || null

    // Combine properties from different sources
    const properties = {
      ...(data.properties || {}),
      ...(data.extraData || {}),
      viewport: data.viewport,
      domain: data.domain
    }

    // Create the event record
    const event = await prisma.event.create({
      data: {
        siteId: site.id,
        visitorId: visitorId,
        sessionId: sessionId || visitorId,
        type: eventTypeEnum,
        name: data.extraData?.eventName || eventType,
        url: url || 'unknown',
        referrer: data.referrer,
        properties: JSON.stringify(properties),
        revenue: revenue ? parseFloat(revenue.toString()) : null,
        currency: currency,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date()
      }
    })

    console.log('✅ Event created:', event.id)

    return NextResponse.json({ success: true, eventId: event.id })
  } catch (error) {
    console.error('❌ Analytics collection error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 