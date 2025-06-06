"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface EventStats {
  totalEvents: number
  uniqueVisitors: number
  eventsByType: Array<{ type: string; _count: number }>
  recentEvents: Array<{
    id: string
    type: string
    name: string
    timestamp: string
    visitorId: string
    site: { domain: string; websiteId: string }
  }>
}

export default function AdminPage() {
  const [stats, setStats] = useState<EventStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/analytics/events')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const clearSampleData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/analytics/metrics?clear=true')
      if (response.ok) {
        setMessage('✅ Sample data cleared successfully')
        fetchStats()
      } else {
        setMessage('❌ Failed to clear sample data')
      }
    } catch (error) {
      setMessage('❌ Error clearing sample data')
    }
    setLoading(false)
  }

  const testRealMode = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/analytics/metrics?mode=real')
      if (response.ok) {
        const data = await response.json()
        setMessage(`✅ Real mode data: ${data.visitors.value} visitors, ${data.pageviews.value} pageviews`)
      } else {
        setMessage('❌ Failed to get real mode data')
      }
    } catch (error) {
      setMessage('❌ Error getting real mode data')
    }
    setLoading(false)
  }

  const testSampleMode = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/analytics/metrics')
      if (response.ok) {
        const data = await response.json()
        setMessage(`✅ Sample mode data: ${data.visitors.value} visitors, ${data.pageviews.value} pageviews`)
      } else {
        setMessage('❌ Failed to get sample mode data')
      }
    } catch (error) {
      setMessage('❌ Error getting sample mode data')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">FastInsight Admin</h1>
        <p className="text-gray-600 mt-1">Manage analytics data and testing</p>
      </div>

      {message && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button onClick={fetchStats} disabled={loading}>
          Refresh Stats
        </Button>
        <Button onClick={clearSampleData} disabled={loading} variant="outline">
          Clear Sample Data
        </Button>
        <Button onClick={testRealMode} disabled={loading} variant="outline">
          Test Real Mode
        </Button>
        <Button onClick={testSampleMode} disabled={loading} variant="outline">
          Test Sample Mode
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Total Events:</strong> {stats.totalEvents}</p>
                <p><strong>Unique Visitors:</strong> {stats.uniqueVisitors}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Events by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.eventsByType.map((stat) => (
                  <div key={stat.type} className="flex justify-between">
                    <span>{stat.type}</span>
                    <span className="font-mono">{stat._count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {stats.recentEvents.map((event) => (
                  <div key={event.id} className="text-sm border-b pb-2">
                    <div className="font-medium">{event.type}: {event.name}</div>
                    <div className="text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {event.visitorId} • {event.site.domain}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium">🔄 Dashboard Modes:</h4>
              <ul className="list-disc list-inside space-y-1 mt-2 text-gray-600">
                <li><strong>Default Mode:</strong> Shows sample data if no real events exist</li>
                <li><strong>Real Mode:</strong> Add <code>?mode=real</code> to dashboard URL to see only real events</li>
                <li><strong>Clear Data:</strong> Use "Clear Sample Data" to remove all sample events</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">🧪 Testing:</h4>
              <ul className="list-disc list-inside space-y-1 mt-2 text-gray-600">
                <li>Visit <a href="/test-page.html" className="text-blue-600 hover:underline">/test-page.html</a> to generate real events</li>
                <li>Use the test buttons to create pageviews, custom events, and revenue events</li>
                <li>Check the dashboard to see real-time updates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 