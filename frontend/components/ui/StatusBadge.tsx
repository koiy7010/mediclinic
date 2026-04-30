"use client"

import { Check, Clock, AlertTriangle, FileWarning, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type StatusType = 'complete' | 'pending' | 'abnormal' | 'incomplete' | 'loading'

interface StatusBadgeProps {
  status: StatusType
  label?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const statusConfig: Record<StatusType, {
  icon: typeof Check
  label: string
  bgClass: string
  textClass: string
  borderClass: string
}> = {
  complete: {
    icon: Check,
    label: 'Complete',
    bgClass: 'bg-[hsl(var(--success)/0.1)]',
    textClass: 'text-[hsl(var(--success))]',
    borderClass: 'border-[hsl(var(--success)/0.3)]'
  },
  pending: {
    icon: Clock,
    label: 'Pending Review',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-600',
    borderClass: 'border-amber-200'
  },
  abnormal: {
    icon: AlertTriangle,
    label: 'Abnormal Results',
    bgClass: 'bg-[hsl(var(--destructive)/0.1)]',
    textClass: 'text-[hsl(var(--destructive))]',
    borderClass: 'border-[hsl(var(--destructive)/0.3)]'
  },
  incomplete: {
    icon: FileWarning,
    label: 'Incomplete',
    bgClass: 'bg-[hsl(var(--muted))]',
    textClass: 'text-[hsl(var(--muted-foreground))]',
    borderClass: 'border-[hsl(var(--border))]'
  },
  loading: {
    icon: Loader2,
    label: 'Loading',
    bgClass: 'bg-[hsl(var(--muted))]',
    textClass: 'text-[hsl(var(--muted-foreground))]',
    borderClass: 'border-[hsl(var(--border))]'
  }
}

const sizeClasses = {
  sm: 'text-[10px] px-1.5 py-0.5 gap-1',
  md: 'text-xs px-2 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1.5 gap-2'
}

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4'
}

export function StatusBadge({
  status,
  label,
  size = 'md',
  className
}: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span className={cn(
      "inline-flex items-center font-semibold rounded-full border",
      config.bgClass,
      config.textClass,
      config.borderClass,
      sizeClasses[size],
      className
    )}>
      <Icon className={cn(
        iconSizes[size],
        status === 'loading' && 'animate-spin'
      )} />
      {label || config.label}
    </span>
  )
}

interface PatientStatusHeaderProps {
  status: StatusType
  className?: string
}

export function PatientStatusHeader({ status, className }: PatientStatusHeaderProps) {
  const config = statusConfig[status]
  
  const headerColors: Record<StatusType, string> = {
    complete: 'bg-[hsl(var(--success))]',
    pending: 'bg-amber-500',
    abnormal: 'bg-[hsl(var(--destructive))]',
    incomplete: 'bg-[hsl(var(--muted-foreground))]',
    loading: 'bg-[hsl(var(--primary))]'
  }

  return (
    <div className={cn(
      "px-3 py-1 text-white text-xs font-semibold uppercase tracking-wide",
      headerColors[status],
      className
    )}>
      {config.label}
    </div>
  )
}
