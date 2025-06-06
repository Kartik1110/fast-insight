"use client"

import { useState, useEffect } from 'react'

export default function TestPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔄 Test page useEffect running...')
    
    async function fetchData() {
      try {
        const response = await fetch('/api/analytics/metrics?mode=sample')
        const result = await response.json()
        console.log('✅ Test data received:', result)
        setData(result)
      } catch (error) {
        console.error('❌ Test error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <p className="mb-4">✅ API call successful!</p>
          <pre className="bg-gray-800 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
} 