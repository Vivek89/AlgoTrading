'use client'

import { useState, useRef, useEffect } from 'react'
import { signOut } from '@/auth'
import { ConnectionHealthBadge } from '@/components/ConnectionHealth'
import { useTheme } from '@/context/ThemeContext'

interface DashboardLayoutProps {
  children: React.ReactNode
  session: any
  currentPage: 'dashboard' | 'strategies' | 'marketplace' | 'admin' | 'settings'
}

export default function DashboardLayout({ children, session, currentPage }: DashboardLayoutProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await signOut()
  }

  const navItems = [
    { href: '/dashboard', icon: '📊', label: 'Dashboard', key: 'dashboard' },
    { href: '/strategies', icon: '⚙️', label: 'Strategies', key: 'strategies' },
    { href: '/marketplace', icon: '🏪', label: 'Marketplace', key: 'marketplace' },
    { href: '/admin', icon: '🔧', label: 'Admin', key: 'admin' },
    { href: '/settings', icon: '🔐', label: 'Broker Setup', key: 'settings' },
  ]

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#1a0b2e] dark:via-[#2d1b4e] dark:to-[#1a0b2e]">
      {/* Header - Sticky */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm dark:bg-black/20 dark:border-white/10 dark:shadow-none">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <a href="/dashboard" className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-pink-400 dark:to-purple-400">
                  QuantPro
                </h1>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 tracking-wider">
                  Algo Edge for the Elites
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

              {/* User Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {session.user?.image ? (
                    <div className="flex items-center gap-2">
                      <div className="text-right hidden sm:block">
                        <span className="text-sm font-medium block text-gray-900 dark:text-white">{session.user.name?.split(' ')[0]}</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">{session.user.email}</span>
                      </div>
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="rounded-full w-10 h-10 border-2 border-white/20"
                      />
                    </div>
                  ) : (
                    <div className="rounded-full w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      {session.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl py-2 z-50 bg-white backdrop-blur-xl border border-gray-200 dark:bg-black/90 dark:border-white/10">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{session.user?.name}</p>
                      <p className="text-xs truncate text-gray-600 dark:text-gray-400">{session.user?.email}</p>
                    </div>

                    {/* Theme Toggle */}
                    <button
                      onClick={toggleTheme}
                      className="w-full px-4 py-3 text-left transition-colors flex items-center justify-between hover:bg-gray-100 dark:hover:bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Theme</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 dark:text-gray-500">{theme === 'dark' ? 'Dark' : 'Light'}</span>
                        <div className={`relative w-10 h-5 rounded-full transition-colors ${theme === 'light' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${theme === 'light' ? 'translate-x-0' : 'translate-x-5'}`}></div>
                        </div>
                      </div>
                    </button>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left transition-colors flex items-center gap-3 border-t hover:bg-red-50 dark:hover:bg-red-500/10 border-gray-200 dark:border-white/10"
                    >
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-sm text-red-600 dark:text-red-400">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Layout with Sidebar */}
      <div className="flex">
        {/* Left Sidebar Navigation */}
        <aside className="w-64 min-h-[calc(100vh-73px)] sticky top-[73px] backdrop-blur-xl border-r bg-white/90 border-gray-200 dark:bg-black/20 dark:border-white/10">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  currentPage === item.key
                    ? 'font-medium backdrop-blur-sm border bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 text-blue-700 dark:from-purple-500/20 dark:to-pink-500/20 dark:border-purple-500/30 dark:text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
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
