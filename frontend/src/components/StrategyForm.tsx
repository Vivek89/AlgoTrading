'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { strategySchema, type StrategyFormData } from '@/lib/validations/strategy'
import { useState } from 'react'
import RiskManagementAccordion from '@/components/RiskManagementAccordion'

interface StrategyFormProps {
  onSubmit: (data: StrategyFormData) => Promise<void>
  initialData?: Partial<StrategyFormData>
  isLoading?: boolean
}

export default function StrategyForm({ onSubmit, initialData, isLoading }: StrategyFormProps) {
  const [selectedType, setSelectedType] = useState<string>(initialData?.strategyType || '')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<StrategyFormData>({
    resolver: zodResolver(strategySchema),
    defaultValues: initialData || {
      riskManagement: {
        mode: 'NONE',
      },
    },
  })

  const strategyType = watch('strategyType')

  const handleTypeSelect = (type: string) => {
    setSelectedType(type)
    setValue('strategyType', type as any)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Strategy Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Strategy Name
        </label>
        <input
          {...register('name')}
          type="text"
          id="name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="My Trading Strategy"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Strategy Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Select Strategy Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: 'SHORT_STRADDLE', label: 'Short Straddle', desc: 'Sell ATM Call & Put' },
            { value: 'SHORT_STRANGLE', label: 'Short Strangle', desc: 'Sell OTM Call & Put' },
            { value: 'IRON_CONDOR', label: 'Iron Condor', desc: 'Credit spread strategy' },
            { value: 'IRON_FLY', label: 'Iron Fly', desc: 'ATM credit spread' },
          ].map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => handleTypeSelect(type.value)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedType === type.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-gray-900">{type.label}</div>
              <div className="text-sm text-gray-600 mt-1">{type.desc}</div>
            </button>
          ))}
        </div>
        {errors.strategyType && (
          <p className="mt-2 text-sm text-red-600">{errors.strategyType.message}</p>
        )}
      </div>

      {/* Configuration Fields - Dynamic based on strategy type */}
      {selectedType && (
        <div className="bg-gray-50 rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Configuration</h3>

          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instrument
              </label>
              <select
                {...register('config.instrument')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Instrument</option>
                <option value="NIFTY">NIFTY</option>
                <option value="BANKNIFTY">BANKNIFTY</option>
                <option value="FINNIFTY">FINNIFTY</option>
              </select>
              {errors.config?.instrument && (
                <p className="mt-1 text-sm text-red-600">{errors.config.instrument.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lot Size
              </label>
              <input
                {...register('config.lotSize', { valueAsNumber: true })}
                type="number"
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.config?.lotSize && (
                <p className="mt-1 text-sm text-red-600">{errors.config.lotSize.message}</p>
              )}
            </div>
          </div>

          {/* Straddle-specific fields */}
          {(selectedType === 'SHORT_STRADDLE') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ATM Selection
              </label>
              <select
                {...register('config.atmSelection')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Strike</option>
                <option value="ATM">ATM (At The Money)</option>
                <option value="OTM_PLUS_1">OTM +1</option>
                <option value="OTM_PLUS_2">OTM +2</option>
                <option value="OTM_MINUS_1">OTM -1</option>
              </select>
              {errors.config?.atmSelection && (
                <p className="mt-1 text-sm text-red-600">{errors.config.atmSelection.message}</p>
              )}
            </div>
          )}

          {/* Strangle-specific fields */}
          {selectedType === 'SHORT_STRANGLE' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CE Strike Distance
                </label>
                <input
                  {...register('config.ceStrikeDistance', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.config?.ceStrikeDistance && (
                  <p className="mt-1 text-sm text-red-600">{errors.config.ceStrikeDistance.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PE Strike Distance
                </label>
                <input
                  {...register('config.peStrikeDistance', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.config?.peStrikeDistance && (
                  <p className="mt-1 text-sm text-red-600">{errors.config.peStrikeDistance.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Iron Condor / Iron Fly fields */}
          {(selectedType === 'IRON_CONDOR' || selectedType === 'IRON_FLY') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call Spread Width
                </label>
                <input
                  {...register('config.callSpreadWidth', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.config?.callSpreadWidth && (
                  <p className="mt-1 text-sm text-red-600">{errors.config.callSpreadWidth.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Put Spread Width
                </label>
                <input
                  {...register('config.putSpreadWidth', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.config?.putSpreadWidth && (
                  <p className="mt-1 text-sm text-red-600">{errors.config.putSpreadWidth.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wing Width
                </label>
                <input
                  {...register('config.wingWidth', { valueAsNumber: true })}
                  type="number"
                  min="50"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.config?.wingWidth && (
                  <p className="mt-1 text-sm text-red-600">{errors.config.wingWidth.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Risk Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stop Loss (%)
              </label>
              <input
                {...register('config.stopLoss', { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.config?.stopLoss && (
                <p className="mt-1 text-sm text-red-600">{errors.config.stopLoss.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Profit (%)
              </label>
              <input
                {...register('config.targetProfit', { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.config?.targetProfit && (
                <p className="mt-1 text-sm text-red-600">{errors.config.targetProfit.message}</p>
              )}
            </div>
          </div>

          {/* Timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entry Time
              </label>
              <input
                {...register('config.entryTime')}
                type="time"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.config?.entryTime && (
                <p className="mt-1 text-sm text-red-600">{errors.config.entryTime.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exit Time
              </label>
              <input
                {...register('config.exitTime')}
                type="time"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.config?.exitTime && (
                <p className="mt-1 text-sm text-red-600">{errors.config.exitTime.message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Risk Management Section */}
      {selectedType && (
        <div className="pt-4">
          <RiskManagementAccordion control={control} watch={watch} errors={errors} />
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saving...' : 'Save Strategy'}
        </button>
      </div>
    </form>
  )
}
