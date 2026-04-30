"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Filter, Calendar, Building2, Hash } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { mockPatients } from '@/lib/mockData'
import { usePatient } from '@/lib/patient-context'
import { useSearch } from '@/lib/search-context'
import { useRecentPatients } from '@/components/ui/RecentPatients'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

function calcAge(birthdate?: string) {
  if (!birthdate) return '—'
  return Math.floor((Date.now() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
}

type SearchMode = 'all' | 'id' | 'employer' | 'date'

interface SearchFilters {
  mode: SearchMode
  employer?: string
  dateFrom?: string
  dateTo?: string
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({ mode: 'all' })
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const { setSelectedPatient, setPanelOpen } = usePatient()
  const { addRecentPatient } = useRecentPatients()

  const { data: patients = [] } = useQuery<any[]>({
    queryKey: ['patients'],
    queryFn: async () => mockPatients,
  })

  // Get unique employers for filter dropdown
  const employers = [...new Set((patients as any[]).map(p => p.employer).filter(Boolean))].sort()

  const results = (() => {
    let filtered = patients as any[]
    const q = query.toLowerCase().trim()

    // Apply search mode
    if (q) {
      switch (filters.mode) {
        case 'id':
          filtered = filtered.filter(p => (p.id || '').toLowerCase().includes(q))
          break
        case 'employer':
          filtered = filtered.filter(p => (p.employer || '').toLowerCase().includes(q))
          break
        case 'date':
          filtered = filtered.filter(p => (p.registration_date || '').includes(q))
          break
        default:
          filtered = filtered.filter(p =>
            (p.last_name || '').toLowerCase().includes(q) ||
            (p.first_name || '').toLowerCase().includes(q) ||
            (p.employer || '').toLowerCase().includes(q) ||
            (p.contact_number || '').toLowerCase().includes(q) ||
            (p.id || '').toLowerCase().includes(q)
          )
      }
    }

    // Apply employer filter
    if (filters.employer) {
      filtered = filtered.filter(p => p.employer === filters.employer)
    }

    // Apply date range filter
    if (filters.dateFrom) {
      const dateFrom = filters.dateFrom
      filtered = filtered.filter(p => p.registration_date >= dateFrom)
    }
    if (filters.dateTo) {
      const dateTo = filters.dateTo
      filtered = filtered.filter(p => p.registration_date <= dateTo)
    }

    // Sort and limit
    if (!q) {
      filtered = [...filtered]
        .sort((a, b) => new Date(b.registration_date).getTime() - new Date(a.registration_date).getTime())
    }

    return filtered.slice(0, 10)
  })()

  useEffect(() => { setActiveIndex(0) }, [query, filters])
  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSelect = useCallback((p: any) => {
    setSelectedPatient(p)
    setPanelOpen(true)
    addRecentPatient(p)
    onClose()
  }, [setSelectedPatient, setPanelOpen, addRecentPatient, onClose])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, results.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)) }
      if (e.key === 'Enter' && results[activeIndex]) { handleSelect(results[activeIndex]) }
      if (e.key === 'Tab') { e.preventDefault(); setShowFilters(f => !f) }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [results, activeIndex, handleSelect, onClose])

  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const clearFilters = () => {
    setFilters({ mode: 'all' })
  }

  const hasActiveFilters = filters.mode !== 'all' || filters.employer || filters.dateFrom || filters.dateTo

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-xl bg-[hsl(var(--card))] rounded-xl shadow-2xl border border-[hsl(var(--border))] overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--border))]">
          <Search className="w-4 h-4 text-[hsl(var(--muted-foreground))] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder={
              filters.mode === 'id' ? 'Search by ID…' :
              filters.mode === 'employer' ? 'Search by employer…' :
              filters.mode === 'date' ? 'Search by date (YYYY-MM-DD)…' :
              'Search patient…'
            }
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-1.5 rounded-lg transition-colors cursor-pointer",
              showFilters || hasActiveFilters
                ? "bg-[hsl(var(--primary))] text-white"
                : "hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
            )}
          >
            <Filter className="w-4 h-4" />
          </button>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-mono">esc</kbd>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Filters</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-[hsl(var(--primary))] hover:underline cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>
            
            {/* Search mode */}
            <div className="flex flex-wrap gap-2">
              {[
                { mode: 'all' as SearchMode, label: 'All', icon: Search },
                { mode: 'id' as SearchMode, label: 'By ID', icon: Hash },
                { mode: 'employer' as SearchMode, label: 'By Employer', icon: Building2 },
                { mode: 'date' as SearchMode, label: 'By Date', icon: Calendar },
              ].map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setFilters(f => ({ ...f, mode }))}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                    filters.mode === mode
                      ? "bg-[hsl(var(--primary))] text-white"
                      : "bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Employer filter */}
            <div className="flex items-center gap-3">
              <label className="text-xs text-[hsl(var(--muted-foreground))] w-20">Employer:</label>
              <select
                value={filters.employer || ''}
                onChange={e => setFilters(f => ({ ...f, employer: e.target.value || undefined }))}
                className="flex-1 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              >
                <option value="">All employers</option>
                {employers.map(emp => (
                  <option key={emp} value={emp}>{emp}</option>
                ))}
              </select>
            </div>

            {/* Date range */}
            <div className="flex items-center gap-3">
              <label className="text-xs text-[hsl(var(--muted-foreground))] w-20">Date range:</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value || undefined }))}
                className="flex-1 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
              <span className="text-xs text-[hsl(var(--muted-foreground))]">to</span>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value || undefined }))}
                className="flex-1 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
            </div>
          </div>
        )}

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto">
          {results.length > 0 ? (
            <>
              {!query.trim() && !hasActiveFilters && (
                <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide px-4 pt-2">
                  Recent
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
                    <p className={`text-xs truncate ${i === activeIndex ? 'text-white/70' : 'text-[hsl(var(--muted-foreground))]'}`}>
                      {p.employer || '—'} · {calcAge(p.birthdate)} yrs · {p.gender || '—'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      i === activeIndex ? 'bg-white/20 text-white/80' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                    }`}>
                      {p.id}
                    </span>
                    <p className={`text-[10px] mt-0.5 ${i === activeIndex ? 'text-white/60' : 'text-[hsl(var(--muted-foreground))]'}`}>
                      {p.registration_date}
                    </p>
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
          <span>↑↓ navigate · enter select · tab filters</span>
          <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  )
}

export default function EnhancedGlobalSearch() {
  const { open, setOpen } = useSearch()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [setOpen])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 bg-[hsl(var(--sidebar-accent))] hover:bg-[hsl(var(--sidebar-accent)/0.8)] rounded-lg px-3 py-2 transition-colors cursor-pointer"
      >
        <Search className="w-4 h-4 text-[hsl(var(--sidebar-foreground)/0.5)] shrink-0" />
        <span className="flex-1 text-sm text-left text-[hsl(var(--sidebar-foreground)/0.4)]">Search…</span>
        <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground)/0.3)] font-mono border border-[hsl(var(--sidebar-border))]">
          ⌘K
        </kbd>
      </button>

      {mounted && open && createPortal(
        <SearchOverlay onClose={() => setOpen(false)} />,
        document.body
      )}
    </>
  )
}
