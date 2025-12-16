'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/auth'
import MarketplaceGrid, { type SharedStrategy } from '@/components/MarketplaceGrid'
import { SkeletonGrid } from '@/components/SkeletonLoader'
import DashboardLayout from '@/components/DashboardLayout'

export default function MarketplacePage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [strategies, setStrategies] = useState<SharedStrategy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'downloads' | 'views' | 'recent'>('downloads')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [backtestModalOpen, setBacktestModalOpen] = useState(false)
  const [backtestStrategy, setBacktestStrategy] = useState<SharedStrategy | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('1M')
  const [isBacktesting, setIsBacktesting] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      try {
        const sess = await getSession()
        if (!sess) {
          router.push('/login')
          return
        }
        setSession(sess)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    if (!session) return
    loadStrategies()
  }, [session, sortBy])

  const loadStrategies = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/marketplace?sort=${sortBy}`
      )

      if (!response.ok) {
        throw new Error('Failed to load marketplace strategies')
      }

      const data = await response.json()
      setStrategies(data)
    } catch (error) {
      console.error('Error loading strategies:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClone = async (shareId: string) => {
    if (!session?.accessToken) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/marketplace/${shareId}/clone`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to clone strategy')
      }

      const clonedStrategy = await response.json()
      setSuccessMessage(
        `Successfully cloned "${clonedStrategy.name}"! Check your strategies page.`
      )

      // Reload to update download count
      loadStrategies()

      // Clear message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleBacktest = (strategy: SharedStrategy) => {
    setBacktestStrategy(strategy)
    setBacktestModalOpen(true)
  }

  const handleSubmitBacktest = async () => {
    if (!session?.accessToken || !backtestStrategy) return

    try {
      setIsBacktesting(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/backtest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          strategy_type: backtestStrategy.strategy_type,
          config: backtestStrategy.config,
          time_range: selectedTimeRange,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Backtest completed!\n\nTotal Trades: ${data.total_trades || 0}\nWin Rate: ${data.win_rate || 0}%\nP&L: ₹${data.total_pnl || 0}`)
        setBacktestModalOpen(false)
      } else {
        alert('Failed to run backtest')
      }
    } catch (err) {
      alert('Error running backtest')
      console.error('Backtest error:', err)
    } finally {
      setIsBacktesting(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout session={session} currentPage="marketplace">
      {/* Page Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Strategy Marketplace</h2>
        <p className="text-gray-600 dark:text-gray-400">Discover and clone strategies shared by the community</p>
      </div>

      {/* Success Message */}
      {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl backdrop-blur-sm text-green-200">
            ✅ {successMessage}
          </div>
        )}

        {/* Sort Controls */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('downloads')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  sortBy === 'downloads'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:border-white/20'
                }`}
              >
                Most Downloaded
              </button>
              <button
                onClick={() => setSortBy('views')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  sortBy === 'views'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:border-white/20'
                }`}
              >
                Most Viewed
              </button>
              <button
                onClick={() => setSortBy('recent')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  sortBy === 'recent'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:border-white/20'
                }`}
              >
                Most Recent
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-700 dark:text-gray-300">
            {strategies.length} {strategies.length === 1 ? 'strategy' : 'strategies'}
          </div>
        </div>

      {/* Strategies Grid */}
      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : (
        <MarketplaceGrid
          strategies={strategies}
          onClone={handleClone}
          onBacktest={handleBacktest}
          isLoading={isLoading}
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
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">by {backtestStrategy.author_name}</p>
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
