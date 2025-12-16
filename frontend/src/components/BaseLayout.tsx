'use client'

import { ReactNode } from 'react'
import { APP_INFO, NAV_ITEMS, ROUTES } from '@/lib/constants'
import { ConnectionHealthBadge } from '@/components/ConnectionHealth'

interface BaseLayoutProps {
  children: ReactNode
  session: any
  currentPage: string
  showThemeToggle?: boolean
  onThemeToggle?: () => void
  theme?: string
}

/**
 * BaseLayout - Shared layout component for all pages
 * Provides common header, navigation, and user menu structure
 */
export default function BaseLayout({
  children,
  session,
  currentPage,
  showThemeToggle = false,
  onThemeToggle,
  theme
}: BaseLayoutProps) {
  return (
    <div className="bg-app">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-header">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <a href={ROUTES.DASHBOARD} className="flex flex-col">
                <h1 className="text-2xl font-bold text-brand-gradient">
                  {APP_INFO.NAME}
                </h1>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 tracking-wider">
                  {APP_INFO.TAGLINE}
                </p>
              </a>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              <ConnectionHealthBadge />

              {/* Notification Bell */}
              <button className="p-2 transition-colors text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              {/* User Avatar */}
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="rounded-full w-10 h-10 border-2 border-gray-200 dark:border-white/20"
                />
              ) : (
                <div className="avatar-gradient">
                  {session.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area with Sidebar */}
      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white/50 backdrop-blur-xl border-r border-gray-200 dark:bg-black/20 dark:border-white/10 min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4 space-y-2">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className={currentPage === item.key ? 'nav-item-active' : 'nav-item'}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
