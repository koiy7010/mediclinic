"use client"

import { useState, useRef } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NumericInputProps {
  value: string | number
  onChange: (value: string) => void
  min?: number
  max?: number
  step?: number
  placeholder?: string
  unit?: string
  presets?: { label: string; value: string }[]
  referenceRange?: string
  className?: string
  disabled?: boolean
}

export function NumericInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder,
  unit,
  presets,
  referenceRange,
  className,
  disabled
}: NumericInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const numValue = parseFloat(String(value)) || 0

  const increment = () => {
    const newValue = Math.min(numValue + step, max ?? Infinity)
    onChange(String(newValue))
  }

  const decrement = () => {
    const newValue = Math.max(numValue - step, min ?? -Infinity)
    onChange(String(newValue))
  }

  const isInRange = () => {
    if (!referenceRange || !value) return null
    // Simple range check - assumes format like "3.9–6.1" or "< 5.18" or "> 1.04"
    const v = parseFloat(String(value))
    if (isNaN(v)) return null
    
    if (referenceRange.startsWith('<')) {
      const max = parseFloat(referenceRange.slice(1).trim())
      return v < max
    }
    if (referenceRange.startsWith('>')) {
      const min = parseFloat(referenceRange.slice(1).trim())
      return v > min
    }
    const match = referenceRange.match(/([\d.]+)[–-]([\d.]+)/)
    if (match) {
      const [, minStr, maxStr] = match
      return v >= parseFloat(minStr) && v <= parseFloat(maxStr)
    }
    return null
  }

  const inRange = isInRange()

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={decrement}
          disabled={disabled || (min !== undefined && numValue <= min)}
          className="p-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <Minus className="w-3 h-3" />
        </button>
        
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            step={step}
            min={min}
            max={max}
            className={cn(
              "w-full px-3 py-2 rounded-lg border text-sm text-center",
              "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-all",
              "hover:border-[hsl(var(--primary)/0.5)] hover:shadow-md",
              inRange === true && "border-[hsl(var(--success))] bg-[hsl(var(--success)/0.05)]",
              inRange === false && "border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.05)]",
              inRange === null && "border-[hsl(var(--input))] bg-[hsl(var(--card))]",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[hsl(var(--muted-foreground))]">
              {unit}
            </span>
          )}
          {inRange !== null && (
            <span className={cn(
              "absolute right-8 top-1/2 -translate-y-1/2 text-xs font-medium",
              inRange ? "text-[hsl(var(--success))]" : "text-[hsl(var(--destructive))]"
            )}>
              {inRange ? '✓' : '!'}
            </span>
          )}
        </div>
        
        <button
          type="button"
          onClick={increment}
          disabled={disabled || (max !== undefined && numValue >= max)}
          className="p-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {presets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange(preset.value)}
              disabled={disabled}
              className={cn(
                "px-2 py-0.5 text-[10px] rounded-md border transition-colors cursor-pointer",
                value === preset.value
                  ? "bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]"
                  : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)]"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
