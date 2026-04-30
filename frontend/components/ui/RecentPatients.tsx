"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Clock, ChevronDown, User } from 'lucide-react'
import { usePatient } from '@/lib/patient-context'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'mediclinic_recent_patients'
const MAX_RECENT = 5

interface Patient {
  id: string
  first_name: string
  last_name: string
  employer?: string
  birthdate?: string
  gender?: string
}

function calcAge(birthdate?: string) {
  if (!birthdate) return '—'
  return Math.floor((Date.now() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
}

export function useRecentPatients() {
  const [recentPatients, setRecentPatients] = useState<Patient[]>([])
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setRecentPatients(JSON.parse(stored))
      } catch {
        setRecentPatients([])
      }
    }
  }, [])

  const addRecentPatient = useCallback((patient: Patient) => {
    setRecentPatients(prev => {
      const filtered = prev.filter(p => p.id !== patient.id)
      const updated = [patient, ...filtered].slice(0, MAX_RECENT)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  return { recentPatients, addRecentPatient }
}

interface RecentPatientsDropdownProps {
  className?: string
}

export function RecentPatientsDropdown({ className }: RecentPatientsDropdownProps) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { selectedPatient, setSelectedPatient, setPanelOpen } = usePatient()
  const { recentPatients } = useRecentPatients()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (recentPatients.length === 0) return null

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(var(--sidebar-accent))] hover:bg-[hsl(var(--sidebar-accent)/0.8)] transition-colors text-sm cursor-pointer"
      >
        <Clock className="w-3.5 h-3.5 text-[hsl(var(--sidebar-foreground)/0.6)]" />
        <span className="text-[hsl(var(--sidebar-foreground)/0.8)] hidden sm:inline">Recent</span>
        <ChevronDown className={cn(
          "w-3.5 h-3.5 text-[hsl(var(--sidebar-foreground)/0.5)] transition-transform",
          open && "rotate-180"
        )} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
            <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
              Recent Patients
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {recentPatients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => {
                  setSelectedPatient(patient as any)
                  setPanelOpen(true)
                  setOpen(false)
                }}
                className={cn(
                  "w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-[hsl(var(--accent)/0.5)] transition-colors cursor-pointer",
                  selectedPatient?.id === patient.id && "bg-[hsl(var(--accent)/0.3)]"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[hsl(var(--primary))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {patient.last_name}, {patient.first_name}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                    {patient.employer || '—'} · {calcAge(patient.birthdate)} yrs
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
