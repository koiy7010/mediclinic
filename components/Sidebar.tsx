"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, FlaskConical, Stethoscope, RadioTower, Menu, Activity, ScanLine, Zap, X } from 'lucide-react'
import { useState } from 'react'
import GlobalSearch from '@/components/GlobalSearch'

const navItems = [
  { path: '/', label: 'Patient Profile', icon: Users },
  { path: '/laboratory', label: 'Laboratory', icon: FlaskConical },
  { path: '/medical-exam', label: 'Medical Exam', icon: Stethoscope },
  { path: '/utz', label: 'UTZ', icon: ScanLine },
  { path: '/xray', label: 'X-Ray', icon: RadioTower },
  { path: '/ecg', label: 'ECG', icon: Zap },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] flex flex-col
        transform transition-transform duration-200
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:flex
      `}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[hsl(var(--sidebar-border))]">
          <div className="w-9 h-9 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm text-[hsl(var(--sidebar-foreground))]">MediClinic</p>
            <p className="text-xs text-[hsl(var(--sidebar-foreground)/0.6)]">Health Records System</p>
          </div>
        </div>

        <div className="px-3 py-3 border-b border-[hsl(var(--sidebar-border))]">
          <GlobalSearch />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = pathname === path
            return (
              <Link
                key={path}
                href={path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
                  active
                    ? 'bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary)/0.8)]'
                    : 'text-[hsl(var(--sidebar-foreground)/0.8)] hover:bg-[hsl(var(--sidebar-accent)/0.85)] hover:text-[hsl(var(--sidebar-foreground))]'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="px-6 py-4 border-t border-[hsl(var(--sidebar-border))]">
          <p className="text-xs text-[hsl(var(--sidebar-foreground)/0.4)]">© 2026 MediClinic</p>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[hsl(var(--sidebar-background))] border-b border-[hsl(var(--sidebar-border))]">
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-md hover:bg-[hsl(var(--sidebar-accent))] cursor-pointer">
          <Menu className="w-5 h-5 text-[hsl(var(--sidebar-foreground))]" />
        </button>
        <div className="flex-1">
          <GlobalSearch />
        </div>
      </header>
    </>
  )
}
