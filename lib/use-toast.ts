"use client"

import { useState, useEffect } from 'react'

export interface ToastOptions {
  title: string
  description?: string
  variant?: 'default' | 'success' | 'destructive'
  duration?: number
}

export interface ToastState extends ToastOptions {
  id: string
  open: boolean
}

// Simple global store — no React dependency
const listeners = new Set<(toasts: ToastState[]) => void>()
let toasts: ToastState[] = []

function notify() {
  listeners.forEach(l => l([...toasts]))
}

export function toast(opts: ToastOptions) {
  const id = Math.random().toString(36).slice(2)
  const newToast: ToastState = { ...opts, id, open: true }
  toasts = [...toasts, newToast]
  notify()
  
  // Close toast after duration
  setTimeout(() => {
    toasts = toasts.map(t => t.id === id ? { ...t, open: false } : t)
    notify()
    // Remove from DOM after animation completes
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id)
      notify()
    }, 200) // Match animation duration
  }, opts.duration ?? 4000)
}

export function dismissToast(id: string) {
  toasts = toasts.map(t => t.id === id ? { ...t, open: false } : t)
  notify()
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id)
    notify()
  }, 200)
}

export function useToastStore(): ToastState[] {
  const [state, setState] = useState<ToastState[]>([])

  useEffect(() => {
    setState([...toasts])
    listeners.add(setState)
    return () => { listeners.delete(setState) }
  }, [])

  return state
}
