'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TrackedEvent {
  type: string
  name: string
  time: string
  amount?: string
}

declare global {
  interface Window {
    fastinsight?: {
      track: (eventName: string, properties?: Record<string, unknown>) => void
      revenue: (amount: number, currency?: string, properties?: Record<string, unknown>) => void
      pageview: () => void
    }
  }
}

export default function DemoPage() {
  const [websiteId, setWebsiteId] = useState<string>('')
  const [events, setEvents] = useState<TrackedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    // Get or create a demo site
    async function setupDemoSite() {
      try {
        setLoading(true)
        
        // First, try to get existing sites
        const sitesResponse = await fetch('/api/sites')
        if (sitesResponse.ok) {
          const sites = await sitesResponse.json()
          
          // Look for an existing demo site
          const demoSite = sites.find((site: { domain: string; name: string; websiteId: string }) => 
            site.domain === 'demo.fastinsight.com' || 
            site.name === 'Demo Site'
          )
          
          if (demoSite) {
            console.log('🔄 Using existing demo site:', demoSite)
            setWebsiteId(demoSite.websiteId)
            loadTrackingScript(demoSite.websiteId)
            setLoading(false)
            return
          }
        }
        
        // Create a new demo site if none exists
        console.log('🆕 Creating new demo site...')
        const response = await fetch('/api/sites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            domain: 'demo.fastinsight.com',
            name: 'Demo Site'
          })
        })
        
        if (response.ok) {
          const site = await response.json()
          console.log('✅ Created demo site:', site)
          setWebsiteId(site.websiteId)
          loadTrackingScript(site.websiteId)
        } else {
          const errorData = await response.json()
          setError(`Failed to create demo site: ${errorData.error}`)
        }
      } catch (error) {
        console.error('Failed to setup demo site:', error)
        setError(`Setup failed: ${error}`)
      } finally {
        setLoading(false)
      }
    }
    
    setupDemoSite()
  }, [])

  function loadTrackingScript(websiteId: string) {
    // Remove any existing tracking script
    const existingScript = document.querySelector('script[data-website-id]')
    if (existingScript) {
      existingScript.remove()
    }
    
    // Load the tracking script
    const script = document.createElement('script')
    script.src = '/tracking.js'
    script.setAttribute('data-website-id', websiteId)
    script.onload = () => {
      console.log('✅ Tracking script loaded successfully')
    }
    script.onerror = () => {
      console.error('❌ Failed to load tracking script')
      setError('Failed to load tracking script')
    }
    document.head.appendChild(script)
  }

  const trackCustomEvent = () => {
    console.log('🔄 Attempting to track custom event...')
    if (window.fastinsight) {
      window.fastinsight.track('button_click', {
        button_name: 'Demo Button',
        timestamp: new Date().toISOString()
      })
      setEvents(prev => [...prev, { type: 'Custom Event', name: 'button_click', time: new Date().toLocaleTimeString() }])
      console.log('✅ Custom event tracked')
    } else {
      console.error('❌ FastInsight tracking not available')
      setError('Tracking script not loaded')
    }
  }

  const trackRevenue = () => {
    console.log('🔄 Attempting to track revenue...')
    if (window.fastinsight) {
      window.fastinsight.revenue(29.99, 'USD', {
        product: 'Demo Product',
        category: 'Software'
      })
      setEvents(prev => [...prev, { type: 'Revenue', name: 'purchase', amount: '$29.99', time: new Date().toLocaleTimeString() }])
      console.log('✅ Revenue event tracked')
    } else {
      console.error('❌ FastInsight tracking not available')
      setError('Tracking script not loaded')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Setting up demo site...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">FastInsight Demo</h1>
          <p className="text-gray-400 mb-4">
            This page demonstrates the FastInsight analytics tracking in action.
          </p>
          
          {error && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-4">
              <p className="text-red-100">⚠️ {error}</p>
            </div>
          )}
          
          {websiteId && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-300">
                <strong>Website ID:</strong> {websiteId}
              </p>
              <p className="text-sm text-gray-300 mt-2">
                <strong>Tracking Script:</strong>
              </p>
              <code className="text-xs text-green-400 block mt-1">
                {`<script src="/tracking.js" data-website-id="${websiteId}"></script>`}
              </code>
              <p className="text-xs text-gray-500 mt-2">
                ✅ Tracking script loaded and ready
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Test Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={trackCustomEvent}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Track Custom Event
              </Button>
              <Button 
                onClick={trackRevenue}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Track Revenue ($29.99)
              </Button>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">External Links (auto-tracked):</p>
                <a 
                  href="https://google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm block"
                >
                  Visit Google (external link)
                </a>
                <a 
                  href="/demo.pdf" 
                  className="text-blue-400 hover:text-blue-300 text-sm block"
                >
                  Download PDF (file download)
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Events</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-gray-400 text-sm">No events tracked yet. Try clicking the buttons!</p>
              ) : (
                <div className="space-y-2">
                  {events.slice(-5).reverse().map((event, index) => (
                    <div key={index} className="bg-gray-700 p-3 rounded text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-blue-400 font-medium">{event.type}</span>
                          <span className="text-gray-300 ml-2">{event.name}</span>
                          {event.amount && (
                            <span className="text-green-400 ml-2">{event.amount}</span>
                          )}
                        </div>
                        <span className="text-gray-500 text-xs">{event.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Automatic Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="text-blue-400 font-medium mb-2">Page Views</h4>
                <p className="text-gray-300">Automatically tracked when the page loads</p>
              </div>
              <div>
                <h4 className="text-green-400 font-medium mb-2">External Links</h4>
                <p className="text-gray-300">Tracked when users click links to external domains</p>
              </div>
              <div>
                <h4 className="text-purple-400 font-medium mb-2">File Downloads</h4>
                <p className="text-gray-300">Tracked for PDF, DOC, ZIP and other file types</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <a 
            href="/dashboard" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            View Analytics Dashboard →
          </a>
        </div>
      </div>
    </div>
  )
} 