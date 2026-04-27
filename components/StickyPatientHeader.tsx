"use client"

import { User, Building2, Calendar, ClipboardList, CalendarCheck, BadgeCheck, AlertCircle, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { usePatient } from '@/lib/patient-context'
import Link from 'next/link'

interface Patient {
  last_name: string
  first_name: string
  middle_name?: string
  employer?: string
  birthdate?: string
  gender?: string
}

interface LastVisitInfo {
  date: string
  test: string
  normal: boolean | null
}

interface Props {
  patient: Patient
  extra?: LastVisitInfo | null
  module?: string
}

const quickLinks = [
  { href: '/laboratory', label: 'Lab' },
  { href: '/medical-exam', label: 'Exam' },
  { href: '/utz', label: 'UTZ' },
  { href: '/xray', label: 'X-Ray' },
  { href: '/ecg', label: 'ECG' },
]

export default function StickyPatientHeader({ patient, extra, module }: Props) {
  const [showQuickNav, setShowQuickNav] = useState(false)
  const { setPanelOpen } = usePatient()

  if (!patient) return null

  const calcAge = (birthdate?: string) => {
    if (!birthdate) return '—'
    const diff = Date.now() - new Date(birthdate).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
  }

  return (
    <div className="sticky top-0 z-30 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md print:hidden">
      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center gap-4 lg:gap-6">
        {module && (
          <>
            <div className="relative">
              <button
                onClick={() => setShowQuickNav(!showQuickNav)}
                className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
              >
                {module}
                <ChevronDown className={`w-3 h-3 transition-transform ${showQuickNav ? 'rotate-180' : ''}`} />
              </button>
              
              {showQuickNav && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowQuickNav(false)} 
                  />
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-[hsl(var(--border))] overflow-hidden z-50 min-w-[120px]">
                    {quickLinks.map(link => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setShowQuickNav(false)}
                        className={`block px-4 py-2 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors ${
                          module === link.label ? 'bg-[hsl(var(--accent))] font-medium' : ''
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="w-px h-6 bg-white/20 hidden sm:block" />
          </>
        )}

        <button
          onClick={() => setPanelOpen(true)}
          className="flex items-center gap-2 hover:bg-white/10 rounded-lg px-2 py-1 -mx-2 transition-colors cursor-pointer"
        >
          <User className="w-4 h-4 opacity-75" />
          <div>
            <p className="text-xs opacity-75 uppercase tracking-wide">Patient</p>
            <p className="font-semibold text-sm">
              {patient.last_name}, {patient.first_name} {patient.middle_name || ''}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 opacity-75" />
          <div>
            <p className="text-xs opacity-75 uppercase tracking-wide">Company</p>
            <p className="font-semibold text-sm">{patient.employer || '—'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 opacity-75" />
          <div>
            <p className="text-xs opacity-75 uppercase tracking-wide">Age / Sex</p>
            <p className="font-semibold text-sm">
              {calcAge(patient.birthdate)} yrs / {patient.gender || '—'}
            </p>
          </div>
        </div>

        {extra && (
          <>
            <div className="w-px h-8 bg-white/20 hidden sm:block" />

            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 opacity-75" />
              <div>
                <p className="text-xs opacity-75 uppercase tracking-wide">Last Visit</p>
                <p className="font-semibold text-sm">{extra.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 opacity-75" />
              <div>
                <p className="text-xs opacity-75 uppercase tracking-wide">Last Test</p>
                <p className="font-semibold text-sm">{extra.test}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {extra.normal === true
                ? <BadgeCheck className="w-4 h-4 opacity-75" />
                : <AlertCircle className="w-4 h-4 opacity-75" />
              }
              <div>
                <p className="text-xs opacity-75 uppercase tracking-wide">Result</p>
                <p className={`font-semibold text-sm ${extra.normal === false ? 'text-amber-200' : ''}`}>
                  {extra.normal === null ? '—' : extra.normal ? 'Normal' : 'Abnormal'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
