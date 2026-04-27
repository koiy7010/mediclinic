"use client"

import { AlertTriangle, Info, HelpCircle, X } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning',
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null

  const icons = {
    danger: AlertTriangle,
    warning: HelpCircle,
    info: Info,
  }

  const colors = {
    danger: {
      icon: 'text-red-600',
      bg: 'bg-red-100',
      button: 'bg-red-600 hover:bg-red-700 text-white',
    },
    warning: {
      icon: 'text-amber-600',
      bg: 'bg-amber-100',
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    info: {
      icon: 'text-blue-600',
      bg: 'bg-blue-100',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
  }

  const Icon = icons[variant]
  const colorConfig = colors[variant]

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-150"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[hsl(var(--card))] rounded-xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={cn("p-3 rounded-full", colorConfig.bg)}>
              <Icon className={cn("w-6 h-6", colorConfig.icon)} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">{title}</h3>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
            </button>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-[hsl(var(--muted)/0.3)] border-t border-[hsl(var(--border))] flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={loading}
            className={colorConfig.button}
          >
            {loading ? 'Processing...' : confirmLabel}
          </Button>
        </div>
      </div>
    </>
  )
}

// Hook for using confirm dialog
import { useState, useCallback } from 'react'

interface UseConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
}

export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean
    options: UseConfirmOptions | null
    resolve: ((value: boolean) => void) | null
  }>({
    open: false,
    options: null,
    resolve: null,
  })

  const confirm = useCallback((options: UseConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        options,
        resolve,
      })
    })
  }, [])

  const handleClose = useCallback(() => {
    state.resolve?.(false)
    setState({ open: false, options: null, resolve: null })
  }, [state])

  const handleConfirm = useCallback(() => {
    state.resolve?.(true)
    setState({ open: false, options: null, resolve: null })
  }, [state])

  const ConfirmDialogComponent = state.options ? (
    <ConfirmDialog
      open={state.open}
      onClose={handleClose}
      onConfirm={handleConfirm}
      {...state.options}
    />
  ) : null

  return { confirm, ConfirmDialog: ConfirmDialogComponent }
}

export default ConfirmDialog
