'use client'

import { getSession } from '@/auth'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getUserInfo } from '@/lib/api'
import { useMarketWebSocket } from '@/hooks/useMarketWebSocket'
import DashboardLayout from '@/components/DashboardLayout'

export default function DashboardPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize WebSocket connection for real-time data
  const { isConnected } = useMarketWebSocket()

  useEffect(() => {
    async function checkAuth() {
      try {
        const sess = await getSession()
        if (!sess) {
          router.push('/login')
          return
        }
        setSession(sess)
        // Optionally load user info
        // const info = await getUserInfo(sess)
        // setUserInfo(info)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <DashboardLayout session={session} currentPage="dashboard">

          {/* Quick Stats - Top Section */}
          <div className="backdrop-blur-xl rounded-2xl border transition-colors bg-white border-gray-200 dark:bg-white/5 dark:border-white/10 p-6 mb-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Active Strategies</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total Trades</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">0</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Win Rate</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">0%</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total P&L</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">₹0</p>
              </div>
            </div>
          </div>

          {/* Deployed Strategies Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Deployed Strategies</h2>
              <span className="text-sm text-gray-600 dark:text-gray-400">Today's Performance</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Deployed Strategy Card 1 */}
              <div className="backdrop-blur-xl rounded-2xl p-5 border transition-colors bg-white border-gray-200 hover:border-purple-500 dark:bg-white/5 dark:border-white/10 dark:hover:border-purple-500">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      MS
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Mean Reversion</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Nifty 50</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
                    Live
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Today's P&L</span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">+₹12,450</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Trades</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Win Rate</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-1.5 mt-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>
              </div>

              {/* Deployed Strategy Card 2 */}
              <div className="backdrop-blur-xl rounded-2xl p-5 border transition-colors bg-white border-gray-200 hover:border-purple-500 dark:bg-white/5 dark:border-white/10 dark:hover:border-purple-500">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      BT
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Breakout Trader</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">BankNifty</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
                    Live
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Today's P&L</span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">+₹8,920</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Trades</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Win Rate</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">80%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-1.5 mt-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full" style={{width: '80%'}}></div>
                  </div>
                </div>
              </div>

              {/* Deployed Strategy Card 3 */}
              <div className="backdrop-blur-xl rounded-2xl p-5 border transition-colors bg-white border-gray-200 hover:border-purple-500 dark:bg-white/5 dark:border-white/10 dark:hover:border-purple-500">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      SC
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Scalper Pro</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Finnifty</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
                    Live
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Today's P&L</span>
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">-₹3,240</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Trades</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Win Rate</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">42%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-1.5 mt-2">
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 h-1.5 rounded-full" style={{width: '42%'}}></div>
                  </div>
                </div>
              </div>

              {/* Deployed Strategy Card 4 */}
              <div className="backdrop-blur-xl rounded-2xl p-5 border transition-colors bg-white border-gray-200 hover:border-purple-500 dark:bg-white/5 dark:border-white/10 dark:hover:border-purple-500">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      OP
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Options Master</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Nifty Options</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
                    Live
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Today's P&L</span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">+₹15,780</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Trades</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">6</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Win Rate</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">83%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-1.5 mt-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full" style={{width: '83%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Section with Trending and Backtest */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Trending Strategy Cards */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Top Trending Strategy</h2>
                <button className="px-4 py-2 rounded-lg text-sm border transition-colors bg-white hover:bg-gray-50 text-gray-700 border-gray-300 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/20">
                  Week ▼
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Strategy Card 1 */}
                <div className="backdrop-blur-xl rounded-2xl p-6 border transition-colors bg-gradient-to-br from-red-50 to-pink-50 border-red-300 dark:from-red-500/20 dark:to-pink-500/20 dark:border-red-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">N</div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Live Market Data</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Nifty 50</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Current Price</p>
                  <div className="flex items-center gap-2 mb-4">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">₹24,185.75</p>
                    <span className="text-red-500 dark:text-red-400 text-sm flex items-center gap-1">
                      ▼ 125.50
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Open: ₹24,311.25</span>
                    <span>Vol: 2.5M</span>
                  </div>
                </div>

                {/* Strategy Card 2 */}
                <div className="backdrop-blur-xl rounded-2xl p-6 border transition-colors bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 dark:from-green-500/20 dark:to-emerald-500/20 dark:border-green-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">B</div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Live Market Data</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">BankNifty</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">Current Price</p>
                  <div className="flex items-center gap-2 mb-4">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">₹52,348.20</p>
                    <span className="text-green-600 dark:text-green-400 text-sm flex items-center gap-1">
                      ▲ 285.40
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Open: ₹52,062.80</span>
                    <span>Vol: 1.8M</span>
                  </div>
                </div>

                {/* Strategy Card 3 */}
                <div className="backdrop-blur-xl rounded-2xl p-6 border transition-colors bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300 dark:from-blue-500/20 dark:to-cyan-500/20 dark:border-blue-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">F</div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Live Market Data</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Finnifty</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Current Price</p>
                  <div className="flex items-center gap-2 mb-4">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">₹23,457.65</p>
                    <span className="text-green-600 dark:text-green-400 text-sm flex items-center gap-1">
                      ▲ 178.30
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Open: ₹23,279.35</span>
                    <span>Vol: 850K</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Backtest Promo Card */}
            <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-2xl p-6 relative overflow-hidden transition-colors">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-3">Backtest</h3>
                <p className="text-white/90 text-sm mb-6">
                  Develop and test strategies using our lightning-fast backtest engine.
                </p>
                <a href="/strategies" className="inline-flex px-6 py-3 rounded-xl font-medium transition-colors items-center gap-2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm dark:bg-black/30 dark:hover:bg-black/40">
                  Create Strategy
                  <span>→</span>
                </a>
              </div>
              <div className="absolute right-0 top-0 w-48 h-full opacity-20">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <path d="M 20 180 L 40 160 L 60 140 L 80 100 L 100 80 L 120 60 L 140 80 L 160 100 L 180 60" fill="none" stroke="white" strokeWidth="4"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Broker Integration Section - Moved to Bottom */}
          <div className="backdrop-blur-xl rounded-2xl border transition-colors bg-white border-gray-200 dark:bg-white/5 dark:border-white/10 p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Connect Broker for Live Trading</h3>
            {/* <p className="text-gray-600 dark:text-gray-400 mb-6">Link your brokerage account to implement strategies in real-time.</p> */}
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-11 gap-6">
              <div className="flex flex-col items-center cursor-pointer group">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2 border-2 border-gray-200 dark:border-gray-700 group-hover:border-green-500 transition-colors">
                  <span className="text-lg font-bold text-green-600">S</span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 text-center">STOXXART</p>
              </div>
              <div className="flex flex-col items-center cursor-pointer group">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-2 border-2 border-gray-200 dark:border-gray-700 group-hover:border-purple-400 transition-colors">
                  <span className="text-lg font-bold text-white">up</span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 text-center">Upstox</p>
              </div>
              <div className="flex flex-col items-center cursor-pointer group">
                <div className="w-16 h-16 bg-orange-400 rounded-full flex items-center justify-center mb-2 border-2 border-gray-200 dark:border-gray-700 group-hover:border-orange-300 transition-colors">
                  <span className="text-lg font-bold text-white">∞</span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 text-center">FINVASIA</p>
              </div>
              <div className="flex flex-col items-center cursor-pointer group">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2 border-2 border-gray-200 dark:border-gray-700 group-hover:border-blue-500 transition-colors">
                  <span className="text-lg font-bold text-blue-600">FF</span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 text-center">FYERS</p>
              </div>
              <div className="flex flex-col items-center cursor-pointer group">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2 border-2 border-gray-200 dark:border-gray-700 group-hover:border-orange-500 transition-colors">
                  <span className="text-lg font-bold text-orange-500">Σ</span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 text-center">XTS</p>
              </div>
              <div className="flex flex-col items-center cursor-pointer group">
                <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 border-2 border-gray-200 dark:border-gray-700 group-hover:border-gray-400 transition-colors">
                  <span className="text-lg font-bold text-gray-700 dark:text-gray-300">B</span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 text-center">Dhan</p>
              </div>
              <div className="flex flex-col items-center cursor-pointer group">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-2 border-2 border-gray-200 dark:border-gray-700 group-hover:border-orange-400 transition-colors">
                  <span className="text-lg font-bold text-white">⬢</span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 text-center">IIFL</p>
              </div>
              <a href="/settings" className="flex flex-col items-center cursor-pointer group">
                <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 border-2 border-gray-200 dark:border-gray-700 group-hover:border-blue-500 transition-colors">
                  <span className="text-lg font-bold text-gray-700 dark:text-gray-300">Z</span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 text-center">Zerodha</p>
              </a>
              <div className="flex flex-col items-center cursor-pointer group">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2 border-2 border-gray-200 dark:border-gray-700 group-hover:border-blue-400 transition-colors">
                  <span className="text-lg font-bold text-blue-400">○</span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 text-center">Alice</p>
              </div>
              <div className="flex flex-col items-center cursor-pointer group">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2 border-2 border-gray-200 dark:border-gray-700 group-hover:border-green-500 transition-colors">
                  <span className="text-lg font-bold text-green-600">▲</span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 text-center">Angel</p>
              </div>
              <div className="flex flex-col items-center cursor-pointer group">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2 border-2 border-gray-200 dark:border-gray-700 group-hover:border-blue-600 transition-colors">
                  <span className="text-lg font-bold text-blue-600">M</span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 text-center">Master Trust</p>
              </div>
            </div>
          </div>
    </DashboardLayout>
  )
}
