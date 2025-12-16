'use client'

import { ReactNode } from 'react'
import { ConnectionHealthBadge } from '@/components/ConnectionHealth'

interface AppLayoutProps {
  children: ReactNode
  session: any
  currentPage?: string
  onSignOut?: () => void
}

export default function AppLayout({ children, session, currentPage = 'dashboard', onSignOut }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e]">
      {/* Header - Sticky */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/dashboard" className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-pink-400 dark:to-purple-400">
                  QuantPro
                </h1>
                <p className="text-xs font-semibold text-gray-400 tracking-wider">
                  Algo Edge for the Elites
                </p>
              </a>
            </div>
            <div className="flex items-center gap-4">
              <ConnectionHealthBadge />
              <button className="p-2 text-gray-300 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              {session?.user?.image ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">Hello,</span>
                  <span className="text-sm text-white font-medium">{session.user.name?.split(' ')[0]}</span>
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="rounded-full w-10 h-10 border-2 border-white/20"
                  />
                </div>
              ) : (
                <div className="rounded-full w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Layout with Sidebar */}
      <div className="flex">
        {/* Left Sidebar Navigation */}
        <aside className="w-64 bg-black/20 backdrop-blur-xl border-r border-white/10 min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4 space-y-2">
            <a
              href="/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white font-medium backdrop-blur-sm border border-purple-500/30'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <span>📊</span>
              <span>Dashboard</span>
            </a>
            <a
              href="/strategies"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                currentPage === 'strategies'
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white font-medium backdrop-blur-sm border border-purple-500/30'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <span>⚙️</span>
              <span>Strategies</span>
            </a>
            <a
              href="/marketplace"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                currentPage === 'marketplace'
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white font-medium backdrop-blur-sm border border-purple-500/30'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <span>🏪</span>
              <span>Marketplace</span>
            </a>
            <a
              href="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                currentPage === 'admin'
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white font-medium backdrop-blur-sm border border-purple-500/30'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <span>🔧</span>
              <span>Admin</span>
            </a>
            <a
              href="/settings"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                currentPage === 'settings'
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white font-medium backdrop-blur-sm border border-purple-500/30'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <span>🔐</span>
              <span>Broker Setup</span>
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
