'use client'

import { format } from 'date-fns'
import { PlusCircle, ChevronDown } from 'lucide-react'
import { Button } from './button'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Visit {
  id: string
  resultDate: string
  label?: string
}

interface VisitSelectorProps {
  visits: Visit[]
  selectedId: string | null   // null = "new visit"
  onSelect: (id: string | null) => void
}

export function VisitSelector({ visits, selectedId, onSelect }: VisitSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const sorted = [...visits].sort((a, b) => b.resultDate.localeCompare(a.resultDate))
  const selected = sorted.find(v => v.id === selectedId)
  const label = selectedId === null
    ? '+ New Visit'
    : selected
      ? `Visit: ${format(new Date(selected.resultDate), 'MMM d, yyyy')}`
      : 'Select visit…'

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm font-medium hover:bg-[hsl(var(--accent))] transition-colors cursor-pointer"
      >
        <span className={cn(selectedId === null && 'text-[hsl(var(--primary))]')}>{label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 min-w-[200px] rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg overflow-hidden">
          <button
            onClick={() => { onSelect(null); setOpen(false) }}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[hsl(var(--accent))] transition-colors cursor-pointer text-[hsl(var(--primary))]',
              selectedId === null && 'bg-[hsl(var(--accent))]'
            )}
          >
            <PlusCircle className="w-4 h-4" /> New Visit
          </button>

          {sorted.length > 0 && <div className="border-t border-[hsl(var(--border))]" />}

          {sorted.map((v, i) => (
            <button
              key={v.id}
              onClick={() => { onSelect(v.id); setOpen(false) }}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-[hsl(var(--accent))] transition-colors cursor-pointer',
                v.id === selectedId && 'bg-[hsl(var(--accent))] font-medium'
              )}
            >
              <span>{format(new Date(v.resultDate), 'MMM d, yyyy')}</span>
              {i === 0 && <span className="text-[10px] text-[hsl(var(--muted-foreground))] ml-2">latest</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
