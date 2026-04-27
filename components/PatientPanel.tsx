"use client"

import { X, User, FlaskConical, Stethoscope, RadioTower, ScanLine, Zap } from 'lucide-react'
import Link from 'next/link'
import { usePatient } from '@/lib/patient-context'

function calcAge(birthdate?: string) {
  if (!birthdate) return '—'
  return Math.floor((Date.now() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
}

const quickActions = [
  { href: '/laboratory', label: 'Lab', icon: FlaskConical },
  { href: '/medical-exam', label: 'Exam', icon: Stethoscope },
  { href: '/utz', label: 'UTZ', icon: ScanLine },
  { href: '/xray', label: 'X-Ray', icon: RadioTower },
  { href: '/ecg', label: 'ECG', icon: Zap },
]

export default function PatientPanel() {
  const { selectedPatient, panelOpen, setPanelOpen } = usePatient()

  return (
    <>
      {panelOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setPanelOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 right-0 h-full z-50 w-72 bg-[hsl(var(--card))] border-l border-[hsl(var(--border))] shadow-xl
        flex flex-col transition-transform duration-200
        ${panelOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
          <span className="font-semibold text-sm">Patient</span>
          <button
            onClick={() => setPanelOpen(false)}
            className="p-1 rounded hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {selectedPatient ? (
          <div className="flex-1 overflow-y-auto">
            {/* Patient name header */}
            <div className="bg-[hsl(var(--primary))] px-4 py-3">
              <p className="font-bold text-white truncate">
                {selectedPatient.last_name}, {selectedPatient.first_name}
              </p>
              <p className="text-xs text-white/60">{selectedPatient.id}</p>
            </div>

            {/* Info grid */}
            <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-b border-[hsl(var(--border))]">
              <div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase">Age/Sex</p>
                <p className="font-medium truncate">{calcAge(selectedPatient.birthdate)} / {selectedPatient.gender || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase">Employer</p>
                <p className="font-medium truncate">{selectedPatient.employer || '—'}</p>
              </div>
              {selectedPatient.contact_number && (
                <div className="col-span-2">
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase">Contact</p>
                  <p className="font-medium truncate">{selectedPatient.contact_number}</p>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="px-4 py-3">
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase mb-2">Go to</p>
              <div className="grid grid-cols-5 gap-1">
                {quickActions.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setPanelOpen(false)}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[hsl(var(--accent)/0.5)] transition-colors cursor-pointer"
                  >
                    <Icon className="w-4 h-4 text-[hsl(var(--primary))]" />
                    <span className="text-[10px] font-medium">{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Edit profile link */}
            <div className="px-4 pb-4">
              <Link
                href="/"
                onClick={() => setPanelOpen(false)}
                className="block w-full text-center px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-xs font-medium hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center px-4">
            <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
              No patient selected
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
