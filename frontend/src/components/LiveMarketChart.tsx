'use client'

import { useEffect, useRef, memo } from 'react'
import { createChart, IChartApi, ISeriesApi, LineData, Time } from 'lightweight-charts'
import { useMarketStore, selectTick } from '@/store/marketStore'

interface LiveMarketChartProps {
  symbol: string
  height?: number
}

export default memo(function LiveMarketChart({ symbol, height = 400 }: LiveMarketChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const lineSeriesRef = useRef<any>(null)
  const dataPointsRef = useRef<LineData[]>([])
  
  // Subscribe to tick data for this symbol
  const tick = useMarketStore(selectTick(symbol))
  
  useEffect(() => {
    if (!chartContainerRef.current) return
    
    try {
      // Create chart
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height,
        layout: {
          background: { color: '#1a1a1a' },
          textColor: '#d1d4dc',
        },
        grid: {
          vertLines: { color: '#2a2e39' },
          horzLines: { color: '#2a2e39' },
        },
        crosshair: {
          mode: 1,
        },
        rightPriceScale: {
          borderColor: '#2a2e39',
        },
        timeScale: {
          borderColor: '#2a2e39',
          timeVisible: true,
          secondsVisible: false,
        },
      })
      
      // Create line series - using type assertion for API compatibility
      const lineSeries = (chart as any).addLineSeries?.({
        color: '#2962FF',
        lineWidth: 2,
      })
      
      if (!lineSeries) {
        console.error('Failed to create line series for', symbol)
        return
      }
      
      chartRef.current = chart
      lineSeriesRef.current = lineSeries
    } catch (error) {
      console.error('Error creating chart:', error)
      return
    }
    
    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [height])
  
  // Update chart with new tick data (transient update)
  useEffect(() => {
    if (!tick || !lineSeriesRef.current) return
    
    const timestamp = Math.floor(new Date(tick.timestamp).getTime() / 1000) as Time
    const dataPoint: LineData = {
      time: timestamp,
      value: tick.ltp,
    }
    
    // Add data point
    dataPointsRef.current.push(dataPoint)
    
    // Keep only last 100 points for performance
    if (dataPointsRef.current.length > 100) {
      dataPointsRef.current.shift()
    }
    
    // Update series with all data points
    lineSeriesRef.current.setData(dataPointsRef.current)
    
  }, [tick])
  
  return (
    <div className="relative w-full">
      <div ref={chartContainerRef} className="w-full rounded-lg overflow-hidden" />
      
      {tick && (
        <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs text-gray-400">Symbol</div>
              <div className="text-sm font-bold text-white">{tick.symbol}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">LTP</div>
              <div className="text-sm font-bold text-white">{tick.ltp.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Change</div>
              <div
                className={`text-sm font-bold ${
                  tick.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {tick.change >= 0 ? '+' : ''}
                {tick.change.toFixed(2)} ({tick.changePercent.toFixed(2)}%)
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Volume</div>
              <div className="text-sm font-bold text-white">
                {tick.volume.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})
