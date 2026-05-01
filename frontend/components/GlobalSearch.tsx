"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { usePatient } from '@/lib/patient-context'
import { useSearch } from '@/lib/search-context'
import { createPortal } from 'react-dom'

function calcAge(birthdate?: string) {
  if (!birthdate) return '—'
  return Math.floor((Date.now() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
}

function normalizePatient(p: any) {
  return {
    id: p.id,
    last_name: p.lastName ?? p.last_name ?? '',
    first_name: p.firstName ?? p.first_name ?? '',
    middle_name: p.middleName ?? p.middle_name ?? '',
    employer: p.employer ?? '',
    birthdate: p.birthdate ?? '',
    gender: p.gender ?? '',
    contact_number: p.contactNumber ?? p.contact_number ?? '',
    address: p.address ?? '',
    marital_status: p.maritalStatus ?? p.marital_status ?? '',
    nationality: p.nationality ?? '',
    registration_date: p.registrationDate ?? p.registration_date ?? '',
  }
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const { setSelectedPatient, setPanelOpen } = usePatient()

  const { data: patients = [] } = useQuery<any[]>({
    queryKey: ['patients'],
    queryFn: async () => {
      const res = await apiClient.patients.list({ size: 100 })
      return (res.content ?? []).map(normalizePatient)
    },
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
      }).slice(0, 8)
    : [...(patients as any[])]
        .sort((a, b) => new Date(b.registration_date).getTime() - new Date(a.registration_date).getTime())
        .slice(0, 8)

  useEffect(() => { setActiveIndex(0) }, [query])
  useEffect(() => { inputRef.current?.focus() }, [])

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

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-lg bg-[hsl(var(--card))] rounded-xl shadow-2xl border border-[hsl(var(--border))] overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--border))]">
          <Search className="w-4 h-4 text-[hsl(var(--muted-foreground))] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search patient…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-mono">esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto">
          {results.length > 0 ? (
            <>
              {!query.trim() && (
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
                      : 'hover:bg-[hsl(var(--muted)_/_0.5)]'
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
                  <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                    i === activeIndex ? 'bg-white/20 text-white/80' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                  }`}>
                    {p.id}
                  </span>
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
        <div className="flex items-center justify-between px-4 py-2 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)_/_0.3)] text-[10px] text-[hsl(var(--muted-foreground))]">
          <span>↑↓ navigate · enter select</span>
          <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
        </div>
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
        className="w-full flex items-center gap-2 bg-[hsl(var(--sidebar-accent))] hover:bg-[hsl(var(--sidebar-accent)_/_0.8)] rounded-lg px-3 py-2 transition-colors cursor-pointer"
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
