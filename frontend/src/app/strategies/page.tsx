'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/auth'
import StrategyForm from '@/components/StrategyForm'
import StrategyTable, { type Strategy } from '@/components/StrategyTable'
import ShareModal from '@/components/ShareModal'
import { SkeletonTable } from '@/components/SkeletonLoader'
import type { StrategyFormData } from '@/lib/validations/strategy'
import DashboardLayout from '@/components/DashboardLayout'

export default function StrategiesPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [sharingStrategy, setSharingStrategy] = useState<Strategy | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [backtestModalOpen, setBacktestModalOpen] = useState(false)
  const [backtestStrategy, setBacktestStrategy] = useState<Strategy | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('1M')
  const [isBacktesting, setIsBacktesting] = useState(false)

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    async function checkAuth() {
      const sess = await getSession()
      if (!sess) {
        router.push('/login')
        return
      }
      setSession(sess)
      if (sess.accessToken) {
        await fetchStrategies(sess.accessToken)
      }
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

  const handleShare = (strategy: Strategy) => {
    setSharingStrategy(strategy)
    setShareModalOpen(true)
  }

  const handleBacktest = (strategy: Strategy) => {
    setBacktestStrategy(strategy)
    setBacktestModalOpen(true)
  }

  const handleSubmitBacktest = async () => {
    if (!session?.accessToken || !backtestStrategy) return

    try {
      setIsBacktesting(true)
      const response = await fetch(`${backendUrl}/api/v1/backtest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          strategy_id: backtestStrategy.id,
          time_range: selectedTimeRange,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Backtest completed!\n\nTotal Trades: ${data.total_trades || 0}\nWin Rate: ${data.win_rate || 0}%\nP&L: ₹${data.total_pnl || 0}`)
        setBacktestModalOpen(false)
      } else {
        setError('Failed to run backtest')
      }
    } catch (err) {
      setError('Error running backtest')
      console.error('Backtest error:', err)
    } finally {
      setIsBacktesting(false)
    }
  }

  const handleShareSuccess = (url: string) => {
    setShareUrl(url)
    setTimeout(() => setShareUrl(null), 10000) // Clear after 10 seconds
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
    <DashboardLayout session={session} currentPage="strategies">
      {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
            <p className="text-red-200 text-sm font-medium">{error}</p>
          </div>
        )}

        {shareUrl && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl backdrop-blur-sm">
            <p className="text-green-200 text-sm font-medium mb-2">
              ✅ Strategy shared successfully!
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-white/20 rounded-lg text-sm bg-white/5 text-white backdrop-blur-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl)
                  alert('Link copied to clipboard!')
                }}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors text-sm font-medium"
              >
                Copy Link
              </button>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">My Strategies</h2>
          <button
            onClick={() => {
              setShowForm(!showForm)
              setEditingStrategy(null)
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-colors shadow-lg"
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

        {/* Strategy Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              </div>
            ))}
          </div>
        ) : strategies.length === 0 ? (
          <div className="bg-white dark:bg-white/5 rounded-2xl p-12 border border-gray-200 dark:border-white/10 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No strategies yet. Create your first strategy!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategies.map((strategy) => (
              <div
                key={strategy.id}
                className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all hover:shadow-lg"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{strategy.name}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300">
                      {strategy.strategy_type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Edit Icon */}
                    <button
                      onClick={() => handleEdit(strategy)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {/* Share Icon */}
                    <button
                      onClick={() => handleShare(strategy)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors"
                      title="Share"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                    {/* Delete Icon */}
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this strategy?')) {
                          handleDelete(strategy.id)
                        }
                      }}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Strategy Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Instrument:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{strategy.config?.instrument || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Lot Size:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{strategy.config?.lotSize || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <button
                      onClick={() => handleToggleActive(strategy.id, !strategy.is_active)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        strategy.is_active
                          ? 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-500/30'
                          : 'bg-gray-100 dark:bg-gray-500/20 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500/30'
                      }`}
                    >
                      {strategy.is_active ? '● Active' : '○ Inactive'}
                    </button>
                  </div>
                </div>

                {/* Backtest Button */}
                <button
                  onClick={() => handleBacktest(strategy)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Backtest Strategy
                </button>
              </div>
            ))}
          </div>
        )}

      {/* Share Modal */}
      {sharingStrategy && session?.accessToken && (
        <ShareModal
          strategyId={sharingStrategy.id}
          strategyName={sharingStrategy.name}
          accessToken={session.accessToken}
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false)
            setSharingStrategy(null)
          }}
          onSuccess={handleShareSuccess}
        />
      )}

      {/* Backtest Modal */}
      {backtestModalOpen && backtestStrategy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Backtest Strategy</h3>
              <button
                onClick={() => setBacktestModalOpen(false)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Strategy:</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{backtestStrategy.name}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Time Range
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: '1 Month', value: '1M' },
                  { label: '3 Months', value: '3M' },
                  { label: '6 Months', value: '6M' },
                  { label: '1 Year', value: '1Y' },
                  { label: '2 Years', value: '2Y' },
                  { label: '5 Years', value: '5Y' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedTimeRange(option.value)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      selectedTimeRange === option.value
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedTimeRange('ALL')}
                  className={`col-span-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    selectedTimeRange === 'ALL'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setBacktestModalOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitBacktest}
                disabled={isBacktesting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isBacktesting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Running...
                  </>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
