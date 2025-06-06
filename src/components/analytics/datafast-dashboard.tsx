"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ChevronLeft, ChevronRight, Globe, AlertTriangle } from 'lucide-react'

// Mock data for the chart
const chartData = [
  { time: '2am', visitors: 0 },
  { time: '3am', visitors: 0 },
  { time: '4am', visitors: 0 },
  { time: '5am', visitors: 0 },
  { time: '6am', visitors: 0 },
  { time: '7am', visitors: 0 },
  { time: '8am', visitors: 0 },
  { time: '9am', visitors: 0 },
  { time: '10am', visitors: 0 },
  { time: '11am', visitors: 0 },
  { time: '12pm', visitors: 0 },
  { time: '1pm', visitors: 0 },
  { time: '2pm', visitors: 0 },
  { time: '3pm', visitors: 0 },
  { time: '4pm', visitors: 0 },
  { time: '5pm', visitors: 0 },
  { time: '6pm', visitors: 0 },
  { time: '7pm', visitors: 0 },
  { time: '8pm', visitors: 0 },
  { time: '9pm', visitors: 0 },
  { time: '10pm', visitors: 0 },
  { time: '11pm', visitors: 0 },
]

interface MetricCardProps {
  title: string
  value: string
  isLive?: boolean
}

function MetricCard({ title, value, isLive }: MetricCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{title}</span>
        {isLive && <div className="flex items-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
        </div>}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  )
}

export function DataFastDashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="text-orange-500 text-xl">📊</div>
              <h1 className="text-xl font-semibold text-white">DataFast</h1>
            </div>
            
            {/* Site Selector */}
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-gray-400" />
              <Select defaultValue="colabtech.co">
                <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="colabtech.co">colabtech.co</SelectItem>
                  <SelectItem value="example.com">example.com</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Date Selector */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Select defaultValue="today">
                <SelectTrigger className="w-24 bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">K</span>
            </div>
            <span className="text-white text-sm">Kartik Pal</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Alert Banner */}
        <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 mb-6 flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-yellow-200 font-medium mb-1">Awaiting the first event...</h3>
            <ol className="text-yellow-300 text-sm space-y-1">
              <li>1. Install the script using <span className="underline cursor-pointer">the tracking code</span></li>
              <li>2. Visit colabtech.co to register the first event yourself</li>
              <li>3. Still not working? <span className="underline cursor-pointer">Contact support</span></li>
            </ol>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <MetricCard title="Visitors" value="—" />
          <MetricCard title="Revenue" value="—" />
          <MetricCard title="Revenue/visitor" value="—" />
          <MetricCard title="Conversion rate" value="—" />
          <MetricCard title="Bounce rate" value="—" />
          <MetricCard title="Session time" value="—" />
          <MetricCard title="Visitors now" value="0" isLive />
        </div>

        {/* Chart */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    interval={2}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    domain={[0, 5]}
                    ticks={[0, 1, 2, 3, 4, 5]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Referrer Section */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Referrer</CardTitle>
              <Tabs defaultValue="referrer" className="mt-2">
                <TabsList className="bg-gray-700">
                  <TabsTrigger value="referrer" className="text-gray-300">Referrer</TabsTrigger>
                  <TabsTrigger value="campaign" className="text-gray-300">Campaign</TabsTrigger>
                  <TabsTrigger value="utm" className="text-gray-300">UTM</TabsTrigger>
                </TabsList>
                <TabsContent value="referrer" className="mt-4">
                  <div className="text-center py-8">
                    <p className="text-gray-400">No data</p>
                  </div>
                </TabsContent>
                <TabsContent value="campaign" className="mt-4">
                  <div className="text-center py-8">
                    <p className="text-gray-400">No data</p>
                  </div>
                </TabsContent>
                <TabsContent value="utm" className="mt-4">
                  <div className="text-center py-8">
                    <p className="text-gray-400">No data</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>

          {/* Page Section */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Page</CardTitle>
              <Tabs defaultValue="entry" className="mt-2">
                <TabsList className="bg-gray-700">
                  <TabsTrigger value="entry" className="text-gray-300">Entry page</TabsTrigger>
                  <TabsTrigger value="exit" className="text-gray-300">Exit link</TabsTrigger>
                </TabsList>
                <TabsContent value="entry" className="mt-4">
                  <div className="text-center py-8">
                    <p className="text-gray-400">No data</p>
                  </div>
                </TabsContent>
                <TabsContent value="exit" className="mt-4">
                  <div className="text-center py-8">
                    <p className="text-gray-400">No data</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  )
} 