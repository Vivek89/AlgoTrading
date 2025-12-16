'use client'

import { signOut, getSession } from '@/auth'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getUserInfo } from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

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
                <h1 className="text-xl font-bold text-white">{session.user?.name}</h1>
                <p className="text-blue-100 text-sm">{session.user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium shadow-md"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Strategies Section */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Trading Strategies</h3>
            <p className="text-gray-600 mb-6">
              Create and manage your automated trading strategies. Configure entry/exit rules, risk management, and more.
            </p>
            <div className="border-t pt-6">
              <a href="/strategies" className="btn-primary inline-block">
                Manage Strategies →
              </a>
            </div>
          </div>

          {/* Broker Credentials Section */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Broker Credentials</h3>
            <p className="text-gray-600 mb-6">
              Add your broker API credentials securely. All sensitive information is encrypted both in transit and at rest.
            </p>
            <div className="border-t pt-6">
              <a href="/settings" className="btn-primary inline-block">
                Manage Credentials →
              </a>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-1 gap-8">

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card text-center">
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-gray-600 text-sm">Active Strategies</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-green-600">0</p>
              <p className="text-gray-600 text-sm">Total Trades</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-purple-600">0</p>
              <p className="text-gray-600 text-sm">Suggestions</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
