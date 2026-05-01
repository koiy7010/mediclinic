"use client"

import { Save, ChevronRight, Printer, Undo2 } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface FloatingActionBarProps {
  onSave: () => void
  onNext?: () => void
  onPrint?: () => void
  onUndo?: () => void
  onSaveAll?: () => void
  saving?: boolean
  hasNext?: boolean
  nextLabel?: string
  showUndo?: boolean
  className?: string
}

export function FloatingActionBar({
  onSave,
  onNext,
  onPrint,
  onUndo,
  onSaveAll,
  saving = false,
  hasNext = false,
  nextLabel = 'Next',
  showUndo = false,
  className
}: FloatingActionBarProps) {
  return (
    <div className={cn(
      "fixed bottom-6 left-1/2 -translate-x-1/2 z-40",
      "bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl",
      "px-2 py-2 flex items-center gap-2",
      "animate-in slide-in-from-bottom-4 duration-300",
      className
    )}>
      {showUndo && onUndo && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          title="Undo last change"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
      )}
      
      <Button
        onClick={onSave}
        disabled={saving}
        className="px-6 shadow-sm"
      >
        <Save className="w-4 h-4 mr-2" />
        {saving ? 'Saving…' : 'Save'}
        <kbd className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-white/20 font-mono hidden sm:inline">
          Ctrl+S
        </kbd>
      </Button>

      {onSaveAll && (
        <Button
          variant="outline"
          onClick={onSaveAll}
          disabled={saving}
          className="px-4"
          title="Save all tabs"
        >
          <Save className="w-4 h-4 mr-1" />
          Save All
        </Button>
      )}

      {hasNext && onNext && (
        <Button
          variant="outline"
          onClick={onNext}
          className="px-4"
        >
          {nextLabel}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      )}

      {onPrint && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrint}
          className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          title="Print"
        >
          <Printer className="w-4 h-4" />
        </Button>
      )}

      <div className="hidden sm:flex items-center gap-1 ml-2 pl-2 border-l border-[hsl(var(--border))]">
        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
          Ctrl+S save{hasNext ? ' · Alt+→ next' : ''}
        </span>
      </div>
    </div>
  )
}
