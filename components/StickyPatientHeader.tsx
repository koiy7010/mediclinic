"use client"

import { User, Building2, Calendar, ClipboardList, CalendarCheck, BadgeCheck, AlertCircle } from 'lucide-react'

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

export default function StickyPatientHeader({ patient, extra, module }: Props) {
  if (!patient) return null

  const calcAge = (birthdate?: string) => {
    if (!birthdate) return '—'
    const diff = Date.now() - new Date(birthdate).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
  }

  return (
    <div className="sticky top-0 z-30 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center gap-6">
        {module && (
          <>
            <span className="text-xs font-bold uppercase tracking-widest opacity-60 hidden sm:inline">{module}</span>
            <div className="w-px h-6 bg-white/20 hidden sm:block" />
          </>
        )}

        <div className="flex items-center gap-2">
          <User className="w-4 h-4 opacity-75" />
          <div>
            <p className="text-xs opacity-75 uppercase tracking-wide">Patient</p>
            <p className="font-semibold text-sm">
              {patient.last_name}, {patient.first_name} {patient.middle_name || ''}
            </p>
          </div>
        </div>

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
                <p className="font-semibold text-sm">
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
