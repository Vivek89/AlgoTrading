// JWT and session management
export interface Session {
  user?: {
    id: string
    email: string
    name: string
    image?: string
  }
  accessToken?: string
  refreshToken?: string
}

export async function getSession(): Promise<Session | null> {
  if (typeof window === 'undefined') {
    return null // Server-side
  }

  try {
    // Get token from sessionStorage
    const token = sessionStorage.getItem('access_token')
    
    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch('/api/auth/session', { headers })
    if (response.ok) {
      return await response.json()
    }
  } catch (err) {
    console.error('Failed to get session:', err)
  }

  return null
}

export async function signOut(): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    await fetch('/api/auth/signout', { method: 'POST' })
    window.location.href = '/login'
  } catch (err) {
    console.error('Sign out failed:', err)
  }
}

export async function signIn(provider: string, redirectTo = '/dashboard'): Promise<void> {
  if (typeof window === 'undefined') return

  if (provider === 'google') {
    // Store the intended redirect path in sessionStorage
    sessionStorage.setItem('auth_redirect', redirectTo)
    
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const authUrl = `${backendUrl}/api/v1/auth/google`
    
    console.log('🔗 Redirecting to backend OAuth endpoint:', authUrl)
    window.location.href = authUrl
  } else {
    throw new Error(`Provider '${provider}' is not supported`)
  }
}

/**
 * Handle OAuth callback from backend
 * Called when the user is redirected back from Google via the backend
 */
export async function handleOAuthCallback(): Promise<string | null> {
  if (typeof window === 'undefined') return null

  try {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const refreshToken = params.get('refresh_token')
    const error = params.get('error')

    if (error) {
      console.error('❌ OAuth error:', error)
      throw new Error(`Authentication failed: ${error}`)
    }

    if (token) {
      console.log('✅ OAuth successful, storing token')
      
      // Store tokens in secure httpOnly cookies (done by backend)
      // or in sessionStorage for now
      sessionStorage.setItem('access_token', token)
      if (refreshToken) {
        sessionStorage.setItem('refresh_token', refreshToken)
      }

      // Get the redirect path
      const redirectPath = sessionStorage.getItem('auth_redirect') || '/dashboard'
      sessionStorage.removeItem('auth_redirect')

      // Clean up URL
      window.history.replaceState({}, document.title, '/login')

      return redirectPath
    }
  } catch (err) {
    console.error('Failed to handle OAuth callback:', err)
  }

  return null
}
