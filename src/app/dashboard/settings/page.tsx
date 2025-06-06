import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { SettingsContent } from '@/components/settings/settings-content'

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">
              Configure your analytics and manage your account
            </p>
          </div>
        </div>
        
        <SettingsContent />
      </div>
    </DashboardLayout>
  )
} 