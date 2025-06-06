import { NextResponse } from 'next/server'
import { getRealSites, createSite, getOrCreateDemoUser } from '@/lib/analytics'

export async function GET() {
  try {
    const sites = await getRealSites()
    return NextResponse.json(sites)
  } catch (error) {
    console.error('Failed to fetch sites:', error)
    return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { domain, name } = await request.json()
    
    if (!domain || !name) {
      return NextResponse.json({ error: 'Domain and name are required' }, { status: 400 })
    }
    
    // Get or create demo user
    const user = await getOrCreateDemoUser()
    
    const site = await createSite({
      domain,
      name,
      userId: user.id
    })
    
    return NextResponse.json(site)
  } catch (error) {
    console.error('Failed to create site:', error)
    return NextResponse.json({ error: 'Failed to create site' }, { status: 500 })
  }
} 