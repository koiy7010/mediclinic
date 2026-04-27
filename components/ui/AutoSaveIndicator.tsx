"use client"

import { useEffect, useState, useRef, useCallback } from 'react'
import { Cloud, CloudOff, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface AutoSaveIndicatorProps {
  isDirty: boolean
  onAutoSave: () => Promise<void> | void
  interval?: number // in milliseconds
  className?: string
}

export function AutoSaveIndicator({
  isDirty,
  onAutoSave,
  interval = 30000, // 30 seconds default
  className
}: AutoSaveIndicatorProps) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const performSave = useCallback(async () => {
    if (!isDirty) return
    
    setStatus('saving')
    try {
      await onAutoSave()
      setStatus('saved')
      setLastSaved(new Date())
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }, [isDirty, onAutoSave])

  useEffect(() => {
    if (isDirty) {
      timeoutRef.current = setTimeout(performSave, interval)
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isDirty, interval, performSave])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={cn(
      "flex items-center gap-2 text-xs",
      className
    )}>
      {status === 'saving' && (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[hsl(var(--primary))]" />
          <span className="text-[hsl(var(--muted-foreground))]">Saving draft…</span>
        </>
      )}
      
      {status === 'saved' && (
        <>
          <Check className="w-3.5 h-3.5 text-[hsl(var(--success))]" />
          <span className="text-[hsl(var(--success))]">Draft saved</span>
        </>
      )}
      
      {status === 'error' && (
        <>
          <CloudOff className="w-3.5 h-3.5 text-[hsl(var(--destructive))]" />
          <span className="text-[hsl(var(--destructive))]">Save failed</span>
        </>
      )}
      
      {status === 'idle' && isDirty && (
        <>
          <Cloud className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
          <span className="text-[hsl(var(--muted-foreground))]">Unsaved changes</span>
        </>
      )}
      
      {status === 'idle' && !isDirty && lastSaved && (
        <>
          <Check className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
          <span className="text-[hsl(var(--muted-foreground))]">
            Saved at {formatTime(lastSaved)}
          </span>
        </>
      )}
    </div>
  )
}
