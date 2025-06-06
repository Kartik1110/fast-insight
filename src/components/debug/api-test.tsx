"use client"

import { useState, useEffect } from 'react'

interface TestResults {
  metrics?: any
  chart?: any
}

export function ApiTest() {
  const [status, setStatus] = useState<string>('Testing...')
  const [results, setResults] = useState<TestResults>({})

  useEffect(() => {
    async function testApis() {
      try {
        console.log('Testing APIs...')
        
        // Test metrics API
        const metricsRes = await fetch('/api/analytics/metrics?mode=sample')
        console.log('Metrics response status:', metricsRes.status)
        
        if (metricsRes.ok) {
          const metricsData = await metricsRes.json()
          console.log('Metrics data:', metricsData)
          setResults(prev => ({ ...prev, metrics: metricsData }))
        } else {
          console.error('Metrics API failed:', metricsRes.status)
          setResults(prev => ({ ...prev, metrics: `Error: ${metricsRes.status}` }))
        }
        
        // Test chart API
        const chartRes = await fetch('/api/analytics/chart?mode=sample')
        console.log('Chart response status:', chartRes.status)
        
        if (chartRes.ok) {
          const chartData = await chartRes.json()
          console.log('Chart data:', chartData)
          setResults(prev => ({ ...prev, chart: chartData }))
        } else {
          console.error('Chart API failed:', chartRes.status)
          setResults(prev => ({ ...prev, chart: `Error: ${chartRes.status}` }))
        }
        
        setStatus('API test completed')
        
      } catch (error) {
        console.error('API test failed:', error)
        setStatus(`Error: ${error}`)
      }
    }

    testApis()
  }, [])

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h2 className="text-lg font-bold mb-4">API Test Debug</h2>
      <p className="mb-4">Status: {status}</p>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Metrics Result:</h3>
          <pre className="text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded overflow-auto">
            {JSON.stringify(results.metrics, null, 2)}
          </pre>
        </div>
        
        <div>
          <h3 className="font-semibold">Chart Result:</h3>
          <pre className="text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded overflow-auto">
            {JSON.stringify(results.chart, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
} 