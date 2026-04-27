"use client"

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn("flex items-center gap-1 text-sm", className)}>
      <Link
        href="/"
        className="p-1 rounded hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <ChevronRight className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          {item.href ? (
            <Link
              href={item.href}
              className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 px-2 py-1 text-[hsl(var(--foreground))] font-medium">
              {item.icon}
              <span>{item.label}</span>
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}

interface PageBreadcrumbProps {
  patientName?: string
  module: string
  section?: string
  className?: string
}

export function PageBreadcrumb({ patientName, module, section, className }: PageBreadcrumbProps) {
  const items: BreadcrumbItem[] = []
  
  if (patientName) {
    items.push({ label: patientName, href: '/' })
  }
  
  items.push({ label: module })
  
  if (section) {
    items.push({ label: section })
  }

  return <Breadcrumb items={items} className={className} />
}
