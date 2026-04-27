"use client"

import { Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressIndicatorProps {
  completed: number
  total: number
  label?: string
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ProgressIndicator({
  completed,
  total,
  label,
  showPercentage = true,
  size = 'md',
  className
}: ProgressIndicatorProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  const isComplete = percentage === 100

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2'
  }

  return (
    <div className={cn("space-y-1", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs">
          {label && (
            <span className="text-[hsl(var(--muted-foreground))] font-medium">{label}</span>
          )}
          {showPercentage && (
            <span className={cn(
              "font-semibold",
              isComplete ? "text-[hsl(var(--success))]" : "text-[hsl(var(--muted-foreground))]"
            )}>
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div className={cn(
        "w-full bg-[hsl(var(--muted))] rounded-full overflow-hidden",
        sizeClasses[size]
      )}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            isComplete ? "bg-[hsl(var(--success))]" : "bg-[hsl(var(--primary))]"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface SectionProgressProps {
  sections: {
    id: string
    label: string
    completed: boolean
    hasError?: boolean
  }[]
  className?: string
}

export function SectionProgress({ sections, className }: SectionProgressProps) {
  const completed = sections.filter(s => s.completed).length
  const hasErrors = sections.some(s => s.hasError)

  return (
    <div className={cn("space-y-3", className)}>
      <ProgressIndicator
        completed={completed}
        total={sections.length}
        label="Form Progress"
      />
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <div
            key={section.id}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors",
              section.completed
                ? "bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))]"
                : section.hasError
                ? "bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))]"
                : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
            )}
          >
            {section.completed ? (
              <Check className="w-3 h-3" />
            ) : section.hasError ? (
              <AlertCircle className="w-3 h-3" />
            ) : (
              <div className="w-3 h-3 rounded-full border-2 border-current" />
            )}
            {section.label}
          </div>
        ))}
      </div>
    </div>
  )
}

interface TabCompletionBadgeProps {
  completed: boolean
  hasData?: boolean
}

export function TabCompletionBadge({ completed, hasData }: TabCompletionBadgeProps) {
  if (completed) {
    return (
      <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[hsl(var(--success))]">
        <Check className="w-2.5 h-2.5 text-white" />
      </span>
    )
  }
  
  if (hasData) {
    return (
      <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))]" />
    )
  }
  
  return null
}
