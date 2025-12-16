'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const shareSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  roiPercentage: z.number().int().min(-100).max(1000).optional(),
  maxDrawdown: z.number().int().min(0).max(100).optional(),
})

type ShareFormData = z.infer<typeof shareSchema>

interface ShareModalProps {
  strategyId: string
  strategyName: string
  accessToken: string
  isOpen: boolean
  onClose: () => void
  onSuccess: (shareUrl: string) => void
}

export default function ShareModal({
  strategyId,
  strategyName,
  accessToken,
  isOpen,
  onClose,
  onSuccess,
}: ShareModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ShareFormData>({
    resolver: zodResolver(shareSchema),
  })

  const onSubmit = async (data: ShareFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/marketplace/share/${strategyId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            description: data.description,
            roi_percentage: data.roiPercentage,
            max_drawdown: data.maxDrawdown,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to share strategy')
      }

      const result = await response.json()
      const shareUrl = `${window.location.origin}${result.share_url}`
      
      onSuccess(shareUrl)
      reset()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Share Strategy</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Share "{strategyName}" with the community. Your strategy configuration
          will be visible to others, but your trading history will remain private.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your strategy, when to use it, and any tips..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ROI % (Optional)
              </label>
              <input
                type="number"
                {...register('roiPercentage', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 25"
              />
              {errors.roiPercentage && (
                <p className="mt-1 text-sm text-red-600">{errors.roiPercentage.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Drawdown % (Optional)
              </label>
              <input
                type="number"
                {...register('maxDrawdown', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 15"
              />
              {errors.maxDrawdown && (
                <p className="mt-1 text-sm text-red-600">{errors.maxDrawdown.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sharing...' : 'Share Strategy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
