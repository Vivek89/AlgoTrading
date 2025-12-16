'use client'

import { useState } from 'react'
import { encryptCredentials } from '@/lib/encryption'
import { submitBrokerCredentials } from '@/lib/api'
import type { Session } from '@/auth'

interface BrokerCredentialsFormProps {
  session: Session | null
  onSuccess?: () => void
}

export default function BrokerCredentialsForm({ session, onSuccess }: BrokerCredentialsFormProps) {
  const [formData, setFormData] = useState({
    apiKey: '',
    apiSecret: '',
    totpKey: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showSecrets, setShowSecrets] = useState({
    apiSecret: false,
    totpKey: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!formData.apiKey || !formData.apiSecret || !formData.totpKey) {
      setError('All fields are required')
      return
    }

    try {
      setIsLoading(true)

      // Encrypt sensitive fields before sending
      const encryptedPayload = {
        api_key: formData.apiKey,
        api_secret: encryptCredentials({
          apiKey: formData.apiKey,
          apiSecret: formData.apiSecret,
          totpKey: formData.totpKey,
        }),
        totp_key: formData.totpKey,
      }

      // Send to backend
      await submitBrokerCredentials(encryptedPayload, session)

      setSuccess(true)
      setFormData({
        apiKey: '',
        apiSecret: '',
        totpKey: '',
      })

      // Clear form after success
      setTimeout(() => {
        setSuccess(false)
        onSuccess?.()
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save credentials'
      setError(errorMessage)
      console.error('Error saving credentials:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
          API Key
        </label>
        <input
          type="text"
          id="apiKey"
          name="apiKey"
          value={formData.apiKey}
          onChange={handleChange}
          placeholder="Enter your broker API key"
          className="input"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          Your API key is encrypted before transmission
        </p>
      </div>

      <div>
        <label htmlFor="apiSecret" className="block text-sm font-medium text-gray-700 mb-2">
          API Secret
        </label>
        <div className="relative">
          <input
            type={showSecrets.apiSecret ? 'text' : 'password'}
            id="apiSecret"
            name="apiSecret"
            value={formData.apiSecret}
            onChange={handleChange}
            placeholder="Enter your broker API secret"
            className="input"
            required
          />
          <button
            type="button"
            onClick={() =>
              setShowSecrets(prev => ({
                ...prev,
                apiSecret: !prev.apiSecret,
              }))
            }
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showSecrets.apiSecret ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 3c5.522 0 9.542 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-1.303 0-2.567-.19-3.767-.526l1.458-1.458C7.61 15.27 8.75 15 10 15c3.57 0 6.58-2.024 7.842-5 .577-1.357.878-2.876.878-4.5 0-1.624-.301-3.143-.878-4.5C16.58 5.024 13.57 3 10 3c-1.25 0-2.39.23-3.309.649l1.402-1.402C7.433 3.19 8.697 3 10 3z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Never share this with anyone. Encrypted end-to-end.
        </p>
      </div>

      <div>
        <label htmlFor="totpKey" className="block text-sm font-medium text-gray-700 mb-2">
          TOTP Secret Key
        </label>
        <div className="relative">
          <input
            type={showSecrets.totpKey ? 'text' : 'password'}
            id="totpKey"
            name="totpKey"
            value={formData.totpKey}
            onChange={handleChange}
            placeholder="Enter your TOTP secret key"
            className="input"
            required
          />
          <button
            type="button"
            onClick={() =>
              setShowSecrets(prev => ({
                ...prev,
                totpKey: !prev.totpKey,
              }))
            }
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showSecrets.totpKey ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 3c5.522 0 9.542 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-1.303 0-2.567-.19-3.767-.526l1.458-1.458C7.61 15.27 8.75 15 10 15c3.57 0 6.58-2.024 7.842-5 .577-1.357.878-2.876.878-4.5 0-1.624-.301-3.143-.878-4.5C16.58 5.024 13.57 3 10 3c-1.25 0-2.39.23-3.309.649l1.402-1.402C7.433 3.19 8.697 3 10 3z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Your TOTP secret is encrypted and stored securely
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm font-medium">
            ✓ Credentials saved successfully
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Saving...' : 'Save Credentials'}
      </button>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">🔒 Security Features</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>✓ Client-side encryption before transmission</li>
          <li>✓ Server-side encryption at rest</li>
          <li>✓ Secure HTTPS transmission</li>
          <li>✓ No credentials logged or cached</li>
          <li>✓ Access only with valid JWT token</li>
        </ul>
      </div>
    </form>
  )
}
