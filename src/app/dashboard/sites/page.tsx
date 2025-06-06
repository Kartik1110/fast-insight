import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { SitesContent } from '@/components/sites/sites-content'

export default function SitesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Websites</h1>
            <p className="text-gray-600 mt-1">
              Manage all your websites and their analytics tracking
            </p>
          </div>
        </div>
        
        <SitesContent />
      </div>
    </DashboardLayout>
  )
} 