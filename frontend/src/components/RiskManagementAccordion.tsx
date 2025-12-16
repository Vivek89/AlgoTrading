'use client';

import React from 'react';
import { Control, Controller, UseFormWatch } from 'react-hook-form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Info } from 'lucide-react';
import Tooltip from '@/components/Tooltip';
import RiskVisualizer from '@/components/RiskVisualizer';

interface RiskManagementAccordionProps {
  control: Control<any>;
  watch: UseFormWatch<any>;
  errors: any;
}

export default function RiskManagementAccordion({ control, watch, errors }: RiskManagementAccordionProps) {
  const riskMode = watch('riskManagement.mode') || 'NONE';
  const lockAndTrailConfig = watch('riskManagement.lockAndTrail');

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="risk-management">
        <AccordionTrigger className="text-base font-semibold">
          <div className="flex items-center gap-2">
            <span>Risk Management</span>
            {riskMode !== 'NONE' && (
              <span className="text-xs font-normal px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                {riskMode.replace('_', ' & ')}
              </span>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-6 pt-4">
          {/* Risk Mode Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Risk Protection Mode</Label>
            <Controller
              name="riskManagement.mode"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value || 'NONE'}
                  onValueChange={field.onChange}
                  className="grid grid-cols-2 gap-3"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="NONE" id="mode-none" />
                    <Label htmlFor="mode-none" className="flex-1 cursor-pointer">
                      <div className="font-medium">None</div>
                      <div className="text-xs text-gray-500">No automatic risk management</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="LOCK" id="mode-lock" />
                    <Label htmlFor="mode-lock" className="flex-1 cursor-pointer">
                      <div className="font-medium">Lock Only</div>
                      <div className="text-xs text-gray-500">Lock profit at threshold</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="TRAIL" id="mode-trail" />
                    <Label htmlFor="mode-trail" className="flex-1 cursor-pointer">
                      <div className="font-medium">Trail Only</div>
                      <div className="text-xs text-gray-500">Trail SL as profit grows</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 border-blue-200 bg-blue-50">
                    <RadioGroupItem value="LOCK_AND_TRAIL" id="mode-lock-trail" />
                    <Label htmlFor="mode-lock-trail" className="flex-1 cursor-pointer">
                      <div className="font-medium">Lock & Trail</div>
                      <div className="text-xs text-gray-500">Combined protection</div>
                    </Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          {/* Basic Risk Parameters (shown for all non-NONE modes) */}
          {riskMode !== 'NONE' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900">Basic Protection</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="combinedPremiumSl" className="flex items-center gap-1">
                    Combined Premium SL (%)
                    <Tooltip content="Stop loss as % of total premium received">
                      <Info className="h-3 w-3 text-gray-400" />
                    </Tooltip>
                  </Label>
                  <Controller
                    name="riskManagement.combinedPremiumSl"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="combinedPremiumSl"
                        type="number"
                        placeholder="50"
                        min="0"
                        max="200"
                        step="5"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    )}
                  />
                  {errors?.riskManagement?.combinedPremiumSl && (
                    <p className="text-xs text-red-600">{errors.riskManagement.combinedPremiumSl.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="combinedPremiumTarget" className="flex items-center gap-1">
                    Combined Premium Target (%)
                    <Tooltip content="Target profit as % of total premium received">
                      <Info className="h-3 w-3 text-gray-400" />
                    </Tooltip>
                  </Label>
                  <Controller
                    name="riskManagement.combinedPremiumTarget"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="combinedPremiumTarget"
                        type="number"
                        placeholder="100"
                        min="0"
                        max="500"
                        step="10"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    )}
                  />
                  {errors?.riskManagement?.combinedPremiumTarget && (
                    <p className="text-xs text-red-600">{errors.riskManagement.combinedPremiumTarget.message}</p>
                  )}
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="individualLegSl" className="flex items-center gap-1">
                    Individual Leg SL (%) - Optional
                    <Tooltip content="Stop loss for each option leg independently">
                      <Info className="h-3 w-3 text-gray-400" />
                    </Tooltip>
                  </Label>
                  <Controller
                    name="riskManagement.individualLegSl"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="individualLegSl"
                        type="number"
                        placeholder="100"
                        min="0"
                        max="500"
                        step="10"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    )}
                  />
                  {errors?.riskManagement?.individualLegSl && (
                    <p className="text-xs text-red-600">{errors.riskManagement.individualLegSl.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Lock & Trail Configuration (only for LOCK_AND_TRAIL mode) */}
          {riskMode === 'LOCK_AND_TRAIL' && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-blue-900">Lock & Trail Configuration</h4>
                <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">Advanced</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="activationLevel" className="flex items-center gap-1 text-blue-900">
                    Activation Level (%)
                    <Tooltip content="Profit threshold to activate trailing stop loss">
                      <Info className="h-3 w-3 text-blue-600" />
                    </Tooltip>
                  </Label>
                  <Controller
                    name="riskManagement.lockAndTrail.activationLevel"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="activationLevel"
                        type="number"
                        placeholder="30"
                        min="0"
                        max="100"
                        step="5"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className="bg-white"
                      />
                    )}
                  />
                  {errors?.riskManagement?.lockAndTrail?.activationLevel && (
                    <p className="text-xs text-red-600">{errors.riskManagement.lockAndTrail.activationLevel.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lockProfit" className="flex items-center gap-1 text-blue-900">
                    Lock Profit (%)
                    <Tooltip content="Profit to lock in when activated (must be ≤ activation level)">
                      <Info className="h-3 w-3 text-blue-600" />
                    </Tooltip>
                  </Label>
                  <Controller
                    name="riskManagement.lockAndTrail.lockProfit"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="lockProfit"
                        type="number"
                        placeholder="20"
                        min="0"
                        max="100"
                        step="5"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className="bg-white"
                      />
                    )}
                  />
                  {errors?.riskManagement?.lockAndTrail?.lockProfit && (
                    <p className="text-xs text-red-600">{errors.riskManagement.lockAndTrail.lockProfit.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trailStep" className="flex items-center gap-1 text-blue-900">
                    Trail Step (%)
                    <Tooltip content="Profit increment to trigger SL adjustment">
                      <Info className="h-3 w-3 text-blue-600" />
                    </Tooltip>
                  </Label>
                  <Controller
                    name="riskManagement.lockAndTrail.trailStep"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="trailStep"
                        type="number"
                        placeholder="10"
                        min="1"
                        max="50"
                        step="1"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className="bg-white"
                      />
                    )}
                  />
                  {errors?.riskManagement?.lockAndTrail?.trailStep && (
                    <p className="text-xs text-red-600">{errors.riskManagement.lockAndTrail.trailStep.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trailProfit" className="flex items-center gap-1 text-blue-900">
                    Trail Profit (%)
                    <Tooltip content="Distance between current profit and trailing SL">
                      <Info className="h-3 w-3 text-blue-600" />
                    </Tooltip>
                  </Label>
                  <Controller
                    name="riskManagement.lockAndTrail.trailProfit"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="trailProfit"
                        type="number"
                        placeholder="5"
                        min="0"
                        max="100"
                        step="1"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        className="bg-white"
                      />
                    )}
                  />
                  {errors?.riskManagement?.lockAndTrail?.trailProfit && (
                    <p className="text-xs text-red-600">{errors.riskManagement.lockAndTrail.trailProfit.message}</p>
                  )}
                </div>
              </div>

              {/* Cross-field validation error */}
              {errors?.riskManagement?.lockAndTrail?.root && (
                <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                  {errors.riskManagement.lockAndTrail.root.message}
                </p>
              )}

              {/* Visualizer */}
              <div className="mt-4">
                <RiskVisualizer config={lockAndTrailConfig || {}} />
              </div>
            </div>
          )}

          {/* Help text for selected mode */}
          {riskMode === 'NONE' && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
              <strong>No Risk Management:</strong> Strategy will run without automatic stop loss or profit protection. 
              You'll need to manually monitor and exit positions.
            </div>
          )}
          {riskMode === 'LOCK' && (
            <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-200">
              <strong>Lock Mode:</strong> Once profit reaches the activation level, the stop loss will immediately 
              move to lock in the specified profit percentage. The SL remains fixed after locking.
            </div>
          )}
          {riskMode === 'TRAIL' && (
            <div className="text-sm text-gray-600 bg-green-50 p-3 rounded border border-green-200">
              <strong>Trail Mode:</strong> Stop loss automatically adjusts upward as profit grows, maintaining a 
              specified distance from current profit. Protects gains while allowing unlimited upside.
            </div>
          )}
          {riskMode === 'LOCK_AND_TRAIL' && (
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
              <strong>Lock & Trail Mode:</strong> Combines both strategies - first locks in profit at activation, 
              then trails the SL as profit continues to grow. Provides both security and flexibility.
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
