'use client'

import { getSession } from '@/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import BrokerCredentialsForm from '@/components/BrokerCredentialsForm'
import DashboardLayout from '@/components/DashboardLayout'
import { ZerodhaBrokerSetup } from '@/hooks/useZerodhaConnection'

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <DashboardLayout session={session} currentPage="settings">
      {/* Page Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-brand-gradient mb-2">Broker Setup</h2>
        <p className="text-gray-300">Manage your broker API credentials securely</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Zerodha OAuth Integration */}
        <ZerodhaBrokerSetup />

        {/* Manual Broker Credentials Form */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">Manual Broker Setup</h2>
          <p className="text-gray-300 mb-6">
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
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h3 className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">🔐 End-to-End Encryption</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>✓ Credentials encrypted on your device</li>
              <li>✓ Transmitted over HTTPS only</li>
              <li>✓ Decrypted only when needed by backend</li>
              <li>✓ Never stored in plain text</li>
            </ul>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h3 className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">🛡️ Access Control</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>✓ JWT token validation</li>
              <li>✓ Session-based access</li>
              <li>✓ Automatic token expiration</li>
              <li>✓ Secure refresh tokens</li>
            </ul>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-8 p-6 bg-purple-500/20 border border-purple-500/30 rounded-xl backdrop-blur-sm">
          <h3 className="font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-2">Terms & Conditions</h3>
          <p className="text-purple-200 text-sm">
            By submitting your broker credentials, you acknowledge that:
          </p>
          <ul className="text-purple-200 text-sm space-y-1 mt-2 ml-4">
            <li>• You are the rightful owner of these credentials</li>
            <li>• You understand the risks of sharing API credentials</li>
            <li>• QuantPro will not be responsible for unauthorized trades</li>
            <li>• You should enable IP whitelisting on your broker account</li>
            <li>• You should regularly rotate your API secret</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}
