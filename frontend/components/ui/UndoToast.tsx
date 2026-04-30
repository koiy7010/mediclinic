"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { Undo2, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UndoState<T> {
  data: T
  description: string
  timestamp: number
}

interface UseUndoOptions<T> {
  maxHistory?: number
  onUndo?: (data: T) => void
}

export function useUndo<T>({ maxHistory = 10, onUndo }: UseUndoOptions<T>) {
  const [history, setHistory] = useState<UndoState<T>[]>([])
  const [showToast, setShowToast] = useState(false)
  const [lastAction, setLastAction] = useState<string>('')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const saveState = useCallback((data: T, description: string) => {
    setHistory(prev => {
      const newHistory = [{ data, description, timestamp: Date.now() }, ...prev]
      return newHistory.slice(0, maxHistory)
    })
    setLastAction(description)
    setShowToast(true)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setShowToast(false)
    }, 5000)
  }, [maxHistory])

  const undo = useCallback(() => {
    if (history.length === 0) return null
    
    const [lastState, ...rest] = history
    setHistory(rest)
    setShowToast(false)
    
    if (onUndo) {
      onUndo(lastState.data)
    }
    
    return lastState.data
  }, [history, onUndo])

  const dismissToast = useCallback(() => {
    setShowToast(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    saveState,
    undo,
    canUndo: history.length > 0,
    showToast,
    lastAction,
    dismissToast,
    historyLength: history.length
  }
}

interface UndoToastProps {
  show: boolean
  action: string
  onUndo: () => void
  onDismiss: () => void
  className?: string
}

export function UndoToast({ show, action, onUndo, onDismiss, className }: UndoToastProps) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (!show) {
      setProgress(100)
      return
    }

    const duration = 5000
    const interval = 50
    const decrement = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev - decrement
        if (next <= 0) {
          clearInterval(timer)
          return 0
        }
        return next
      })
    }, interval)

    return () => clearInterval(timer)
  }, [show])

  if (!show) return null

  return (
    <div className={cn(
      "fixed bottom-24 left-1/2 -translate-x-1/2 z-50",
      "bg-[hsl(var(--foreground))] text-[hsl(var(--background))] rounded-xl shadow-2xl",
      "px-4 py-3 flex items-center gap-3 min-w-[280px]",
      "animate-in slide-in-from-bottom-4 fade-in duration-200",
      className
    )}>
      <Check className="w-4 h-4 text-[hsl(var(--success))] shrink-0" />
      <span className="text-sm flex-1">{action}</span>
      <button
        onClick={onUndo}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors cursor-pointer"
      >
        <Undo2 className="w-3.5 h-3.5" />
        Undo
      </button>
      <button
        onClick={onDismiss}
        className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 rounded-b-xl overflow-hidden">
        <div
          className="h-full bg-white/30 transition-all duration-50"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
