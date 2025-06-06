"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts'
import { ChevronLeft, ChevronRight, Globe, AlertTriangle, TrendingUp, TrendingDown, Users, Eye, DollarSign, Target, Clock, Zap, Bell, BarChart } from 'lucide-react'
import { AnalyticsMetrics, ChartData, TrafficSource } from '@/lib/analytics'

// Color palette for charts
const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

// Add interface for page analytics
interface PageAnalytics {
  path: string
  views: number
  visitors: number
  bounceRate: number
  avgTimeOnPage: number
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down'
  icon: React.ReactNode
  loading?: boolean
  isLive?: boolean
}

function MetricCard({ title, value, change, trend, icon, loading, isLive }: MetricCardProps) {
  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400 text-sm">{title}</div>
            <div className="text-gray-500">{icon}</div>
          </div>
          <div className="h-6 bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-20 bg-gray-700 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-400 text-sm font-medium">{title}</span>
          <div className="flex items-center space-x-2">
            {isLive && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            )}
            <div className="text-gray-400">{icon}</div>
          </div>
        </div>
        <div className="text-2xl font-bold text-white mb-2">{value}</div>
        {change !== undefined && trend && (
          <div className="flex items-center">
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-gray-500 text-sm ml-1">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TrafficSourceCard({ sources, loading }: { sources: TrafficSource[], loading: boolean }) {
  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (sources.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-400">No traffic data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Traffic Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sources.map((source, index) => (
            <div key={source.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                ></div>
                <span className="text-gray-300 text-sm">{source.name}</span>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">{source.visitors}</div>
                <div className="text-gray-400 text-xs">{source.percentage.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function IntegratedDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([])
  const [pageAnalytics, setPageAnalytics] = useState<PageAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSite, setSelectedSite] = useState('colabtech.co')
  const [selectedPeriod, setSelectedPeriod] = useState('today')

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        console.log('🔄 Fetching integrated analytics data...')
        
        // Fetch data from all APIs
        const [metricsRes, chartRes, trafficRes, pagesRes] = await Promise.all([
          fetch('/api/analytics/metrics?mode=sample'),
          fetch('/api/analytics/chart?mode=sample'),
          fetch('/api/analytics/traffic-sources?mode=sample'),
          fetch('/api/analytics/pages')
        ])
        
        if (metricsRes.ok) {
          const metricsData = await metricsRes.json()
          console.log('📈 Metrics data:', metricsData)
          setMetrics(metricsData)
        }
        
        if (chartRes.ok) {
          const chartData = await chartRes.json()
          console.log('📊 Chart data:', chartData)
          setChartData(chartData)
        }
        
        if (trafficRes.ok) {
          const trafficData = await trafficRes.json()
          console.log('🌐 Traffic data:', trafficData)
          setTrafficSources(trafficData)
        }
        
        if (pagesRes.ok) {
          const pagesData = await pagesRes.json()
          console.log('📄 Pages data:', pagesData)
          setPageAnalytics(pagesData)
        }
        
      } catch (error) {
        console.error('Failed to fetch analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedSite, selectedPeriod])

  // Format chart data for better display
  const formatChartData = (data: ChartData[]) => {
    return data.map(item => ({
      ...item,
      visitors: item.visitors || 0,
      pageviews: item.pageviews || 0,
      revenue: item.revenue || 0
    }))
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">FastInsight</h1>
            </div>
            
            {/* Site Selector */}
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-gray-400" />
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="colabtech.co">colabtech.co</SelectItem>
                  <SelectItem value="example.com">example.com</SelectItem>
                  <SelectItem value="mysite.dev">mysite.dev</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Date Selector */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Bell className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">K</span>
              </div>
              <span className="text-white text-sm font-medium">Kartik Pal</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Alert Banner - Only show when no data */}
        {!loading && metrics && metrics.visitors.value === 0 && (
          <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 border border-yellow-600 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-yellow-100 font-semibold mb-1">Awaiting the first event...</h3>
              <ol className="text-yellow-200 text-sm space-y-1">
                <li>1. Install the script using <span className="underline cursor-pointer hover:text-yellow-100">the tracking code</span></li>
                <li>2. Visit {selectedSite} to register the first event yourself</li>
                <li>3. Still not working? <span className="underline cursor-pointer hover:text-yellow-100">Contact support</span></li>
              </ol>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <MetricCard
            title="Visitors"
            value={loading ? "—" : (metrics?.visitors.value || 0).toLocaleString()}
            change={metrics?.visitors.change}
            trend={metrics?.visitors.trend}
            icon={<Users className="h-4 w-4" />}
            loading={loading}
          />
          <MetricCard
            title="Page Views"
            value={loading ? "—" : (metrics?.pageviews.value || 0).toLocaleString()}
            change={metrics?.pageviews.change}
            trend={metrics?.pageviews.trend}
            icon={<Eye className="h-4 w-4" />}
            loading={loading}
          />
          <MetricCard
            title="Revenue"
            value={loading ? "—" : `$${(metrics?.revenue.value || 0).toLocaleString()}`}
            change={metrics?.revenue.change}
            trend={metrics?.revenue.trend}
            icon={<DollarSign className="h-4 w-4" />}
            loading={loading}
          />
          <MetricCard
            title="Bounce Rate"
            value={loading ? "—" : `${((metrics?.bounceRate.value || 0) * 100).toFixed(1)}%`}
            change={metrics?.bounceRate.change}
            trend={metrics?.bounceRate.trend}
            icon={<Target className="h-4 w-4" />}
            loading={loading}
          />
          <MetricCard
            title="Avg. Session"
            value={loading ? "—" : `${Math.floor((metrics?.avgSessionDuration.value || 0) / 60)}m ${(metrics?.avgSessionDuration.value || 0) % 60}s`}
            change={metrics?.avgSessionDuration.change}
            trend={metrics?.avgSessionDuration.trend}
            icon={<Clock className="h-4 w-4" />}
            loading={loading}
          />
          <MetricCard
            title="Live Visitors"
            value={loading ? "—" : "0"}
            icon={<Zap className="h-4 w-4" />}
            loading={loading}
            isLive
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Chart */}
          <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Analytics Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formatChartData(chartData)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="visitors" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                        name="Visitors"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="pageviews" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                        name="Page Views"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <TrafficSourceCard sources={trafficSources} loading={loading} />
        </div>

        {/* Bottom Analytics Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Referrer Analytics */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Referrer Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="referrer">
                <TabsList className="bg-gray-700 mb-4">
                  <TabsTrigger value="referrer" className="text-gray-300">Referrer</TabsTrigger>
                  <TabsTrigger value="campaign" className="text-gray-300">Campaign</TabsTrigger>
                  <TabsTrigger value="utm" className="text-gray-300">UTM Sources</TabsTrigger>
                </TabsList>
                <TabsContent value="referrer">
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-8 bg-gray-700 rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : trafficSources.length > 0 ? (
                    <div className="space-y-3">
                      {trafficSources.slice(0, 5).map((source) => (
                        <div key={source.name} className="flex justify-between items-center p-3 bg-gray-750 rounded-lg">
                          <span className="text-gray-300">{source.name}</span>
                          <div className="text-right">
                            <div className="text-white font-medium">{source.visitors}</div>
                            <div className="text-gray-400 text-sm">{source.percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No referrer data available</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="campaign">
                  <div className="text-center py-8">
                    <p className="text-gray-400">No campaign data available</p>
                  </div>
                </TabsContent>
                <TabsContent value="utm">
                  <div className="text-center py-8">
                    <p className="text-gray-400">No UTM data available</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Page Analytics */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Page Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pages">
                <TabsList className="bg-gray-700 mb-4">
                  <TabsTrigger value="pages" className="text-gray-300">Top Pages</TabsTrigger>
                  <TabsTrigger value="entry" className="text-gray-300">Entry Pages</TabsTrigger>
                  <TabsTrigger value="exit" className="text-gray-300">Exit Pages</TabsTrigger>
                </TabsList>
                <TabsContent value="pages">
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-8 bg-gray-700 rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : pageAnalytics.length > 0 ? (
                    <div className="space-y-3">
                      {pageAnalytics.slice(0, 5).map((page) => (
                        <div key={page.path} className="flex justify-between items-center p-3 bg-gray-750 rounded-lg">
                          <div className="flex-1">
                            <span className="text-gray-300 text-sm font-medium">{page.path}</span>
                            <div className="text-gray-400 text-xs mt-1">
                              Bounce: {(page.bounceRate * 100).toFixed(1)}% • 
                              Time: {Math.floor(page.avgTimeOnPage / 60)}m {page.avgTimeOnPage % 60}s
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-medium">{page.views.toLocaleString()}</div>
                            <div className="text-gray-400 text-sm">{page.visitors} visitors</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No page data available</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="entry">
                  <div className="text-center py-8">
                    <p className="text-gray-400">No entry page data available</p>
                  </div>
                </TabsContent>
                <TabsContent value="exit">
                  <div className="text-center py-8">
                    <p className="text-gray-400">No exit page data available</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 