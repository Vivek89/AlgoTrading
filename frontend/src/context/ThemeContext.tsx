'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { THEMES, STORAGE_KEYS, API_ENDPOINTS } from '@/lib/constants'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(THEMES.DARK)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load theme from localStorage
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
      if (savedTheme === THEMES.DARK) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } else {
      // Default to dark theme
      setTheme(THEMES.DARK)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = async () => {
    const newTheme = theme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK
    setTheme(newTheme)
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme)
    
    if (newTheme === THEMES.DARK) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Persist to backend
    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      if (token) {
        await fetch(`${API_URL}${API_ENDPOINTS.USERS.THEME}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ theme: newTheme })
        })
      }
    } catch (error) {
      console.error('Failed to persist theme preference:', error)
    }
  }

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
