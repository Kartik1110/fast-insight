"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber, formatCurrency, formatPercentage } from '@/lib/utils'
import { TrendingUp, TrendingDown, Users, Eye, DollarSign, Target } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useEffect, useState } from 'react'
import { AnalyticsMetrics, ChartData, TrafficSource } from '@/lib/analytics'

interface MetricCardProps {
  title: string
  value: string
  change: number
  trend: 'up' | 'down'
  icon: React.ReactNode
}

function MetricCard({ title, value, change, trend, icon }: MetricCardProps) {
  const isPositive = trend === 'up'
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className="text-gray-400">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="flex items-center mt-1">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-sm text-gray-500 ml-1">vs last period</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function AnalyticsOverview() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('🔍 Fetching real analytics data...')
        
        // Fetch real analytics data only (no seeding)
        const [metricsRes, chartRes, trafficRes] = await Promise.all([
          fetch('/api/analytics/metrics?mode=real'),
          fetch('/api/analytics/chart?mode=real'),
          fetch('/api/analytics/traffic-sources?mode=real')
        ])
        
        if (metricsRes.ok) {
          const metricsData = await metricsRes.json()
          console.log('📈 Real metrics data:', metricsData)
          setMetrics(metricsData)
        }
        
        if (chartRes.ok) {
          const chartData = await chartRes.json()
          console.log('📊 Real chart data:', chartData)
          setChartData(chartData)
        }
        
        if (trafficRes.ok) {
          const trafficData = await trafficRes.json()
          console.log('🌐 Real traffic data:', trafficData)
          setTrafficSources(trafficData)
        }
        
      } catch (error) {
        console.error('Failed to fetch analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-4">
          <p className="text-blue-600">🔄 Loading real analytics...</p>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No real analytics data yet. Visit the test page to generate events.</p>
        <a href="/test-page.html" className="text-blue-600 hover:underline">Go to Test Page</a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total Visitors"
          value={formatNumber(metrics.visitors.value)}
          change={metrics.visitors.change}
          trend={metrics.visitors.trend}
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Page Views"
          value={formatNumber(metrics.pageviews.value)}
          change={metrics.pageviews.change}
          trend={metrics.pageviews.trend}
          icon={<Eye className="h-4 w-4" />}
        />
        <MetricCard
          title="Revenue"
          value={formatCurrency(metrics.revenue.value)}
          change={metrics.revenue.change}
          trend={metrics.revenue.trend}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          title="Bounce Rate"
          value={formatPercentage(metrics.bounceRate.value)}
          change={metrics.bounceRate.change}
          trend={metrics.bounceRate.trend}
          icon={<Target className="h-4 w-4" />}
        />
        <MetricCard
          title="Avg. Session Duration"
          value={`${Math.floor(metrics.avgSessionDuration.value / 60)}m ${metrics.avgSessionDuration.value % 60}s`}
          change={metrics.avgSessionDuration.change}
          trend={metrics.avgSessionDuration.trend}
          icon={<Target className="h-4 w-4" />}
        />
        <MetricCard
          title="Conversion Rate"
          value={formatPercentage(metrics.conversionRate.value)}
          change={metrics.conversionRate.change}
          trend={metrics.conversionRate.trend}
          icon={<Target className="h-4 w-4" />}
        />
      </div>

      {/* Charts Section - Only show if we have data */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visitors & Pageviews Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Visitors & Page Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="visitors" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      name="Visitors"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pageviews" 
                      stroke="#10b981" 
                      strokeWidth={2} 
                      name="Page Views"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trafficSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{source.name}</p>
                        <p className="text-sm text-gray-500">{formatNumber(source.visitors)} visitors</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(source.percentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {source.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Chart - Only show if we have data */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="revenue" fill="#f59e0b" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 