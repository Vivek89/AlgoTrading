'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getSession } from '@/auth'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkSession() {
      try {
        const session = await getSession()
        if (session) {
          router.push('/dashboard')
        } else {
          router.push('/login')
        }
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [router])

  if (!loading) {
    return null
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
