"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SectionCard, FormField } from '@/components/ui/FormField'
import {
  ConciergeBell, Search, Plus, UserPlus, X, Clock, FlaskConical,
  Stethoscope, RadioTower, ScanLine, Zap, ArrowRight, Check,
  RotateCcw, Users, AlertCircle, Printer, ChevronDown
} from 'lucide-react'
import { format } from 'date-fns'
import { mockPatients } from '@/lib/mockData'
import { usePatient } from '@/lib/patient-context'
import { toast } from '@/lib/use-toast'
import { cn } from '@/lib/utils'
import { useConfirm } from '@/components/ui/ConfirmDialog'

/* ── Types ── */
interface QueueEntry {
  id: string
  patient_id: string
  patient_name: string
  employer: string
  department: string
  purpose: string
  status: 'waiting' | 'in-progress' | 'done'
  queue_number: number
  created_at: string
}

/* ── Constants ── */
const DEPARTMENTS = [
  { id: 'laboratory', label: 'Laboratory', icon: FlaskConical },
  { id: 'medical-exam', label: 'Medical Exam', icon: Stethoscope },
  { id: 'xray', label: 'X-Ray', icon: RadioTower },
  { id: 'utz', label: 'UTZ', icon: ScanLine },
  { id: 'ecg', label: 'ECG', icon: Zap },
]

const PURPOSES = [
  'Annual PE',
  'Pre-Employment',
  'Follow-up',
  'Walk-in',
  'Medical Clearance',
  'Fit to Work',
]

const NATIONALITIES = ['Filipino', 'American', 'Japanese', 'Korean', 'Chinese', 'British', 'Australian', 'Canadian', 'Other']
const GENDERS = ['Male', 'Female']

const emptyRegistration = {
  last_name: '',
  first_name: '',
  middle_name: '',
  contact_number: '',
  employer: '',
  birthdate: '',
  gender: '',
  address: '',
  nationality: 'Filipino',
}

function calcAge(birthdate: string) {
  if (!birthdate) return '—'
  return Math.floor((Date.now() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
}

/* ── Mock queue data ── */
const INITIAL_QUEUE: QueueEntry[] = [
  { id: 'q1', patient_id: 'p1', patient_name: 'Santos, Maria', employer: 'BDO Unibank', department: 'laboratory', purpose: 'Annual PE', status: 'in-progress', queue_number: 1, created_at: format(new Date(), 'yyyy-MM-dd') + 'T08:15:00' },
  { id: 'q2', patient_id: 'p2', patient_name: 'Reyes, Juan', employer: 'SM Investments', department: 'medical-exam', purpose: 'Pre-Employment', status: 'waiting', queue_number: 2, created_at: format(new Date(), 'yyyy-MM-dd') + 'T08:30:00' },
  { id: 'q3', patient_id: 'p3', patient_name: 'Garcia, Ana', employer: 'Jollibee Foods Corp.', department: 'xray', purpose: 'Annual PE', status: 'waiting', queue_number: 3, created_at: format(new Date(), 'yyyy-MM-dd') + 'T08:45:00' },
  { id: 'q4', patient_id: 'p4', patient_name: 'Mendoza, Carlos', employer: 'PLDT Inc.', department: 'laboratory', purpose: 'Follow-up', status: 'done', queue_number: 4, created_at: format(new Date(), 'yyyy-MM-dd') + 'T07:30:00' },
]

/* ── Department Badge ── */
function DeptBadge({ department }: { department: string }) {
  const dept = DEPARTMENTS.find(d => d.id === department)
  if (!dept) return null
  const Icon = dept.icon
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]">
      <Icon className="w-3 h-3 text-[hsl(var(--primary))]" />
      {dept.label}
    </span>
  )
}

/* ── Status Badge ── */
function QueueStatusBadge({ status }: { status: QueueEntry['status'] }) {
  const styles = {
    waiting: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]',
    'in-progress': 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.3)]',
    done: 'bg-[hsl(var(--success-muted))] text-[hsl(var(--success))] border-[hsl(var(--success)/0.3)]',
  }
  const labels = { waiting: 'Waiting', 'in-progress': 'In Progress', done: 'Done' }
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", styles[status])}>
      {status === 'in-progress' && <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--primary))] opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[hsl(var(--primary))]" /></span>}
      {labels[status]}
    </span>
  )
}

/* ── Main Component ── */
export default function InformationDesk() {
  const [activeView, setActiveView] = useState<'queue' | 'register'>('queue')
  const [showModal, setShowModal] = useState(false)
  const [showStats, setShowStats] = useState(true)
  const [queue, setQueue] = useState<QueueEntry[]>(INITIAL_QUEUE)
  const [searchQuery, setSearchQuery] = useState('')
  const [regForm, setRegForm] = useState(emptyRegistration)
  const [regError, setRegError] = useState('')
  const [selectedPurpose, setSelectedPurpose] = useState('')
  const [queueFilter, setQueueFilter] = useState<'all' | 'waiting' | 'in-progress' | 'done'>('all')
  const [patientSearchQuery, setPatientSearchQuery] = useState('')
  const [showPatientSearch, setShowPatientSearch] = useState(false)
  const [selectedExistingPatient, setSelectedExistingPatient] = useState<any>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { confirm, ConfirmDialog } = useConfirm()
  const { setSelectedPatient } = usePatient()

  // Auto-focus search when modal opens
  useEffect(() => {
    if (showModal) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [showModal])

  const { data: patients = [] } = useQuery<any[]>({
    queryKey: ['patients'],
    queryFn: async () => mockPatients,
  })

  // Queue counter
  const nextQueueNumber = queue.length > 0 ? Math.max(...queue.map(q => q.queue_number)) + 1 : 1

  // Filtered queue
  const filteredQueue = queue
    .filter(q => queueFilter === 'all' || q.status === queueFilter)
    .filter(q => {
      if (!searchQuery) return true
      const s = searchQuery.toLowerCase()
      return q.patient_name.toLowerCase().includes(s) || q.employer.toLowerCase().includes(s) || String(q.queue_number).includes(s)
    })
    .sort((a, b) => {
      const statusOrder = { waiting: 0, 'in-progress': 1, done: 2 }
      if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status]
      return a.queue_number - b.queue_number
    })

  // Patient search for existing patients
  const patientResults = patientSearchQuery.trim()
    ? (patients as any[]).filter((p: any) => {
        const q = patientSearchQuery.toLowerCase()
        return (p.last_name || '').toLowerCase().includes(q) || (p.first_name || '').toLowerCase().includes(q) || (p.employer || '').toLowerCase().includes(q) || (p.id || '').toLowerCase().includes(q)
      }).slice(0, 8)
    : []

  // Duplicate detection
  const checkDuplicate = useCallback((lastName: string, firstName: string, birthdate: string) => {
    if (!lastName || !firstName) return null
    const match = (patients as any[]).find((p: any) =>
      p.last_name.toLowerCase() === lastName.toLowerCase() &&
      p.first_name.toLowerCase() === firstName.toLowerCase() &&
      (!birthdate || p.birthdate === birthdate)
    )
    return match || null
  }, [patients])

  const duplicateWarning = checkDuplicate(regForm.last_name, regForm.first_name, regForm.birthdate)

  const setReg = (k: string, v: string) => setRegForm(f => ({ ...f, [k]: v }))

  // Queue actions
  function updateStatus(id: string, newStatus: QueueEntry['status']) {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, status: newStatus } : q))
    toast({ title: `Status updated to ${newStatus === 'in-progress' ? 'In Progress' : newStatus === 'done' ? 'Done' : 'Waiting'}`, variant: 'success' })
  }

  function addToQueue(patientId: string, patientName: string, employer: string) {
    if (!selectedPurpose) {
      toast({ title: 'Please select a purpose of visit', variant: 'default' })
      return
    }
    const entry: QueueEntry = {
      id: `q${Date.now()}`,
      patient_id: patientId,
      patient_name: patientName,
      employer: employer || '—',
      department: '',
      purpose: selectedPurpose,
      status: 'waiting',
      queue_number: nextQueueNumber,
      created_at: new Date().toISOString(),
    }
    setQueue(prev => [...prev, entry])
    setSelectedPurpose('')
    setSelectedExistingPatient(null)
    setShowModal(false)
    setPatientSearchQuery('')
    setRegForm(emptyRegistration)
    setRegError('')
    toast({ title: `Queue #${entry.queue_number} — ${patientName} added`, variant: 'success' })
  }

  function handleRegisterAndQueue() {
    if (!regForm.last_name || !regForm.first_name) {
      setRegError('Last Name and First Name are required.')
      return
    }
    if (!selectedPurpose) {
      setRegError('Please select a purpose of visit.')
      return
    }
    setRegError('')
    const newId = `p${Date.now()}`
    const patientName = `${regForm.last_name}, ${regForm.first_name}`
    addToQueue(newId, patientName, regForm.employer)
    setRegForm(emptyRegistration)
    toast({ title: `Patient registered: ${patientName}`, variant: 'success' })
  }

  async function handleClearDone() {
    const doneCount = queue.filter(q => q.status === 'done').length
    if (doneCount === 0) {
      toast({ title: 'No completed entries to clear', variant: 'default' })
      return
    }
    const confirmed = await confirm({
      title: 'Clear Completed',
      message: `Remove ${doneCount} completed queue ${doneCount === 1 ? 'entry' : 'entries'}?`,
      confirmLabel: 'Clear',
      cancelLabel: 'Cancel',
      variant: 'warning',
    })
    if (confirmed) {
      setQueue(prev => prev.filter(q => q.status !== 'done'))
      toast({ title: `${doneCount} completed entries cleared`, variant: 'success' })
    }
  }

  const todayStats = {
    total: queue.length,
    waiting: queue.filter(q => q.status === 'waiting').length,
    inProgress: queue.filter(q => q.status === 'in-progress').length,
    done: queue.filter(q => q.status === 'done').length,
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="max-w-6xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Page header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
              <ConciergeBell className="w-5 h-5 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">Information Desk</h1>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{format(new Date(), 'EEEE, MMMM dd, yyyy')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Add to Queue
            </Button>
          </div>
        </div>

        {/* Stats bar — collapsible */}
        <div>
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors cursor-pointer mb-2"
          >
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", !showStats && "-rotate-90")} />
            Today&apos;s Summary
            {!showStats && (
              <span className="text-[hsl(var(--primary))] font-semibold">
                {todayStats.total} total · {todayStats.waiting} waiting
              </span>
            )}
          </button>
          {showStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Today', value: todayStats.total, icon: Users },
                { label: 'Waiting', value: todayStats.waiting, icon: Clock },
                { label: 'In Progress', value: todayStats.inProgress, icon: ArrowRight },
                { label: 'Done', value: todayStats.done, icon: Check },
              ].map(stat => (
                <div key={stat.label} className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[hsl(var(--primary)/0.08)]">
                    <stat.icon className="w-4 h-4 text-[hsl(var(--primary))]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{stat.value}</p>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wide font-medium">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═══ QUEUE ═══ */}
        <div className="space-y-4">
            {/* Queue toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                  <Input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search queue…"
                    className="pl-9 h-8 text-sm w-64"
                  />
                </div>
                <div className="flex items-center rounded-lg border border-[hsl(var(--border))] overflow-hidden">
                  {(['all', 'waiting', 'in-progress', 'done'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setQueueFilter(f)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                        queueFilter === f
                          ? 'bg-[hsl(var(--primary))] text-white'
                          : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
                      )}
                    >
                      {f === 'all' ? 'All' : f === 'in-progress' ? 'Active' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleClearDone}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Clear Done
                </Button>
                <Button size="sm" onClick={() => setShowModal(true)}>
                  <Plus className="w-4 h-4 mr-1.5" /> Add to Queue
                </Button>
              </div>
            </div>

            {/* Queue table */}
            <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
                    <th className="px-4 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide w-16">#</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Patient</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide hidden sm:table-cell">Employer</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Purpose</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Status</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide w-28">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQueue.map(q => (
                    <tr key={q.id} className={cn(
                      "border-b border-[hsl(var(--border))] last:border-b-0 transition-colors",
                      q.status === 'done' ? 'opacity-50' : 'hover:bg-[hsl(var(--accent)/0.3)]'
                    )}>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-sm font-bold">
                          {q.queue_number}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="text-sm font-medium">{q.patient_name}</p>
                        <p className="text-[10px] text-[hsl(var(--muted-foreground))] sm:hidden">{q.employer}</p>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-[hsl(var(--muted-foreground))] hidden sm:table-cell">{q.employer}</td>
                      <td className="px-4 py-2.5 text-sm text-[hsl(var(--muted-foreground))]">{q.purpose}</td>
                      <td className="px-4 py-2.5"><QueueStatusBadge status={q.status} /></td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          {q.status === 'waiting' && (
                            <Button variant="ghost" size="sm" onClick={() => updateStatus(q.id, 'in-progress')} className="h-7 text-xs text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.1)]">
                              Start
                            </Button>
                          )}
                          {q.status === 'in-progress' && (
                            <Button variant="ghost" size="sm" onClick={() => updateStatus(q.id, 'done')} className="h-7 text-xs text-[hsl(var(--success))] hover:bg-[hsl(var(--success-muted))]">
                              Done
                            </Button>
                          )}
                          {q.status === 'done' && (
                            <Button variant="ghost" size="sm" onClick={() => updateStatus(q.id, 'waiting')} className="h-7 text-xs text-[hsl(var(--muted-foreground))]">
                              Reset
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredQueue.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-sm text-[hsl(var(--muted-foreground))]">
                        {searchQuery ? 'No matching queue entries' : 'Queue is empty — add patients to get started'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      {/* ═══ ADD TO QUEUE MODAL ═══ */}
      {showModal && (
          <>
            <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setShowModal(false)} />
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] px-4 pointer-events-none">
              <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-2xl w-full max-w-2xl max-h-[80vh] pointer-events-auto animate-in fade-in zoom-in-95 flex flex-col">
                {/* Modal header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] rounded-t-xl shrink-0">
                  <div>
                    <h2 className="text-base font-bold text-[hsl(var(--foreground))]">Add to Queue</h2>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Queue #{nextQueueNumber}</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] transition-colors cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-5 overflow-y-auto flex-1 min-h-0">
                  {/* Existing patient search */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Find Existing Patient</p>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      <Input
                        ref={searchInputRef}
                        value={patientSearchQuery}
                        onChange={e => { setPatientSearchQuery(e.target.value); setShowPatientSearch(true) }}
                        onFocus={() => setShowPatientSearch(true)}
                        placeholder="Search by name, employer, or ID…"
                        className="pl-9 h-9 text-sm"
                      />
                      {patientSearchQuery && (
                        <button onClick={() => { setPatientSearchQuery(''); setShowPatientSearch(false); setSelectedExistingPatient(null) }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-[hsl(var(--muted))] cursor-pointer">
                          <X className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                        </button>
                      )}
                    </div>

                    {showPatientSearch && patientResults.length > 0 && (
                      <div className="border border-[hsl(var(--border))] rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                        {patientResults.map((p: any) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelectedExistingPatient(p)
                              setPatientSearchQuery(`${p.last_name}, ${p.first_name}`)
                              setShowPatientSearch(false)
                            }}
                            className="w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-[hsl(var(--accent)/0.5)] transition-colors cursor-pointer border-b border-[hsl(var(--border))] last:border-b-0"
                          >
                            <div>
                              <p className="text-sm font-medium">{p.last_name}, {p.first_name}</p>
                              <p className="text-xs text-[hsl(var(--muted-foreground))]">{p.employer || '—'} · {calcAge(p.birthdate)} yrs · {p.gender || '—'}</p>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">{p.id}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedExistingPatient && (
                      <div className="bg-[hsl(var(--accent)/0.3)] border border-[hsl(var(--accent))] rounded-lg px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold">{selectedExistingPatient.last_name}, {selectedExistingPatient.first_name}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">
                              {selectedExistingPatient.employer || '—'} · {calcAge(selectedExistingPatient.birthdate)} yrs · {selectedExistingPatient.gender || '—'}
                            </p>
                          </div>
                          <button onClick={() => { setSelectedExistingPatient(null); setPatientSearchQuery('') }} className="p-1 rounded hover:bg-[hsl(var(--muted))] cursor-pointer">
                            <X className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  {!selectedExistingPatient && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-[hsl(var(--border))]" />
                      <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium">or register new</span>
                      <div className="flex-1 h-px bg-[hsl(var(--border))]" />
                    </div>
                  )}

                  {/* New patient form — only show if no existing patient selected */}
                  {!selectedExistingPatient && (
                    <div className="space-y-3">
                      {regError && (
                        <div className="bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--destructive))] px-3 py-2 rounded-lg text-sm font-medium">
                          {regError}
                        </div>
                      )}
                      {duplicateWarning && (
                        <div className="bg-[hsl(var(--accent)/0.4)] border border-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] px-3 py-2 rounded-lg text-sm flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <p className="text-xs">Patient <strong>{duplicateWarning.last_name}, {duplicateWarning.first_name}</strong> (ID: {duplicateWarning.id}) already exists.</p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Last Name" required>
                          <Input value={regForm.last_name} onChange={e => setReg('last_name', e.target.value)} placeholder="Last name" autoFocus
                            className={cn("h-8 text-sm", !regForm.last_name && regError ? 'border-[hsl(var(--destructive))]' : '')} />
                        </FormField>
                        <FormField label="First Name" required>
                          <Input value={regForm.first_name} onChange={e => setReg('first_name', e.target.value)} placeholder="First name"
                            className={cn("h-8 text-sm", !regForm.first_name && regError ? 'border-[hsl(var(--destructive))]' : '')} />
                        </FormField>
                        <FormField label="Employer">
                          <Input value={regForm.employer} onChange={e => setReg('employer', e.target.value)} placeholder="Company" className="h-8 text-sm" />
                        </FormField>
                        <FormField label="Gender">
                          <Select value={regForm.gender} onValueChange={v => setReg('gender', v)}>
                            <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
                            <SelectContent>
                              {GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormField>
                      </div>
                    </div>
                  )}

                  {/* Purpose of visit — quick tap buttons */}
                  <div className="border-t border-[hsl(var(--border))] pt-4 space-y-2">
                    <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Purpose of Visit</p>
                    <div className="flex flex-wrap gap-2">
                      {PURPOSES.map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setSelectedPurpose(p)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all cursor-pointer",
                            selectedPurpose === p
                              ? "bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]"
                              : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/0.5)] hover:text-[hsl(var(--foreground))]"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Modal footer */}
                <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] rounded-b-xl shrink-0">
                    <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
                    {selectedExistingPatient ? (
                      <Button onClick={() => addToQueue(
                        selectedExistingPatient.id,
                        `${selectedExistingPatient.last_name}, ${selectedExistingPatient.first_name}`,
                        selectedExistingPatient.employer
                      )}>
                        <Plus className="w-4 h-4 mr-1.5" /> Add to Queue
                      </Button>
                    ) : (
                      <Button onClick={handleRegisterAndQueue}>
                        <UserPlus className="w-4 h-4 mr-1.5" /> Register & Queue
                      </Button>
                    )}
                </div>
              </div>
            </div>
          </>
        )}

        {ConfirmDialog}
    </div>
  )
}
