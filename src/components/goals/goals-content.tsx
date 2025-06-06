"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Target, TrendingUp, Edit, Trash2 } from 'lucide-react'
import { formatNumber, formatPercentage, getRelativeTime } from '@/lib/utils'

// Mock goals data
const mockGoals = [
  {
    id: 'goal_1',
    name: 'Newsletter Signup',
    type: 'CUSTOM_EVENT',
    conditions: { event: 'signup' },
    value: null,
    isActive: true,
    createdAt: new Date('2024-01-15'),
    stats: {
      conversions: 324,
      conversionRate: 0.025,
      totalValue: 0
    }
  },
  {
    id: 'goal_2',
    name: 'Purchase Completed',
    type: 'REVENUE',
    conditions: { event: 'purchase' },
    value: 49.99,
    isActive: true,
    createdAt: new Date('2024-02-01'),
    stats: {
      conversions: 89,
      conversionRate: 0.007,
      totalValue: 4449.11
    }
  },
  {
    id: 'goal_3',
    name: 'Contact Form',
    type: 'PAGE_VIEW',
    conditions: { path: '/thank-you' },
    value: null,
    isActive: true,
    createdAt: new Date('2024-03-01'),
    stats: {
      conversions: 156,
      conversionRate: 0.012,
      totalValue: 0
    }
  }
]

export function GoalsContent() {
  const [goals] = useState(mockGoals)
  const [showAddGoal, setShowAddGoal] = useState(false)

  if (showAddGoal) {
    return <AddGoalForm onBack={() => setShowAddGoal(false)} />
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {goals.length} goal{goals.length !== 1 ? 's' : ''} configured
        </div>
        <Button onClick={() => setShowAddGoal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Goals Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(goals.reduce((sum, goal) => sum + goal.stats.conversions, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all goals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(
                goals.reduce((sum, goal) => sum + goal.stats.conversionRate, 0) / goals.length
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Average across goals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${formatNumber(goals.reduce((sum, goal) => sum + goal.stats.totalValue, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              From revenue goals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal) => (
          <Card key={goal.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-semibold">{goal.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {goal.type.replace('_', ' ')}
                        </span>
                        <span>•</span>
                        <span>Created {getRelativeTime(goal.createdAt)}</span>
                        {!goal.isActive && (
                          <>
                            <span>•</span>
                            <span className="text-red-600">Inactive</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  {/* Stats */}
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Conversions</div>
                    <div className="text-lg font-semibold">
                      {formatNumber(goal.stats.conversions)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Rate</div>
                    <div className="text-lg font-semibold">
                      {formatPercentage(goal.stats.conversionRate)}
                    </div>
                  </div>
                  {goal.type === 'REVENUE' && (
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Value</div>
                      <div className="text-lg font-semibold">
                        ${formatNumber(goal.stats.totalValue)}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Goal Conditions */}
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  <strong>Trigger:</strong>{' '}
                  {goal.type === 'PAGE_VIEW' && `Page visit: ${goal.conditions.path}`}
                  {goal.type === 'CUSTOM_EVENT' && `Custom event: ${goal.conditions.event}`}
                  {goal.type === 'REVENUE' && `Revenue event: ${goal.conditions.event}`}
                  {goal.value && ` (Value: $${goal.value})`}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {goals.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
            <p className="text-gray-600 mb-4">
              Set up your first conversion goal to track what matters most
            </p>
            <Button onClick={() => setShowAddGoal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AddGoalForm({ onBack }: { onBack: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'PAGE_VIEW',
    conditions: '',
    value: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Add goal creation logic
    console.log('Creating goal:', formData)
    onBack()
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <CardTitle>Create New Goal</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Newsletter Signup"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PAGE_VIEW">Page View</option>
              <option value="CUSTOM_EVENT">Custom Event</option>
              <option value="REVENUE">Revenue Event</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.type === 'PAGE_VIEW' ? 'Page Path' : 'Event Name'}
            </label>
            <input
              type="text"
              value={formData.conditions}
              onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={
                formData.type === 'PAGE_VIEW' 
                  ? '/thank-you' 
                  : formData.type === 'CUSTOM_EVENT'
                  ? 'signup'
                  : 'purchase'
              }
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.type === 'PAGE_VIEW' 
                ? 'The page path that indicates a conversion'
                : 'The custom event name to track'
              }
            </p>
          </div>

          {formData.type === 'REVENUE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Value (optional)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="49.99"
              />
              <p className="text-xs text-gray-500 mt-1">
                Default monetary value for this conversion
              </p>
            </div>
          )}

          <div className="flex space-x-4">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Goal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 