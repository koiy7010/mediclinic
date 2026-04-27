"use client"

import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSearch } from '@/lib/search-context'
import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  label: string
}

export default function NoPatientSelected({ icon: Icon, label }: Props) {
  const { setOpen } = useSearch()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--background))] gap-3">
      <div className="w-12 h-12 rounded-full bg-[hsl(var(--primary)/0.08)] flex items-center justify-center">
        <Icon className="w-6 h-6 text-[hsl(var(--primary)/0.5)]" />
      </div>
      <p className="text-sm text-[hsl(var(--muted-foreground))]">No patient selected</p>
      <Button onClick={() => setOpen(true)} size="sm">
        <Search className="w-4 h-4 mr-2" /> Search Patient
        <kbd className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-white/20 font-mono">Ctrl K</kbd>
      </Button>
    </div>
  )
}
