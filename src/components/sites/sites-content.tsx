"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Globe, BarChart3, Settings, Copy, Check } from 'lucide-react'
import { formatNumber, getRelativeTime } from '@/lib/utils'

// Mock sites data - replace with real data from your API
const mockSites = [
  {
    id: 'site_1',
    name: 'My Main Website',
    domain: 'mywebsite.com',
    trackingId: 'fi_684301d51cba1db8fd23052a',
    isPublic: false,
    createdAt: new Date('2024-01-15'),
    stats: {
      visitors: 12543,
      pageviews: 45621,
      events: 89234
    }
  },
  {
    id: 'site_2',
    name: 'Blog',
    domain: 'blog.mywebsite.com',
    trackingId: 'fi_892341a42dcb3ef8ae15673b',
    isPublic: true,
    createdAt: new Date('2024-02-20'),
    stats: {
      visitors: 8921,
      pageviews: 23456,
      events: 34567
    }
  },
  {
    id: 'site_3',
    name: 'Landing Page',
    domain: 'landing.example.com',
    trackingId: 'fi_456789b21ecf4da9be27894c',
    isPublic: false,
    createdAt: new Date('2024-03-10'),
    stats: {
      visitors: 3456,
      pageviews: 7890,
      events: 12345
    }
  }
]

export function SitesContent() {
  const [sites] = useState(mockSites)
  const [showAddSite, setShowAddSite] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const copyTrackingScript = async (site: typeof mockSites[0]) => {
    const script = `<script
defer
data-website-id="${site.trackingId}"
data-domain="${site.domain}"
src="${window.location.origin}/tracking.js">
</script>`
    
    try {
      await navigator.clipboard.writeText(script)
      setCopied(site.id)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (showAddSite) {
    return <AddSiteForm onBack={() => setShowAddSite(false)} />
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {sites.length} website{sites.length !== 1 ? 's' : ''} configured
        </div>
        <Button onClick={() => setShowAddSite(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Website
        </Button>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site) => (
          <Card key={site.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">{site.name}</CardTitle>
              </div>
              <div className="flex items-center space-x-1">
                {site.isPublic && (
                  <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Public
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">{site.domain}</p>
                <p className="text-xs text-gray-500">Added {getRelativeTime(site.createdAt)}</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatNumber(site.stats.visitors)}
                  </p>
                  <p className="text-xs text-gray-600">Visitors</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatNumber(site.stats.pageviews)}
                  </p>
                  <p className="text-xs text-gray-600">Pageviews</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatNumber(site.stats.events)}
                  </p>
                  <p className="text-xs text-gray-600">Events</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyTrackingScript(site)}
                >
                  {copied === site.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {sites.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No websites yet</h3>
            <p className="text-gray-600 mb-4">
              Add your first website to start tracking analytics
            </p>
            <Button onClick={() => setShowAddSite(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Website
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AddSiteForm({ onBack }: { onBack: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    timezone: 'UTC',
    isPublic: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Add site creation logic
    console.log('Creating site:', formData)
    onBack()
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <CardTitle>Add New Website</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Awesome Website"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              A friendly name to identify your website
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domain
            </label>
            <input
              type="text"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="mywebsite.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              The domain where you&apos;ll install the tracking script
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New York</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Asia/Kolkata">Asia/Kolkata</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">
              Make dashboard publicly accessible
            </label>
          </div>

          <div className="flex space-x-4">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Website
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 