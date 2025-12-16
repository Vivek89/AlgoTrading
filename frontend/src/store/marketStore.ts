import { create } from 'zustand'

// Market data types
export interface TickData {
  symbol: string
  ltp: number // Last Traded Price
  change: number
  changePercent: number
  volume: number
  timestamp: string
}

export interface OrderUpdate {
  orderId: string
  strategyId: string
  symbol: string
  side: 'BUY' | 'SELL'
  quantity: number
  price: number
  status: 'PENDING' | 'COMPLETE' | 'REJECTED' | 'CANCELLED'
  timestamp: string
}

export interface StrategyPnL {
  strategyId: string
  currentPnL: number
  totalPnL: number
  openPositions: number
}

interface MarketStore {
  // Market Data
  ticks: Record<string, TickData>
  lastUpdate: string | null
  
  // Order Log
  orders: OrderUpdate[]
  
  // Strategy P&L
  strategyPnL: Record<string, StrategyPnL>
  
  // Connection Status
  isConnected: boolean
  connectionQuality: 'good' | 'degraded' | 'disconnected'
  
  // Actions
  updateTick: (tick: TickData) => void
  addOrder: (order: OrderUpdate) => void
  updateStrategyPnL: (pnl: StrategyPnL) => void
  setConnectionStatus: (connected: boolean) => void
  setConnectionQuality: (quality: 'good' | 'degraded' | 'disconnected') => void
  clearOrders: () => void
  reset: () => void
}

export const useMarketStore = create<MarketStore>((set) => ({
  // Initial state
  ticks: {},
  lastUpdate: null,
  orders: [],
  strategyPnL: {},
  isConnected: false,
  connectionQuality: 'disconnected',
  
  // Update tick data (transient update - doesn't trigger re-renders for non-subscribers)
  updateTick: (tick) =>
    set((state) => ({
      ticks: {
        ...state.ticks,
        [tick.symbol]: tick,
      },
      lastUpdate: tick.timestamp,
    })),
  
  // Add order to log
  addOrder: (order) =>
    set((state) => ({
      orders: [order, ...state.orders].slice(0, 100), // Keep last 100 orders
    })),
  
  // Update strategy P&L
  updateStrategyPnL: (pnl) =>
    set((state) => ({
      strategyPnL: {
        ...state.strategyPnL,
        [pnl.strategyId]: pnl,
      },
    })),
  
  // Set connection status
  setConnectionStatus: (connected) =>
    set({ isConnected: connected }),
  
  // Set connection quality
  setConnectionQuality: (quality) =>
    set({ connectionQuality: quality }),
  
  // Clear orders
  clearOrders: () =>
    set({ orders: [] }),
  
  // Reset store
  reset: () =>
    set({
      ticks: {},
      lastUpdate: null,
      orders: [],
      strategyPnL: {},
      isConnected: false,
      connectionQuality: 'disconnected',
    }),
}))

// Selectors for optimized subscriptions
export const selectTick = (symbol: string) => (state: MarketStore) => state.ticks[symbol]
export const selectIsConnected = (state: MarketStore) => state.isConnected
export const selectConnectionQuality = (state: MarketStore) => state.connectionQuality
export const selectOrders = (state: MarketStore) => state.orders
export const selectStrategyPnL = (strategyId: string) => (state: MarketStore) => 
  state.strategyPnL[strategyId]
