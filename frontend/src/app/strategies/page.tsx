'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/auth'
import StrategyForm from '@/components/StrategyForm'
import StrategyTable, { type Strategy } from '@/components/StrategyTable'
import type { StrategyFormData } from '@/lib/validations/strategy'

export default function StrategiesPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null)
  const [error, setError] = useState<string | null>(null)

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    async function checkAuth() {
      const sess = await getSession()
      if (!sess) {
        router.push('/login')
        return
      }
      setSession(sess)
      await fetchStrategies(sess.accessToken)
    }
    checkAuth()
  }, [router])

  const fetchStrategies = async (token: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${backendUrl}/api/v1/strategies`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStrategies(data)
      } else {
        setError('Failed to load strategies')
      }
    } catch (err) {
      setError('Error connecting to server')
      console.error('Fetch strategies error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateStrategy = async (data: StrategyFormData) => {
    if (!session?.accessToken) return

    try {
      setIsSubmitting(true)
      setError(null)

      const payload = {
        name: data.name,
        strategy_type: data.strategyType,
        config: data.config,
      }

      const url = editingStrategy
        ? `${backendUrl}/api/v1/strategies/${editingStrategy.id}`
        : `${backendUrl}/api/v1/strategies`

      const response = await fetch(url, {
        method: editingStrategy ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        await fetchStrategies(session.accessToken)
        setShowForm(false)
        setEditingStrategy(null)
      } else {
        const error = await response.json()
        setError(error.detail || 'Failed to save strategy')
      }
    } catch (err) {
      setError('Error saving strategy')
      console.error('Save strategy error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (strategy: Strategy) => {
    setEditingStrategy(strategy)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!session?.accessToken) return

    try {
      const response = await fetch(`${backendUrl}/api/v1/strategies/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      })

      if (response.ok) {
        await fetchStrategies(session.accessToken)
      } else {
        setError('Failed to delete strategy')
      }
    } catch (err) {
      setError('Error deleting strategy')
      console.error('Delete strategy error:', err)
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    if (!session?.accessToken) return

    try {
      const strategy = strategies.find((s) => s.id === id)
      if (!strategy) return

      const response = await fetch(`${backendUrl}/api/v1/strategies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          name: strategy.name,
          strategy_type: strategy.strategy_type,
          config: strategy.config,
        }),
      })

      if (response.ok) {
        await fetchStrategies(session.accessToken)
      }
    } catch (err) {
      console.error('Toggle active error:', err)
    }
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="rounded-full w-12 h-12 border-2 border-white shadow-md"
                />
              ) : (
                <div className="rounded-full w-12 h-12 bg-white flex items-center justify-center text-blue-600 font-bold text-xl border-2 border-white shadow-md">
                  {session.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-white">Strategy Management</h1>
                <p className="text-blue-100 text-sm">{session.user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/settings')}
                className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors font-medium"
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">My Strategies</h2>
          <button
            onClick={() => {
              setShowForm(!showForm)
              setEditingStrategy(null)
            }}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            {showForm ? 'Cancel' : '+ New Strategy'}
          </button>
        </div>

        {/* Strategy Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {editingStrategy ? 'Edit Strategy' : 'Create New Strategy'}
            </h3>
            <StrategyForm
              onSubmit={handleCreateStrategy}
              initialData={
                editingStrategy
                  ? {
                      name: editingStrategy.name,
                      strategyType: editingStrategy.strategy_type as any,
                      config: editingStrategy.config,
                    }
                  : undefined
              }
              isLoading={isSubmitting}
            />
          </div>
        )}

        {/* Strategy Table */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <StrategyTable
            strategies={strategies}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  )
}
