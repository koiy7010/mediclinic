"use client"

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormField } from '@/components/ui/FormField'
import {
  ClipboardCheck, Search, X, Check, Clock, Package,
  Printer, User, Building2, FileText, ChevronDown, Mail, Globe, Send
} from 'lucide-react'
import { format } from 'date-fns'
import { mockPatients, mockLabData, mockRadiologyReports, mockMedicalExams } from '@/lib/mockData'
import { toast } from '@/lib/use-toast'
import { cn } from '@/lib/utils'
import { useConfirm } from '@/components/ui/ConfirmDialog'

/* ── Types ── */
interface ReportStatus {
  id: string
  label: string
  done: boolean
}

interface ReleaseEntry {
  patient_id: string
  patient_name: string
  employer: string
  email?: string
  reports: ReportStatus[]
  status: 'ready' | 'released' | 'pending'
  release_method?: 'pickup' | 'email' | 'portal'
  released_at?: string
  received_by?: string
  receiver_type?: 'patient' | 'representative' | 'company'
  claim_no?: string
}

/* ── Constants ── */
const REPORT_TYPES = ['Laboratory', 'X-Ray', 'ECG', 'UTZ', 'Medical Exam']
const RECEIVER_TYPES = [
  { value: 'patient', label: 'Patient (Self)' },
  { value: 'representative', label: 'Representative' },
  { value: 'company', label: 'Company / HR' },
]

/* ── Build release entries from mock data ── */
function buildReleaseEntries(): ReleaseEntry[] {
  const mockEmails: Record<string, string> = {
    p1: 'maria.santos@email.com',
    p2: 'juan.reyes@email.com',
    p3: 'ana.garcia@email.com',
    p4: 'carlos.mendoza@email.com',
    p5: '',
  }
  return mockPatients.map(p => {
    const reports: ReportStatus[] = []
    const labData = mockLabData[p.id]
    if (labData && Object.keys(labData).length > 0) {
      reports.push({ id: 'lab', label: 'Laboratory', done: true })
    }
    const xrayData = mockRadiologyReports[p.id]
    if (xrayData && xrayData.length > 0) {
      reports.push({ id: 'xray', label: 'X-Ray', done: true })
    }
    const examData = mockMedicalExams[p.id]
    if (examData) {
      reports.push({ id: 'exam', label: 'Medical Exam', done: true })
    }
    // Simulate some pending reports
    if (p.id === 'p5') {
      reports.push({ id: 'lab', label: 'Laboratory', done: false })
      reports.push({ id: 'xray', label: 'X-Ray', done: false })
    }
    if (p.id === 'p2') {
      reports.push({ id: 'ecg', label: 'ECG', done: false })
    }

    const allDone = reports.length > 0 && reports.every(r => r.done)
    const status: ReleaseEntry['status'] = allDone ? 'ready' : 'pending'

    return {
      patient_id: p.id,
      patient_name: `${p.last_name}, ${p.first_name}`,
      employer: p.employer || '—',
      email: mockEmails[p.id] || '',
      reports,
      status,
    }
  }).filter(e => e.reports.length > 0)
}

function generateClaimNo() {
  const date = format(new Date(), 'yyyyMMdd')
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')
  return `CL-${date}-${seq}`
}

/* ── Report Badges ── */
function ReportBadge({ report }: { report: ReportStatus }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border",
      report.done
        ? "bg-[hsl(var(--success-muted))] text-[hsl(var(--success))] border-[hsl(var(--success)/0.3)]"
        : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]"
    )}>
      {report.done ? <Check className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
      {report.label}
    </span>
  )
}

/* ── Release Modal ── */
function ReleaseModal({
  entry,
  onRelease,
  onClose,
}: {
  entry: ReleaseEntry
  onRelease: (method: string, receiverType: string, receiverName: string, email: string) => void
  onClose: () => void
}) {
  const [method, setMethod] = useState<'pickup' | 'email' | 'portal'>('pickup')
  const [receiverType, setReceiverType] = useState('patient')
  const [receiverName, setReceiverName] = useState('')
  const [email, setEmail] = useState(entry.email || '')

  const handleRelease = () => {
    if (method === 'pickup' && receiverType !== 'patient' && !receiverName.trim()) {
      toast({ title: "Please enter the receiver's name", variant: 'default' })
      return
    }
    if (method === 'email' && !email.trim()) {
      toast({ title: 'Please enter an email address', variant: 'default' })
      return
    }
    const name = method === 'pickup'
      ? (receiverType === 'patient' ? entry.patient_name : receiverName || entry.employer)
      : method === 'email'
        ? email
        : 'Patient Portal'
    onRelease(method, receiverType, name, email)
  }

  const doneReports = entry.reports.filter(r => r.done)

  const METHODS = [
    { value: 'pickup' as const, label: 'Pick-up', icon: Package, desc: 'Hand over at the desk' },
    { value: 'email' as const, label: 'Email', icon: Mail, desc: 'Send as PDF to email' },
    { value: 'portal' as const, label: 'Portal', icon: Globe, desc: 'Publish to patient portal' },
  ]

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] px-4 pointer-events-none">
        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-2xl w-full max-w-md max-h-[80vh] pointer-events-auto animate-in fade-in zoom-in-95 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))] shrink-0">
            <div>
              <h2 className="text-base font-bold text-[hsl(var(--foreground))]">Release Results</h2>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{entry.patient_name}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
            {/* Reports being released */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Reports to Release</p>
              <div className="flex flex-wrap gap-1.5">
                {doneReports.map(r => <ReportBadge key={r.id} report={r} />)}
              </div>
            </div>

            {/* Release method */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Release Method</p>
              <div className="grid grid-cols-3 gap-2">
                {METHODS.map(m => {
                  const Icon = m.icon
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMethod(m.value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg border text-center transition-all cursor-pointer",
                        method === m.value
                          ? "bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]"
                          : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/0.5)] hover:text-[hsl(var(--foreground))]"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{m.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Pick-up fields */}
            {method === 'pickup' && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Received By</p>
                <div className="flex flex-wrap gap-2">
                  {RECEIVER_TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => { setReceiverType(t.value); if (t.value === 'patient') setReceiverName('') }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all cursor-pointer",
                        receiverType === t.value
                          ? "bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]"
                          : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/0.5)]"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                {(receiverType === 'representative' || receiverType === 'company') && (
                  <Input
                    value={receiverName}
                    onChange={e => setReceiverName(e.target.value)}
                    placeholder={receiverType === 'representative' ? "Representative's full name" : 'HR / Company representative name'}
                    className="h-8 text-sm"
                    autoFocus
                  />
                )}
              </div>
            )}

            {/* Email fields */}
            {method === 'email' && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Send To</p>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="patient@email.com"
                  className="h-8 text-sm"
                  autoFocus
                />
                {email && (
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    Results will be sent as PDF attachment to this email.
                  </p>
                )}
              </div>
            )}

            {/* Portal info */}
            {method === 'portal' && (
              <div className="bg-[hsl(var(--accent)/0.3)] border border-[hsl(var(--accent))] rounded-lg px-4 py-3">
                <p className="text-sm text-[hsl(var(--accent-foreground))]">
                  Results will be published to the patient portal. The patient can view and download them online.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] rounded-b-xl shrink-0">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button onClick={handleRelease}>
              {method === 'pickup' && <><Package className="w-4 h-4 mr-1.5" /> Release</>}
              {method === 'email' && <><Send className="w-4 h-4 mr-1.5" /> Send Email</>}
              {method === 'portal' && <><Globe className="w-4 h-4 mr-1.5" /> Publish</>}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Main Component ── */
export default function ReleasingPage() {
  const [entries, setEntries] = useState<ReleaseEntry[]>(() => buildReleaseEntries())
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'ready' | 'released' | 'pending'>('ready')
  const [releaseTarget, setReleaseTarget] = useState<ReleaseEntry | null>(null)
  const { confirm, ConfirmDialog } = useConfirm()

  // Filter entries
  const filtered = entries
    .filter(e => e.status === activeTab)
    .filter(e => {
      if (!searchQuery) return true
      const s = searchQuery.toLowerCase()
      return e.patient_name.toLowerCase().includes(s) || e.employer.toLowerCase().includes(s) || e.patient_id.toLowerCase().includes(s) || (e.claim_no || '').toLowerCase().includes(s)
    })

  // Stats
  const stats = {
    ready: entries.filter(e => e.status === 'ready').length,
    released: entries.filter(e => e.status === 'released').length,
    pending: entries.filter(e => e.status === 'pending').length,
  }

  function handleRelease(entryId: string, method: string, receiverType: string, receiverName: string) {
    const claimNo = generateClaimNo()
    setEntries(prev => prev.map(e =>
      e.patient_id === entryId
        ? {
            ...e,
            status: 'released' as const,
            release_method: method as ReleaseEntry['release_method'],
            released_at: new Date().toISOString(),
            received_by: receiverName,
            receiver_type: receiverType as any,
            claim_no: claimNo,
          }
        : e
    ))
    setReleaseTarget(null)
    const methodLabel = method === 'email' ? 'Sent via email' : method === 'portal' ? 'Published to portal' : 'Released'
    toast({ title: `${methodLabel} — Claim #${claimNo}`, variant: 'success' })
  }

  function handlePrint(entry: ReleaseEntry) {
    // In production this would generate a PDF receipt
    toast({ title: `Printing release slip for ${entry.patient_name}`, variant: 'success' })
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="max-w-6xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Page header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-[hsl(var(--primary))]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">Releasing</h1>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{format(new Date(), 'EEEE, MMMM dd, yyyy')}</p>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center rounded-lg border border-[hsl(var(--border))] overflow-hidden">
            {([
              { key: 'ready' as const, label: 'Ready', count: stats.ready },
              { key: 'released' as const, label: 'Released', count: stats.released },
              { key: 'pending' as const, label: 'Pending', count: stats.pending },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5",
                  activeTab === tab.key
                    ? 'bg-[hsl(var(--primary))] text-white'
                    : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
                )}
              >
                {tab.label}
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                  activeTab === tab.key ? 'bg-white/20' : 'bg-[hsl(var(--muted))]'
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search patient, employer, claim #…"
              className="pl-9 h-8 text-sm w-72"
            />
          </div>
        </div>

        {/* ═══ READY TAB ═══ */}
        {activeTab === 'ready' && (
          <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
                  <th className="px-4 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Patient</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide hidden sm:table-cell">Employer</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Reports</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide w-28">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.patient_id} className="border-b border-[hsl(var(--border))] last:border-b-0 hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{e.patient_name}</p>
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))] sm:hidden">{e.employer}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-[hsl(var(--muted-foreground))] hidden sm:table-cell">{e.employer}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">{e.reports.filter(r => r.done).map(r => <ReportBadge key={r.id} report={r} />)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" onClick={() => setReleaseTarget(e)} className="h-7">
                        <Package className="w-3.5 h-3.5 mr-1" /> Release
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-12 text-sm text-[hsl(var(--muted-foreground))]">
                    {searchQuery ? 'No matching patients' : 'No results ready for release'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ═══ RELEASED TAB ═══ */}
        {activeTab === 'released' && (
          <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
                  <th className="px-4 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Patient</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide hidden sm:table-cell">Claim #</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Received By</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide hidden md:table-cell">Time</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide w-20">Print</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.patient_id} className="border-b border-[hsl(var(--border))] last:border-b-0 hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{e.patient_name}</p>
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{e.employer}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs font-mono bg-[hsl(var(--muted))] px-2 py-0.5 rounded">{e.claim_no}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm">{e.received_by}</p>
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))] capitalize">
                        {e.release_method === 'email' ? '📧 Email' : e.release_method === 'portal' ? '🌐 Portal' : e.receiver_type === 'patient' ? 'Pick-up · Self' : `Pick-up · ${e.receiver_type}`}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-[hsl(var(--muted-foreground))] hidden md:table-cell">
                      {e.released_at ? format(new Date(e.released_at), 'hh:mm a') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => handlePrint(e)} className="h-7 text-xs">
                        <Printer className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-sm text-[hsl(var(--muted-foreground))]">
                    {searchQuery ? 'No matching records' : 'No results released yet today'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ═══ PENDING TAB ═══ */}
        {activeTab === 'pending' && (
          <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
                  <th className="px-4 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Patient</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide hidden sm:table-cell">Employer</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Done</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Pending</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => {
                  const done = e.reports.filter(r => r.done)
                  const pending = e.reports.filter(r => !r.done)
                  return (
                    <tr key={e.patient_id} className="border-b border-[hsl(var(--border))] last:border-b-0 hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">{e.patient_name}</p>
                        <p className="text-[10px] text-[hsl(var(--muted-foreground))] sm:hidden">{e.employer}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-[hsl(var(--muted-foreground))] hidden sm:table-cell">{e.employer}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {done.length > 0 ? done.map(r => <ReportBadge key={r.id} report={r} />) : <span className="text-xs text-[hsl(var(--muted-foreground))]">None yet</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {pending.map(r => <ReportBadge key={r.id} report={r} />)}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-12 text-sm text-[hsl(var(--muted-foreground))]">
                    {searchQuery ? 'No matching patients' : 'No pending results'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Release modal */}
      {releaseTarget && (
        <ReleaseModal
          entry={releaseTarget}
          onRelease={(method, type, name, email) => handleRelease(releaseTarget.patient_id, method, type, name)}
          onClose={() => setReleaseTarget(null)}
        />
      )}

      {ConfirmDialog}
    </div>
  )
}
