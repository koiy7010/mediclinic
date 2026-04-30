"use client"

import { cn } from '@/lib/utils'

interface NormalToggleProps {
  value: boolean | null
  onChange: (v: boolean | null) => void
  name: string
}

export function NormalToggle({ value, onChange, name }: NormalToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Result:</span>
      <button
        type="button"
        onClick={() => onChange(value === true ? null : true)}
        className={cn(
          "px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all cursor-pointer",
          value === true
            ? "bg-[hsl(var(--success))] border-[hsl(var(--success))] text-white shadow-sm"
            : "bg-transparent border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--success)/0.6)] hover:text-[hsl(var(--success))]"
        )}
      >
        Normal
      </button>
      <button
        type="button"
        onClick={() => onChange(value === false ? null : false)}
        className={cn(
          "px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all cursor-pointer",
          value === false
            ? "bg-[hsl(var(--destructive))] border-[hsl(var(--destructive))] text-white shadow-sm"
            : "bg-transparent border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--destructive)/0.6)] hover:text-[hsl(var(--destructive))]"
        )}
      >
        Abnormal
      </button>
      {value !== null && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] px-2 py-1 rounded hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
        >
          Clear
        </button>
      )}
    </div>
  )
}
