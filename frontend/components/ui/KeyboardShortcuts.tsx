"use client"

import { useEffect, useCallback } from 'react'

interface ShortcutConfig {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  action: () => void
  description?: string
}

interface UseKeyboardShortcutsOptions {
  shortcuts: ShortcutConfig[]
  enabled?: boolean
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return
    
    // Don't trigger shortcuts when typing in inputs
    const target = e.target as HTMLElement
    const isInput = target.tagName === 'INPUT' || 
                   target.tagName === 'TEXTAREA' || 
                   target.isContentEditable

    for (const shortcut of shortcuts) {
      const keyMatch = e.key?.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey)
      const altMatch = shortcut.alt ? e.altKey : !e.altKey
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey

      if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
        // Allow Ctrl+S even in inputs
        if (shortcut.ctrl && shortcut.key.toLowerCase() === 's') {
          e.preventDefault()
          shortcut.action()
          return
        }
        
        // For number keys (tab switching), allow even in inputs if Alt is pressed
        if (shortcut.alt && /^[1-9]$/.test(shortcut.key)) {
          e.preventDefault()
          shortcut.action()
          return
        }
        
        // For other shortcuts, don't trigger in inputs
        if (!isInput) {
          e.preventDefault()
          shortcut.action()
          return
        }
      }
    }
  }, [shortcuts, enabled])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

// Global shortcuts hook for common actions
export function useGlobalShortcuts({
  onSave,
  onNew,
  onSearch,
  onNextTab,
  onPrevTab,
}: {
  onSave?: () => void
  onNew?: () => void
  onSearch?: () => void
  onNextTab?: () => void
  onPrevTab?: () => void
}) {
  const shortcuts: ShortcutConfig[] = []

  if (onSave) {
    shortcuts.push({ key: 's', ctrl: true, action: onSave, description: 'Save' })
    shortcuts.push({ key: 's', alt: true, action: onSave, description: 'Save' })
  }
  
  if (onNew) {
    shortcuts.push({ key: 'n', alt: true, action: onNew, description: 'New' })
  }
  
  if (onSearch) {
    shortcuts.push({ key: 'k', ctrl: true, action: onSearch, description: 'Search' })
  }
  
  if (onNextTab) {
    shortcuts.push({ key: 'ArrowRight', alt: true, action: onNextTab, description: 'Next tab' })
  }
  
  if (onPrevTab) {
    shortcuts.push({ key: 'ArrowLeft', alt: true, action: onPrevTab, description: 'Previous tab' })
  }

  useKeyboardShortcuts({ shortcuts })
}

// Tab-specific shortcuts (1-9 for switching tabs)
export function useTabShortcuts(
  tabs: { id: string }[],
  activeTab: string,
  setActiveTab: (tab: string) => void
) {
  const shortcuts: ShortcutConfig[] = tabs.slice(0, 9).map((tab, index) => ({
    key: String(index + 1),
    alt: true,
    action: () => setActiveTab(tab.id),
    description: `Switch to tab ${index + 1}`
  }))

  useKeyboardShortcuts({ shortcuts })
}
