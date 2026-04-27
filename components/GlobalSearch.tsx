"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, User, Building2, Calendar } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { mockPatients } from '@/lib/mockData'
import { usePatient } from '@/lib/patient-context'
import { useSearch } from '@/lib/search-context'
import { createPortal } from 'react-dom'

function calcAge(birthdate?: string) {
  if (!birthdate) return '—'
  return Math.floor((Date.now() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const { setSelectedPatient, setPanelOpen } = usePatient()

  const { data: patients = [] } = useQuery<any[]>({
    queryKey: ['patients'],
    queryFn: async () => mockPatients,
  })

  const results = query.trim()
    ? (patients as any[]).filter((p: any) => {
        const q = query.toLowerCase()
        return (
          (p.last_name || '').toLowerCase().includes(q) ||
          (p.first_name || '').toLowerCase().includes(q) ||
          (p.employer || '').toLowerCase().includes(q) ||
          (p.contact_number || '').toLowerCase().includes(q)
        )
      }).slice(0, 10)
    : [...(patients as any[])]
        .sort((a, b) => new Date(b.registration_date).getTime() - new Date(a.registration_date).getTime())
        .slice(0, 10)

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSelect = useCallback((p: any) => {
    setSelectedPatient(p)
    setPanelOpen(true)
    onClose()
  }, [setSelectedPatient, setPanelOpen, onClose])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, results.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)) }
      if (e.key === 'Enter' && results[activeIndex]) { handleSelect(results[activeIndex]) }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [results, activeIndex, handleSelect, onClose])

  return (
    <div
      className="fixed inset-0 z-100 flex flex-col items-center pt-24 px-4 pb-8"
      style={{ backgroundColor: 'rgba(10, 15, 30, 0.75)', backdropFilter: 'blur(20px) saturate(180%)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Search box */}
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-4 rounded-2xl px-5 py-4 shadow-2xl border border-white/10"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}
        >
          <Search className="w-6 h-6 text-white/70 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search patient by name, employer…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-lg text-white placeholder:text-white/35 outline-none"
          />
          {query ? (
            <button onClick={() => setQuery('')} className="p-1 rounded-md hover:bg-white/10 text-white/50 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10 text-white/50 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Hint */}
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-white/40">
          <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 font-mono text-white/50">↑↓</kbd> navigate</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 font-mono text-white/50">Enter</kbd> select</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 font-mono text-white/50">Esc</kbd> close</span>
        </div>
      </div>

      {/* Results */}
      <div className="w-full max-w-2xl mt-6 space-y-2 overflow-y-auto max-h-[55vh]">
        {results.length > 0 ? (
          <>
            {!query.trim() && (
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wide px-1 mb-3">
                Recent Patients (Top 10)
              </p>
            )}
            {results.map((p: any, i: number) => (
              <button
                key={p.id}
                onClick={() => handleSelect(p)}
                onMouseEnter={() => setActiveIndex(i)}
                style={i === activeIndex
                  ? { backgroundColor: 'hsl(var(--primary))', borderColor: 'hsl(var(--primary))' }
                  : { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' }
                }
                className="w-full text-left rounded-xl px-5 py-4 transition-all flex items-center gap-4 border cursor-pointer hover:border-white/20"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white/10">
                  <User className="w-5 h-5 text-white/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate text-white">
                    {p.last_name}, {p.first_name} {p.middle_name || ''}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />{p.employer || '—'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{calcAge(p.birthdate)} yrs · {p.gender || '—'}
                    </span>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full shrink-0 bg-white/10 text-white/50">
                  {p.id}
                </span>
              </button>
            ))}
          </>
        ) : (
          <div className="text-center py-12 text-white/40">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-white/60">No patients found for &quot;{query}&quot;</p>
            <p className="text-sm mt-1">Try searching by last name, first name, or employer</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function GlobalSearch() {
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
        className="w-full flex items-center gap-3 bg-[hsl(var(--sidebar-accent))] hover:bg-[hsl(var(--sidebar-accent)/0.8)] rounded-lg px-3 py-2.5 transition-colors group cursor-pointer"
      >
        <Search className="w-4 h-4 text-[hsl(var(--sidebar-foreground)/0.5)] group-hover:text-[hsl(var(--sidebar-foreground)/0.8)] shrink-0" />
        <span className="flex-1 text-sm text-left text-[hsl(var(--sidebar-foreground)/0.4)]">Search patient…</span>
        <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground)/0.3)] font-mono border border-[hsl(var(--sidebar-border))]">
          Ctrl K
        </kbd>
      </button>

      {mounted && open && createPortal(
        <SearchOverlay onClose={() => setOpen(false)} />,
        document.body
      )}
    </>
  )
}
