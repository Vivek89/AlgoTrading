'use client'

import { useEffect, useRef } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { useMarketStore } from '@/store/marketStore'

export function useMarketWebSocket() {
  const updateTick = useMarketStore((state) => state.updateTick)
  const addOrder = useMarketStore((state) => state.addOrder)
  const updateStrategyPnL = useMarketStore((state) => state.updateStrategyPnL)
  const setConnectionStatus = useMarketStore((state) => state.setConnectionStatus)
  const setConnectionQuality = useMarketStore((state) => state.setConnectionQuality)
  
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 10
  
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/ticks'
  
  const { lastMessage, readyState } = useWebSocket(wsUrl, {
    shouldReconnect: () => {
      reconnectAttempts.current += 1
      return reconnectAttempts.current <= maxReconnectAttempts
    },
    reconnectInterval: 3000,
    reconnectAttempts: maxReconnectAttempts,
    onOpen: () => {
      console.log('WebSocket connected')
      reconnectAttempts.current = 0
      setConnectionStatus(true)
      setConnectionQuality('good')
    },
    onClose: () => {
      console.log('WebSocket disconnected')
      setConnectionStatus(false)
      setConnectionQuality('disconnected')
    },
    onError: (error) => {
      console.error('WebSocket error:', error)
      setConnectionQuality('degraded')
    },
  })
  
  // Handle incoming messages
  useEffect(() => {
    if (!lastMessage) return
    
    try {
      const message = JSON.parse(lastMessage.data)
      
      switch (message.type) {
        case 'tick':
          updateTick(message.data)
          break
        
        case 'order':
          addOrder(message.data)
          break
        
        case 'pnl':
          updateStrategyPnL(message.data)
          break
        
        case 'connected':
          console.log('Market data stream connected:', message.message)
          break
        
        default:
          console.log('Unknown message type:', message.type)
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error)
    }
  }, [lastMessage, updateTick, addOrder, updateStrategyPnL])
  
  // Update connection quality based on readyState
  useEffect(() => {
    switch (readyState) {
      case ReadyState.CONNECTING:
        setConnectionQuality('degraded')
        break
      case ReadyState.OPEN:
        setConnectionStatus(true)
        setConnectionQuality('good')
        break
      case ReadyState.CLOSING:
      case ReadyState.CLOSED:
        setConnectionStatus(false)
        setConnectionQuality('disconnected')
        break
      default:
        break
    }
  }, [readyState, setConnectionStatus, setConnectionQuality])
  
  return {
    readyState,
    isConnected: readyState === ReadyState.OPEN,
  }
}
