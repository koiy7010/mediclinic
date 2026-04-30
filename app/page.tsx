"use client"

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, User, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { mockPatients, mockLabReports } from '@/lib/mockData'
import { usePatient } from '@/lib/patient-context'
import StickyPatientHeader from '@/components/StickyPatientHeader'
import { toast } from '@/lib/use-toast'
import { useCtrlS } from '@/lib/use-ctrl-s'
import { FloatingActionBar } from '@/components/ui/FloatingActionBar'
import { AutoSaveIndicator } from '@/components/ui/AutoSaveIndicator'
import { useGlobalShortcuts } from '@/components/ui/KeyboardShortcuts'
import { SectionProgress } from '@/components/ui/ProgressIndicator'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useRecentPatients } from '@/components/ui/RecentPatients'
import { useSearch } from '@/lib/search-context'
import PatientTimeline, { type TimelineEvent } from '@/components/ui/PatientTimeline'
import { mockLabData, mockRadiologyReports, mockMedicalExams } from '@/lib/mockData'
import { useConfirm } from '@/components/ui/ConfirmDialog'

const NATIONALITIES = ['Filipino', 'American', 'Japanese', 'Korean', 'Chinese', 'British', 'Australian', 'Canadian', 'Other']
const MARITAL = ['Single', 'Married', 'Separated', 'Divorced', 'Widowed', 'Widower']

const emptyForm = {
  registration_date: format(new Date(), 'yyyy-MM-dd'),
  last_name: '', first_name: '', middle_name: '',
  address: '', contact_number: '', employer: '',
  birthdate: '', marital_status: '', gender: '', nationality: ''
}

function calcAge(birthdate: string) {
  if (!birthdate) return ''
  const diff = Date.now() - new Date(birthdate).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('63') && digits.length > 2) {
    const rest = digits.slice(2)
    if (rest.length <= 3) return `+63 ${rest}`
    if (rest.length <= 6) return `+63 ${rest.slice(0, 3)} ${rest.slice(3)}`
    return `+63 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6, 10)}`
  }
  if (digits.startsWith('0') && digits.length > 1) {
    if (digits.length <= 4) return digits
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`
  }
  return value
}

/* ── Reusable table primitives ── */
function TRow({ label, children, required, errorHighlight }: { label: string; children: React.ReactNode; required?: boolean; errorHighlight?: boolean }) {
  return (
    <tr className="border-b border-[hsl(var(--border))] last:border-b-0 hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
      <td className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] w-[35%] whitespace-nowrap align-middle">
        {label}{required && <span className="text-[hsl(var(--destructive))] ml-0.5">*</span>}
      </td>
      <td className="px-4 py-2.5 text-sm text-[hsl(var(--foreground))] align-middle">{children}</td>
    </tr>
  )
}

function GroupHeader({ children }: { children: React.ReactNode }) {
  return (
    <tr className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
      <td colSpan={2} className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{children}</td>
    </tr>
  )
}

function SectionTable({ title, id, actions, children }: { title: string; id?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div id={id} className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
        <h3 className="text-sm font-semibold text-[hsl(var(--primary))]">{title}</h3>
        {actions}
      </div>
      <table className="w-full text-left">
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export default function PatientProfile() {
  const [form, setForm] = useState<any>(emptyForm)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const qc = useQueryClient()
  const { selectedPatient, setSelectedPatient } = usePatient()
  const { addRecentPatient } = useRecentPatients()
  const { setOpen: setSearchOpen } = useSearch()
  const { confirm, ConfirmDialog } = useConfirm()

  useEffect(() => {
    if (selectedPatient) {
      setForm({ ...emptyForm, ...selectedPatient })
      setSelectedId(selectedPatient.id)
      setError('')
      setIsDirty(false)
    }
  }, [selectedPatient])

  useEffect(() => {
    if (selectedPatient) addRecentPatient(selectedPatient)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatient?.id])

  const { data: labHistory = [] } = useQuery<any[]>({
    queryKey: ['lab-history', selectedId],
    queryFn: async () => mockLabReports[selectedId!] ?? [],
    enabled: !!selectedId,
  })

  const saveMutation = useMutation({
    mutationFn: async (data: any) => data,
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ['patients'] })
      if (!selectedId) setSelectedId(res.id)
      setError('')
      setIsDirty(false)
      toast({ title: 'Patient profile saved', variant: 'success' })
    },
  })

  function handleNew() {
    if (isDirty) {
      confirm({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to create a new patient? Your changes will be lost.',
        confirmLabel: 'Discard Changes',
        cancelLabel: 'Keep Editing',
        variant: 'warning',
      }).then((confirmed) => {
        if (confirmed) {
          setSelectedId(null)
          setForm(emptyForm)
          setSelectedPatient(null)
          setError('')
          setIsDirty(false)
        }
      })
    } else {
      setSelectedId(null)
      setForm(emptyForm)
      setSelectedPatient(null)
      setError('')
      setIsDirty(false)
    }
  }

  const handleSave = useCallback(() => {
    if (!form.last_name || !form.first_name) {
      setError('Last Name and First Name are required.')
      return
    }
    saveMutation.mutate(form)
  }, [form, saveMutation])

  const set = (k: string, v: any) => {
    setForm((f: any) => ({ ...f, [k]: v }))
    setIsDirty(true)
  }

  const handlePhoneChange = (value: string) => set('contact_number', formatPhoneNumber(value))

  useCtrlS(handleSave)
  useGlobalShortcuts({ onSave: handleSave, onNew: handleNew, onSearch: () => setSearchOpen(true) })

  const handleAutoSave = useCallback(async () => {
    if (isDirty && form.last_name && form.first_name) await saveMutation.mutateAsync(form)
  }, [isDirty, form, saveMutation])

  const lastVisit = (labHistory as any[]).length > 0
    ? [...(labHistory as any[])].sort((a, b) => new Date(b.result_date).getTime() - new Date(a.result_date).getTime())[0]
    : null
  const lastVisitInfo = lastVisit ? {
    date: lastVisit.result_date ? format(new Date(lastVisit.result_date), 'MMM dd, yyyy') : '—',
    test: lastVisit.report_type || '—',
    normal: lastVisit.is_normal,
  } : null

  const sections = [
    { id: 'personal', label: 'Personal Info', completed: !!(form.last_name && form.first_name), hasError: !!(error && (!form.last_name || !form.first_name)) },
    { id: 'contact', label: 'Contact', completed: !!(form.address || form.contact_number), hasError: false },
    { id: 'demographics', label: 'Demographics', completed: !!(form.birthdate && form.gender), hasError: false },
  ]

  const getPatientStatus = () => {
    if (!selectedId) return 'incomplete'
    if (lastVisitInfo?.normal === false) return 'abnormal'
    if (labHistory.length === 0) return 'pending'
    return 'complete'
  }

  const buildTimelineEvents = (): TimelineEvent[] => {
    if (!selectedId) return []
    const events: TimelineEvent[] = []
    const patientLabData = mockLabData[selectedId] || {}
    Object.entries(patientLabData).forEach(([testType, data]: [string, any]) => {
      if (data.result_date) {
        events.push({
          id: `lab_${testType}_${data.result_date}`, type: 'lab', subtype: testType,
          date: data.result_date, title: `Laboratory - ${testType}`,
          summary: data.remark || (data.is_normal ? 'Results within normal range' : 'Abnormal findings'),
          isNormal: data.is_normal, data,
        })
      }
    })
    const radiologyReports = mockRadiologyReports[selectedId] || []
    radiologyReports.forEach((report: any) => {
      events.push({
        id: report.id, type: 'xray', subtype: report.examination_type,
        date: report.result_date, title: report.report_title,
        summary: report.impression, isNormal: report.is_normal, data: report,
      })
    })
    const medicalExam = mockMedicalExams[selectedId]
    if (medicalExam) {
      events.push({
        id: `exam_${medicalExam.result_date}`, type: 'medical-exam',
        date: medicalExam.result_date, title: 'Medical Examination',
        summary: medicalExam.remarks || `Evaluation: ${medicalExam.evaluation}`,
        isNormal: medicalExam.evaluation === 'A', data: medicalExam,
      })
    }
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const timelineEvents = buildTimelineEvents()

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pb-24">
      {selectedPatient && <StickyPatientHeader patient={selectedPatient} extra={lastVisitInfo} />}
      <div className="overflow-auto">
        <div className="max-w-5xl mx-auto w-full px-4 py-6 space-y-4">
          {/* Page header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                <User className="w-5 h-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">Patient Profile</h1>
                  {isDirty && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                      Unsaved
                    </span>
                  )}
                  {selectedId && <StatusBadge status={getPatientStatus()} size="sm" />}
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{selectedId ? `ID: ${selectedId}` : 'New Record'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AutoSaveIndicator isDirty={isDirty} onAutoSave={handleAutoSave} />
              <Button variant="outline" size="sm" onClick={handleNew} title="New Patient (Alt+N)">
                <Plus className="w-4 h-4 mr-1" /> New
                <kbd className="ml-2 text-[10px] px-1 py-0.5 rounded bg-[hsl(var(--muted))] font-mono hidden sm:inline">Alt+N</kbd>
              </Button>
            </div>
          </div>

          {!selectedId && (
            <div className="bg-[hsl(var(--accent)/0.4)] border border-[hsl(var(--accent))] rounded-lg px-4 py-3 text-sm text-[hsl(var(--accent-foreground))]">
              Use the search bar on the left to find an existing patient, or fill in the form below to create a new one.
              <button onClick={() => setSearchOpen(true)} className="ml-2 text-[hsl(var(--primary))] font-medium hover:underline cursor-pointer">
                Open Search (Ctrl+K)
              </button>
            </div>
          )}

          {error && (
            <div className="bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--destructive))] px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <SectionProgress sections={sections} />

          {/* Registration Date */}
          <SectionTable title="Registration">
            <TRow label="Registration Date">
              <span className="font-semibold text-[hsl(var(--primary))]">
                {form.registration_date ? format(new Date(form.registration_date), 'MMMM dd, yyyy') : '—'}
              </span>
            </TRow>
          </SectionTable>

          {/* Personal Information */}
          <SectionTable title="Personal Information" id="personal">
            <TRow label="Last Name" required>
              <Input value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Last name"
                className={`max-w-[300px] h-8 text-sm ${!form.last_name && error ? 'border-[hsl(var(--destructive))]' : ''}`} />
            </TRow>
            <TRow label="First Name" required>
              <Input value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="First name"
                className={`max-w-[300px] h-8 text-sm ${!form.first_name && error ? 'border-[hsl(var(--destructive))]' : ''}`} />
            </TRow>
            <TRow label="Middle Name">
              <Input value={form.middle_name} onChange={e => set('middle_name', e.target.value)} placeholder="Middle name" className="max-w-[300px] h-8 text-sm" />
            </TRow>
          </SectionTable>

          {/* Contact & Employment */}
          <SectionTable title="Contact & Employment" id="contact">
            <TRow label="Address">
              <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full address" className="h-8 text-sm" />
            </TRow>
            <TRow label="Contact Number">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-2 py-1 rounded font-mono shrink-0">🇵🇭 +63</span>
                <Input value={form.contact_number} onChange={e => handlePhoneChange(e.target.value)} placeholder="XXX XXX XXXX" className="max-w-[260px] h-8 text-sm" />
              </div>
            </TRow>
            <TRow label="Employer">
              <Input value={form.employer} onChange={e => set('employer', e.target.value)} placeholder="Company / Employer" className="max-w-[300px] h-8 text-sm" />
            </TRow>
          </SectionTable>

          {/* Demographics */}
          <SectionTable title="Demographics" id="demographics">
            <TRow label="Birthdate">
              <Input type="date" value={form.birthdate} onChange={e => set('birthdate', e.target.value)} className="max-w-[200px] h-8 text-sm" />
            </TRow>
            <TRow label="Age">
              <span className="font-semibold text-[hsl(var(--foreground))] bg-[hsl(var(--muted)/0.5)] px-3 py-1 rounded-md inline-block">{form.birthdate ? `${calcAge(form.birthdate)} years old` : '—'}</span>
            </TRow>
            <TRow label="Gender">
              <Select value={form.gender} onValueChange={v => set('gender', v)}>
                <SelectTrigger className="max-w-[200px] h-8 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </TRow>
            <TRow label="Marital Status">
              <Select value={form.marital_status} onValueChange={v => set('marital_status', v)}>
                <SelectTrigger className="max-w-[200px] h-8 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {MARITAL.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </TRow>
            <TRow label="Nationality">
              <div>
                <Input list="nat-list" value={form.nationality} onChange={e => set('nationality', e.target.value)} placeholder="Type or select…" className="max-w-[300px] h-8 text-sm" />
                <datalist id="nat-list">
                  {NATIONALITIES.map(n => <option key={n} value={n} />)}
                </datalist>
              </div>
            </TRow>
          </SectionTable>

          {/* Lab Test History */}
          <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
              <h3 className="text-sm font-semibold text-[hsl(var(--primary))]">Lab Test History</h3>
              {selectedId && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    {labHistory.length} test{labHistory.length !== 1 ? 's' : ''} on record
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setShowTimeline(!showTimeline)}>
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {showTimeline ? 'Table' : 'Timeline'}
                  </Button>
                </div>
              )}
            </div>

            {selectedId ? (
              showTimeline ? (
                <div className="p-4">
                  <PatientTimeline events={timelineEvents} />
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
                      <th className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Test</th>
                      <th className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Remark</th>
                      <th className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Status</th>
                      <th className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(labHistory as any[]).map((r: any) => (
                      <tr key={r.id} className="border-b border-[hsl(var(--border))] last:border-b-0 hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
                        <td className="px-4 py-2.5 text-sm font-medium">{r.report_type}</td>
                        <td className="px-4 py-2.5 text-sm text-[hsl(var(--muted-foreground))]">{r.remarks || '—'}</td>
                        <td className="px-4 py-2.5">
                          {r.is_normal !== undefined && (
                            <StatusBadge status={r.is_normal ? 'complete' : 'abnormal'} label={r.is_normal ? 'Normal' : 'Abnormal'} size="sm" />
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-[hsl(var(--muted-foreground))]">
                          {r.result_date ? format(new Date(r.result_date), 'MM/dd/yyyy') : '—'}
                        </td>
                      </tr>
                    ))}
                    {labHistory.length === 0 && (
                      <tr><td colSpan={4} className="text-center py-6 text-sm text-[hsl(var(--muted-foreground))]">No lab tests on record</td></tr>
                    )}
                  </tbody>
                </table>
              )
            ) : (
              <div className="px-4 py-6 text-center text-sm text-[hsl(var(--muted-foreground))]">Save patient first to view lab history</div>
            )}
          </div>
        </div>
      </div>

      <FloatingActionBar onSave={handleSave} saving={saveMutation.isPending} />
      {ConfirmDialog}
    </div>
  )
}
