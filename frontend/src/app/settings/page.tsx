'use client'

import { getSession } from '@/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import BrokerCredentialsForm from '@/components/BrokerCredentialsForm'

export default function SettingsPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your broker credentials</p>
            </div>
            <a
              href="/dashboard"
              className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Broker Credentials</h2>
          <p className="text-gray-600 mb-6">
            Add or update your trading broker API credentials. All information is encrypted before
            transmission and stored securely on the server.
          </p>

          <BrokerCredentialsForm
            session={session}
            onSuccess={() => {
              // Show success message or reload
              console.log('Credentials saved successfully')
            }}
          />
        </div>

        {/* Security Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">🔐 End-to-End Encryption</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Credentials encrypted on your device</li>
              <li>✓ Transmitted over HTTPS only</li>
              <li>✓ Decrypted only when needed by backend</li>
              <li>✓ Never stored in plain text</li>
            </ul>
          </div>

          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">🛡️ Access Control</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ JWT token validation</li>
              <li>✓ Session-based access</li>
              <li>✓ Automatic token expiration</li>
              <li>✓ Secure refresh tokens</li>
            </ul>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-blue-900 mb-2">Terms & Conditions</h3>
          <p className="text-blue-800 text-sm">
            By submitting your broker credentials, you acknowledge that:
          </p>
          <ul className="text-blue-800 text-sm space-y-1 mt-2 ml-4">
            <li>• You are the rightful owner of these credentials</li>
            <li>• You understand the risks of sharing API credentials</li>
            <li>• AlgoTrading will not be responsible for unauthorized trades</li>
            <li>• You should enable IP whitelisting on your broker account</li>
            <li>• You should regularly rotate your API secret</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
