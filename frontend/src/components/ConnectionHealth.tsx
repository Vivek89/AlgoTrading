'use client'

import { useMarketStore, selectIsConnected, selectConnectionQuality } from '@/store/marketStore'

export default function ConnectionHealth() {
  const isConnected = useMarketStore(selectIsConnected)
  const quality = useMarketStore(selectConnectionQuality)
  
  const getStatusColor = () => {
    if (!isConnected) return 'bg-red-500'
    if (quality === 'good') return 'bg-green-500'
    if (quality === 'degraded') return 'bg-yellow-500'
    return 'bg-red-500'
  }
  
  const getStatusText = () => {
    if (!isConnected) return 'Disconnected'
    if (quality === 'good') return 'Connected'
    if (quality === 'degraded') return 'Poor Connection'
    return 'Disconnected'
  }
  
  const getStatusIcon = () => {
    if (!isConnected) return '●'
    if (quality === 'good') return '●'
    if (quality === 'degraded') return '◐'
    return '○'
  }
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
      <div className="flex items-center gap-2">
        <span
          className={`inline-block w-2 h-2 rounded-full ${getStatusColor()} ${
            isConnected && quality === 'good' ? 'animate-pulse' : ''
          }`}
        />
        <span className="text-xs font-medium text-gray-300">
          {getStatusText()}
        </span>
      </div>
    </div>
  )
}

export function ConnectionHealthBadge() {
  const isConnected = useMarketStore(selectIsConnected)
  const quality = useMarketStore(selectConnectionQuality)
  
  if (!isConnected) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-red-400 bg-red-500/10 rounded-full">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
        Offline
      </span>
    )
  }
  
  if (quality === 'degraded') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-yellow-400 bg-yellow-500/10 rounded-full">
        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
        Degraded
      </span>
    )
  }
  
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-green-400 bg-green-500/10 rounded-full">
      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
      Live
    </span>
  )
}
