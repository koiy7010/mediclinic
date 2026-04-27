"use client"

import { useRef, useEffect, useCallback } from 'react'

interface SwipeOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
  enabled?: boolean
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  enabled = true
}: SwipeOptions) {
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return
    touchStartX.current = e.touches[0].clientX
    touchEndX.current = null
  }, [enabled])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled) return
    touchEndX.current = e.touches[0].clientX
  }, [enabled])

  const handleTouchEnd = useCallback(() => {
    if (!enabled) return
    if (touchStartX.current === null || touchEndX.current === null) return

    const diff = touchStartX.current - touchEndX.current

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && onSwipeLeft) {
        onSwipeLeft()
      } else if (diff < 0 && onSwipeRight) {
        onSwipeRight()
      }
    }

    touchStartX.current = null
    touchEndX.current = null
  }, [enabled, threshold, onSwipeLeft, onSwipeRight])

  useEffect(() => {
    const element = document.body

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])
}

// Hook for element-specific swipe
export function useSwipeRef<T extends HTMLElement>({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  enabled = true
}: SwipeOptions) {
  const ref = useRef<T>(null)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || !enabled) return

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
      touchEndX.current = null
    }

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.touches[0].clientX
    }

    const handleTouchEnd = () => {
      if (touchStartX.current === null || touchEndX.current === null) return

      const diff = touchStartX.current - touchEndX.current

      if (Math.abs(diff) > threshold) {
        if (diff > 0 && onSwipeLeft) {
          onSwipeLeft()
        } else if (diff < 0 && onSwipeRight) {
          onSwipeRight()
        }
      }

      touchStartX.current = null
      touchEndX.current = null
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [enabled, threshold, onSwipeLeft, onSwipeRight])

  return ref
}
