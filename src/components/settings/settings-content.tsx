"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Settings, 
  DollarSign, 
  Users, 
  Download, 
  FileText, 
  Code, 
  Shield,
  Copy,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'

const settingsTabs = [
  { id: 'general', name: 'General', icon: Settings },
  { id: 'revenue', name: 'Revenue', icon: DollarSign },
  { id: 'team', name: 'Team', icon: Users },
  { id: 'import', name: 'Import', icon: Download },
  { id: 'reports', name: 'Reports', icon: FileText },
  { id: 'api', name: 'API', icon: Code },
  { id: 'exclusions', name: 'Exclusions', icon: Shield },
]

// Mock site data - replace with real data
const mockSite = {
  id: 'site_123',
  name: 'My Website',
  domain: 'mywebsite.com',
  trackingId: 'fi_684301d51cba1db8fd23052a',
  timezone: 'Asia/Kolkata',
  isPublic: false
}

export function SettingsContent() {
  const [activeTab, setActiveTab] = useState('general')
  const [copied, setCopied] = useState(false)

  const trackingScript = `<script
defer
data-website-id="${mockSite.trackingId}"
data-domain="${mockSite.domain}"
src="${window.location.origin}/tracking.js">
</script>`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(trackingScript)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings site={mockSite} trackingScript={trackingScript} copyToClipboard={copyToClipboard} copied={copied} />
      case 'revenue':
        return <RevenueSettings />
      case 'team':
        return <TeamSettings />
      case 'import':
        return <ImportSettings />
      case 'reports':
        return <ReportsSettings />
      case 'api':
        return <APISettings />
      case 'exclusions':
        return <ExclusionsSettings />
      default:
        return <GeneralSettings site={mockSite} trackingScript={trackingScript} copyToClipboard={copyToClipboard} copied={copied} />
    }
  }

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <Card>
          <CardContent className="p-4">
            <nav className="space-y-1">
              {settingsTabs.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-left",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <tab.icon className="mr-3 h-4 w-4" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {renderTabContent()}
      </div>
    </div>
  )
}

interface GeneralSettingsProps {
  site: {
    id: string
    name: string
    domain: string
    trackingId: string
    timezone: string
    isPublic: boolean
  }
  trackingScript: string
  copyToClipboard: () => void
  copied: boolean
}

function GeneralSettings({ site, trackingScript, copyToClipboard, copied }: GeneralSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Domain Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Domain</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website Domain
            </label>
            <input
              type="text"
              value={site.domain}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="yourdomain.com"
            />
          </div>
          <Button>Save</Button>
        </CardContent>
      </Card>

      {/* Timezone Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Timezone</CardTitle>
          <p className="text-sm text-gray-600">This defines what &quot;today&quot; means in your reports</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Asia/Kolkata">Asia - Calcutta (where time is 9:09 PM)</option>
              <option value="America/New_York">America - New York</option>
              <option value="Europe/London">Europe - London</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <Button>Save</Button>
        </CardContent>
      </Card>

      {/* Public Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Public Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Make dashboard publicly accessible</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Script */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Script</CardTitle>
          <p className="text-sm text-gray-600">
            Paste this snippet in the &lt;head&gt; of your website. If you need more help, see our{' '}
            <a href="#" className="text-blue-600 underline">installation guides</a>
          </p>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-gray-900 text-green-400 p-4 rounded-md text-sm overflow-x-auto">
              <code>{trackingScript}</code>
            </pre>
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2"
              onClick={copyToClipboard}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Tip: <a href="#" className="text-blue-600 underline">proxy this script through your own domain</a> to avoid ad blockers.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function RevenueSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Tracking</CardTitle>
        <p className="text-sm text-gray-600">Connect your payment providers to track revenue attribution</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stripe Integration */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-sm font-bold">S</div>
              <div>
                <h3 className="font-medium">Stripe</h3>
                <p className="text-sm text-gray-600">Connect your Stripe account</p>
              </div>
            </div>
            <Button variant="outline">Connect</Button>
          </div>
        </div>

        {/* LemonSqueezy Integration */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-white text-sm font-bold">L</div>
              <div>
                <h3 className="font-medium">LemonSqueezy</h3>
                <p className="text-sm text-gray-600">Connect your LemonSqueezy account</p>
              </div>
            </div>
            <Button variant="outline">Connect</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TeamSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <p className="text-sm text-gray-600">Invite team members to collaborate on your analytics</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="email"
              placeholder="Enter email address"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button>Invite</Button>
          </div>
          <p className="text-sm text-gray-600">
            Team members will have access to view analytics data and reports.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function ImportSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Data</CardTitle>
        <p className="text-sm text-gray-600">Import historical data from other analytics platforms</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Google Analytics</h3>
            <p className="text-sm text-gray-600 mb-3">Import your historical data from Google Analytics</p>
            <Button variant="outline">Import from GA4</Button>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Plausible</h3>
            <p className="text-sm text-gray-600 mb-3">Import your historical data from Plausible</p>
            <Button variant="outline">Import from Plausible</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ReportsSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Reports</CardTitle>
        <p className="text-sm text-gray-600">Set up automated email reports</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button>Create New Report</Button>
          <p className="text-sm text-gray-600">
            No scheduled reports configured yet. Create your first automated report to get regular insights delivered to your inbox.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function APISettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Access</CardTitle>
        <p className="text-sm text-gray-600">Generate API keys to access your analytics data programmatically</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button>Generate API Key</Button>
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-2">API Documentation</h4>
            <p className="text-sm text-gray-600">
              Access our comprehensive API documentation to integrate FastInsight data into your applications.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ExclusionsSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exclusions</CardTitle>
        <p className="text-sm text-gray-600">Exclude specific IPs, pages, or user agents from tracking</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exclude IP Addresses
            </label>
            <input
              type="text"
              placeholder="192.168.1.1, 10.0.0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exclude Pages
            </label>
            <input
              type="text"
              placeholder="/admin/*, /test/*"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button>Save Exclusions</Button>
        </div>
      </CardContent>
    </Card>
  )
} 