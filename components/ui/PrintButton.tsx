"use client"

import { useState } from 'react'
import { Printer, Check, X } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface PrintSection {
  id: string
  label: string
  defaultChecked?: boolean
}

interface PrintButtonProps {
  sections?: PrintSection[]
  onPrint?: (selectedSections: string[]) => void
  className?: string
}

export function PrintButton({ sections, onPrint, className }: PrintButtonProps) {
  const [showOptions, setShowOptions] = useState(false)
  const [selectedSections, setSelectedSections] = useState<string[]>(
    sections?.filter(s => s.defaultChecked !== false).map(s => s.id) || []
  )

  const handlePrint = () => {
    if (onPrint) {
      onPrint(selectedSections)
    } else {
      window.print()
    }
    setShowOptions(false)
  }

  const toggleSection = (id: string) => {
    setSelectedSections(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id]
    )
  }

  if (!sections || sections.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.print()}
        className={className}
      >
        <Printer className="w-4 h-4 mr-2" />
        Print
      </Button>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowOptions(!showOptions)}
      >
        <Printer className="w-4 h-4 mr-2" />
        Print
      </Button>

      {showOptions && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowOptions(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
              <p className="text-sm font-semibold">Select sections to print</p>
            </div>
            <div className="p-2 max-h-64 overflow-y-auto">
              {sections.map((section) => (
                <label
                  key={section.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[hsl(var(--muted)/0.5)] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedSections.includes(section.id)}
                    onChange={() => toggleSection(section.id)}
                    className="w-4 h-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--ring))]"
                  />
                  <span className="text-sm">{section.label}</span>
                </label>
              ))}
            </div>
            <div className="px-3 py-2 border-t border-[hsl(var(--border))] flex items-center justify-between">
              <button
                onClick={() => setShowOptions(false)}
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] px-3 py-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <Button size="sm" onClick={handlePrint}>
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Print ({selectedSections.length})
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
