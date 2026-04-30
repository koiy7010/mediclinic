"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { mockPatients } from '@/lib/mockData'
import { usePatient } from '@/lib/patient-context'
import { useRecentPatients } from '@/components/ui/RecentPatients'
import type { LucideIcon } from 'lucide-react'

function calcAge(birthdate?: string) {
  if (!birthdate) return '—'
  return Math.floor(
    (Date.now() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  )
}

interface Props {
  icon: LucideIcon
  label: string
}

export default function NoPatientSelected({ icon: Icon, label }: Props) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const { setSelectedPatient, setPanelOpen } = usePatient()
  const { addRecentPatient } = useRecentPatients()

  const { data: patients = [] } = useQuery<any[]>({
    queryKey: ['patients'],
    queryFn: async () => mockPatients,
  })

  const results = query.trim()
    ? (patients as any[])
        .filter((p: any) => {
          const q = query.toLowerCase()
          return (
            (p.last_name || '').toLowerCase().includes(q) ||
            (p.first_name || '').toLowerCase().includes(q) ||
            (p.employer || '').toLowerCase().includes(q) ||
            (p.contact_number || '').toLowerCase().includes(q) ||
            (p.id || '').toLowerCase().includes(q)
          )
        })
        .slice(0, 10)
    : [...(patients as any[])]
        .sort(
          (a, b) =>
            new Date(b.registration_date).getTime() -
            new Date(a.registration_date).getTime()
        )
        .slice(0, 10)

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSelect = useCallback(
    (p: any) => {
      setSelectedPatient(p)
      setPanelOpen(true)
      addRecentPatient(p)
    },
    [setSelectedPatient, setPanelOpen, addRecentPatient]
  )

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, results.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter' && results[activeIndex]) {
        handleSelect(results[activeIndex])
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [results, activeIndex, handleSelect])

  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  return (
    <div className="min-h-screen flex flex-col items-center bg-[hsl(var(--background))] pt-[10vh] px-4">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 mb-6">
        <div className="w-12 h-12 rounded-full bg-[hsl(var(--primary)/0.08)] flex items-center justify-center">
          <Icon className="w-6 h-6 text-[hsl(var(--primary)/0.5)]" />
        </div>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Select a patient to begin — <span className="font-medium">{label}</span>
        </p>
      </div>

      {/* Inline search card */}
      <div className="w-full max-w-lg bg-[hsl(var(--card))] rounded-xl shadow-lg border border-[hsl(var(--border))] overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--border))]">
          <Search className="w-4 h-4 text-[hsl(var(--muted-foreground))] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search patient by name, employer, ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-mono">
            Ctrl K
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto">
          {results.length > 0 ? (
            <>
              {!query.trim() && (
                <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide px-4 pt-2">
                  Recent patients
                </p>
              )}
              {results.map((p: any, i: number) => (
                <button
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-3 cursor-pointer transition-colors ${
                    i === activeIndex
                      ? 'bg-[hsl(var(--primary))] text-white'
                      : 'hover:bg-[hsl(var(--muted)/0.5)]'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {p.last_name}, {p.first_name}
                    </p>
                    <p
                      className={`text-xs truncate ${
                        i === activeIndex
                          ? 'text-white/70'
                          : 'text-[hsl(var(--muted-foreground))]'
                      }`}
                    >
                      {p.employer || '—'} · {calcAge(p.birthdate)} yrs · {p.gender || '—'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        i === activeIndex
                          ? 'bg-white/20 text-white/80'
                          : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                      }`}
                    >
                      {p.id}
                    </span>
                  </div>
                </button>
              ))}
            </>
          ) : (
            <div className="px-4 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
              No patients found
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] text-[10px] text-[hsl(var(--muted-foreground))]">
          <span>↑↓ navigate · enter select</span>
          <span>
            {results.length} result{results.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
