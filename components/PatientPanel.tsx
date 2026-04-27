"use client"

import { X, User, Building2, Calendar, Phone, MapPin, FlaskConical, Stethoscope, RadioTower, ScanLine, Zap, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePatient } from '@/lib/patient-context'

function calcAge(birthdate?: string) {
  if (!birthdate) return '—'
  return Math.floor((Date.now() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
}

const quickActions = [
  { href: '/laboratory', label: 'Laboratory', icon: FlaskConical },
  { href: '/medical-exam', label: 'Medical Exam', icon: Stethoscope },
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
          className="fixed inset-0 z-40 bg-black/30 lg:bg-transparent lg:pointer-events-none"
          onClick={() => setPanelOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 right-0 h-full z-50 w-80 bg-[hsl(var(--card))] border-l border-[hsl(var(--border))] shadow-2xl
        flex flex-col transition-transform duration-300 ease-in-out
        ${panelOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
              <User className="w-4 h-4 text-[hsl(var(--primary))]" />
            </div>
            <span className="font-semibold text-sm text-[hsl(var(--foreground))]">Patient Info</span>
          </div>
          <button
            onClick={() => setPanelOpen(false)}
            className="p-1.5 rounded-md hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {selectedPatient ? (
          <div className="flex-1 overflow-y-auto">
            <div className="bg-[hsl(var(--primary))] px-5 py-4">
              <p className="text-lg font-bold text-white">
                {selectedPatient.last_name}, {selectedPatient.first_name} {selectedPatient.middle_name || ''}
              </p>
              <p className="text-sm text-white/70 mt-0.5">ID: {selectedPatient.id}</p>
            </div>

            <div className="px-5 py-4 space-y-3 border-b border-[hsl(var(--border))]">
              <div className="flex items-start gap-3 rounded-2xl px-3 py-2 transition-colors duration-200 hover:bg-[hsl(var(--muted)/0.4)]">
                <Building2 className="w-4 h-4 text-[hsl(var(--muted-foreground))] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Employer</p>
                  <p className="text-sm font-medium">{selectedPatient.employer || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl px-3 py-2 transition-colors duration-200 hover:bg-[hsl(var(--muted)/0.4)]">
                <Calendar className="w-4 h-4 text-[hsl(var(--muted-foreground))] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Age / Sex</p>
                  <p className="text-sm font-medium">
                    {calcAge(selectedPatient.birthdate)} yrs / {selectedPatient.gender || '—'}
                  </p>
                </div>
              </div>
              {selectedPatient.contact_number && (
                <div className="flex items-start gap-3 rounded-2xl px-3 py-2 transition-colors duration-200 hover:bg-[hsl(var(--muted)/0.4)]">
                  <Phone className="w-4 h-4 text-[hsl(var(--muted-foreground))] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Contact</p>
                    <p className="text-sm font-medium">{selectedPatient.contact_number}</p>
                  </div>
                </div>
              )}
              {selectedPatient.address && (
                <div className="flex items-start gap-3 rounded-2xl px-3 py-2 transition-colors duration-200 hover:bg-[hsl(var(--muted)/0.4)]">
                  <MapPin className="w-4 h-4 text-[hsl(var(--muted-foreground))] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Address</p>
                    <p className="text-sm font-medium">{selectedPatient.address}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-3">
                Quick Actions
              </p>
              <div className="space-y-1">
                {quickActions.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setPanelOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[hsl(var(--accent)/0.5)] transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-[hsl(var(--primary))]" />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="px-5 pb-5">
              <Link
                href="/"
                onClick={() => setPanelOpen(false)}
                className="block w-full text-center px-4 py-2.5 rounded-lg border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
              >
                View / Edit Full Profile
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center px-5">
            <p className="text-sm text-[hsl(var(--muted-foreground))] text-center">
              Search for a patient to see their details here
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
