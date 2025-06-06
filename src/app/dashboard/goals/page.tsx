import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { GoalsContent } from '@/components/goals/goals-content'

export default function GoalsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
            <p className="text-gray-600 mt-1">
              Track conversions and measure what matters most to your business
            </p>
          </div>
        </div>
        
        <GoalsContent />
      </div>
    </DashboardLayout>
  )
} 