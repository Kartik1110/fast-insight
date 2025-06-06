import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BarChart3, Zap, Shield, Globe } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="px-4 py-6 lg:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">FastInsight</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="px-4 py-12 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Privacy-First Web Analytics
              <span className="text-blue-600"> That Actually Matter</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Track the full journey from first click to revenue with our lightweight, 
              GDPR-compliant analytics platform. Get actionable insights, not vanity metrics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/dashboard">View Demo Dashboard</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/auth/register">Start Free Trial</Link>
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                &lt; 4kB tracking script with zero impact on your site&apos;s performance
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy Compliant</h3>
              <p className="text-gray-600">
                GDPR & CCPA compliant by default. No cookies, no tracking across sites
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Revenue Focus</h3>
              <p className="text-gray-600">
                Track revenue attribution and see which channels actually drive growth
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
