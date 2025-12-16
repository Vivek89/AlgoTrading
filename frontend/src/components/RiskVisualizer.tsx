'use client';

import React from 'react';
import { LockAndTrailConfig } from '@/lib/validations/strategy';

interface RiskVisualizerProps {
  config: Partial<LockAndTrailConfig>;
}

export default function RiskVisualizer({ config }: RiskVisualizerProps) {
  const { activationLevel = 30, lockProfit = 20, trailStep = 10, trailProfit = 5 } = config;

  // SVG dimensions
  const width = 600;
  const height = 300;
  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  // Calculate positions
  const baselineY = height - padding;
  const maxProfitY = padding;
  const profitRange = 100; // 0-100% profit range

  // Convert profit percentage to Y coordinate
  const profitToY = (profit: number) => {
    return baselineY - (profit / profitRange) * chartHeight;
  };

  // Key levels
  const activationY = profitToY(activationLevel);
  const lockY = profitToY(lockProfit);
  const trailY = profitToY(lockProfit + trailProfit);

  // Timeline X positions
  const phase1X = padding;
  const phase2X = padding + chartWidth * 0.3;
  const phase3X = padding + chartWidth * 0.6;
  const phase4X = padding + chartWidth;

  return (
    <div className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Lock & Trail Visualization</h3>
        <p className="text-xs text-gray-600">
          Shows how stop loss adjusts as profit increases
        </p>
      </div>

      <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`}>
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect x={padding} y={padding} width={chartWidth} height={chartHeight} fill="url(#grid)" />

        {/* Y-axis labels */}
        <text x={padding - 10} y={baselineY} textAnchor="end" fontSize="11" fill="#6b7280">0%</text>
        <text x={padding - 10} y={profitToY(25)} textAnchor="end" fontSize="11" fill="#6b7280">25%</text>
        <text x={padding - 10} y={profitToY(50)} textAnchor="end" fontSize="11" fill="#6b7280">50%</text>
        <text x={padding - 10} y={profitToY(75)} textAnchor="end" fontSize="11" fill="#6b7280">75%</text>
        <text x={padding - 10} y={maxProfitY} textAnchor="end" fontSize="11" fill="#6b7280">100%</text>

        {/* Baseline (0% profit) */}
        <line 
          x1={padding} 
          y1={baselineY} 
          x2={padding + chartWidth} 
          y2={baselineY} 
          stroke="#9ca3af" 
          strokeWidth="2"
        />

        {/* Activation Level Line */}
        <line 
          x1={padding} 
          y1={activationY} 
          x2={padding + chartWidth} 
          y2={activationY} 
          stroke="#f59e0b" 
          strokeWidth="1" 
          strokeDasharray="5,5"
        />
        <text 
          x={padding + chartWidth + 5} 
          y={activationY + 4} 
          fontSize="10" 
          fill="#f59e0b"
          fontWeight="600"
        >
          Activation: {activationLevel}%
        </text>

        {/* Lock Level Line */}
        <line 
          x1={padding} 
          y1={lockY} 
          x2={padding + chartWidth} 
          y2={lockY} 
          stroke="#3b82f6" 
          strokeWidth="1" 
          strokeDasharray="5,5"
        />
        <text 
          x={padding + chartWidth + 5} 
          y={lockY + 4} 
          fontSize="10" 
          fill="#3b82f6"
          fontWeight="600"
        >
          Lock: {lockProfit}%
        </text>

        {/* Profit Path (Green line showing profit growth) */}
        <path
          d={`M ${phase1X} ${baselineY} 
              L ${phase2X} ${profitToY(activationLevel * 0.8)} 
              L ${phase3X} ${profitToY(activationLevel + 10)} 
              L ${phase4X} ${profitToY(activationLevel + 20)}`}
          stroke="#10b981"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Stop Loss Path (Red line showing SL adjustment) */}
        <path
          d={`M ${phase1X} ${baselineY} 
              L ${phase2X} ${baselineY} 
              L ${phase3X} ${lockY} 
              L ${phase4X} ${profitToY(lockProfit + trailProfit)}`}
          stroke="#ef4444"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="8,4"
        />

        {/* Phase markers */}
        <circle cx={phase1X} cy={baselineY} r="5" fill="#10b981" />
        <circle cx={phase2X} cy={profitToY(activationLevel * 0.8)} r="5" fill="#10b981" />
        <circle cx={phase3X} cy={profitToY(activationLevel + 10)} r="5" fill="#10b981" />
        <circle cx={phase4X} cy={profitToY(activationLevel + 20)} r="5" fill="#10b981" />

        {/* SL markers */}
        <circle cx={phase1X} cy={baselineY} r="5" fill="#ef4444" opacity="0.7" />
        <circle cx={phase2X} cy={baselineY} r="5" fill="#ef4444" opacity="0.7" />
        <circle cx={phase3X} cy={lockY} r="5" fill="#ef4444" />
        <circle cx={phase4X} cy={profitToY(lockProfit + trailProfit)} r="5" fill="#ef4444" />

        {/* Phase labels */}
        <text x={phase1X} y={height - 10} textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="600">
          Entry
        </text>
        <text x={phase2X} y={height - 10} textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="600">
          Building
        </text>
        <text x={phase3X} y={height - 10} textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="600">
          Activated
        </text>
        <text x={phase4X} y={height - 10} textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="600">
          Trailing
        </text>

        {/* Legend */}
        <g transform={`translate(${padding}, ${padding - 20})`}>
          <line x1="0" y1="0" x2="30" y2="0" stroke="#10b981" strokeWidth="3" />
          <text x="35" y="4" fontSize="11" fill="#374151">Profit</text>

          <line x1="100" y1="0" x2="130" y2="0" stroke="#ef4444" strokeWidth="3" strokeDasharray="8,4" />
          <text x="135" y="4" fontSize="11" fill="#374151">Stop Loss</text>
        </g>
      </svg>

      {/* Configuration Summary */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="text-gray-600 mb-1">Activation</div>
          <div className="font-semibold text-orange-600">{activationLevel}% profit</div>
        </div>
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="text-gray-600 mb-1">Lock At</div>
          <div className="font-semibold text-blue-600">{lockProfit}% profit</div>
        </div>
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="text-gray-600 mb-1">Trail Step</div>
          <div className="font-semibold text-green-600">Every {trailStep}% gain</div>
        </div>
        <div className="bg-white p-2 rounded border border-gray-200">
          <div className="text-gray-600 mb-1">Trail Distance</div>
          <div className="font-semibold text-purple-600">{trailProfit}% behind</div>
        </div>
      </div>

      {/* How it works */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="text-xs text-blue-900 font-semibold mb-2">How it works:</div>
        <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
          <li>Strategy starts with SL at entry (0% loss)</li>
          <li>SL remains at 0% until profit reaches {activationLevel}%</li>
          <li>When activated, SL immediately moves to lock {lockProfit}% profit</li>
          <li>For every additional {trailStep}% profit, SL trails {trailProfit}% behind current profit</li>
        </ol>
      </div>
    </div>
  );
}
