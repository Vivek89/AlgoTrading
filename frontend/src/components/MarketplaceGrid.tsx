'use client'

import { useState } from 'react'

export interface SharedStrategy {
  id: string
  share_id: string
  name: string
  strategy_type: string
  config: any
  description: string | null
  author_name: string
  downloads: number
  views: number
  roi_percentage: number | null
  max_drawdown: number | null
  created_at: string
}

interface MarketplaceGridProps {
  strategies: SharedStrategy[]
  onClone: (shareId: string) => Promise<void>
  onBacktest: (strategy: SharedStrategy) => void
  isLoading?: boolean
}

export default function MarketplaceGrid({
  strategies,
  onClone,
  onBacktest,
  isLoading,
}: MarketplaceGridProps) {
  const [cloningId, setCloningId] = useState<string | null>(null)

  const handleClone = async (shareId: string) => {
    setCloningId(shareId)
    try {
      await onClone(shareId)
    } finally {
      setCloningId(null)
    }
  }

  const getStrategyTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      straddle: 'bg-purple-100 text-purple-800',
      strangle: 'bg-blue-100 text-blue-800',
      iron_condor: 'bg-green-100 text-green-800',
      iron_butterfly: 'bg-yellow-100 text-yellow-800',
    }
    return colors[type.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (strategies.length === 0) {
    return (
      <div className="bg-white dark:bg-white/5 rounded-2xl p-12 border border-gray-200 dark:border-white/10 text-center">
        <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Strategies Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Be the first to share a strategy with the community!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {strategies.map((strategy) => (
        <div
          key={strategy.id}
          className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all hover:shadow-lg"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {strategy.name}
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300">
                {strategy.strategy_type.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Author */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium">{strategy.author_name}</span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {strategy.description || 'No description provided.'}
          </p>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {strategy.roi_percentage !== null && (
              <div className="bg-green-50 dark:bg-green-500/10 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-600 dark:text-gray-400">ROI</div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {strategy.roi_percentage > 0 ? '+' : ''}
                  {strategy.roi_percentage}%
                </div>
              </div>
            )}
            {strategy.max_drawdown !== null && (
              <div className="bg-red-50 dark:bg-red-500/10 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-600 dark:text-gray-400">Max DD</div>
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  {strategy.max_drawdown}%
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4 pt-3 border-t border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{strategy.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{strategy.downloads}</span>
            </div>
            <div className="text-xs">
              {new Date(strategy.created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onBacktest(strategy)}
              className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Backtest
            </button>
            <button
              onClick={() => handleClone(strategy.share_id)}
              disabled={cloningId === strategy.share_id}
              className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {cloningId === strategy.share_id ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cloning...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Clone
                </>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
