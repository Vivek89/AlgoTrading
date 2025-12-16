import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  
  // Check for access_token in cookies (set by backend)
  const accessTokenCookie = cookieStore.get('access_token')
  
  // Also check Authorization header (from sessionStorage via fetch)
  const authHeader = request.headers.get('Authorization')
  const accessToken = accessTokenCookie?.value || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null)

  if (!accessToken) {
    return Response.json(null, { status: 401 })
  }

  try {
    // Decode JWT to get user info
    const base64Url = accessToken.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString())
    
    // Fetch full user profile from backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const userResponse = await fetch(`${backendUrl}/api/v1/users/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    let userProfile = null
    if (userResponse.ok) {
      userProfile = await userResponse.json()
    }
    
    const session = {
      user: {
        id: payload.sub,
        email: payload.email,
        name: userProfile?.full_name || payload.email.split('@')[0],
        image: userProfile?.profile_picture_url || null,
      },
      accessToken: accessToken,
    }
    return Response.json(session)
  } catch (err) {
    console.error('Failed to parse session token:', err)
    return Response.json(null, { status: 401 })
  }
}
