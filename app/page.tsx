"use client"

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Plus, User } from 'lucide-react'
import { SectionCard, FormField, ReadOnlyField } from '@/components/ui/FormField'
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
  // Remove all non-digits
  const digits = value.replace(/\D/g, '')
  
  // Format as +63 XXX XXX XXXX for Philippine numbers
  if (digits.startsWith('63') && digits.length > 2) {
    const rest = digits.slice(2)
    if (rest.length <= 3) return `+63 ${rest}`
    if (rest.length <= 6) return `+63 ${rest.slice(0, 3)} ${rest.slice(3)}`
    return `+63 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6, 10)}`
  }
  
  // Format as 0XXX XXX XXXX for local numbers
  if (digits.startsWith('0') && digits.length > 1) {
    if (digits.length <= 4) return digits
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`
  }
  
  return value
}

export default function PatientProfile() {
  const [form, setForm] = useState<any>(emptyForm)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const qc = useQueryClient()
  const { selectedPatient, setSelectedPatient } = usePatient()
  const { addRecentPatient } = useRecentPatients()
  const { setOpen: setSearchOpen } = useSearch()

  useEffect(() => {
    if (selectedPatient) {
      setForm({ ...emptyForm, ...selectedPatient })
      setSelectedId(selectedPatient.id)
      setError('')
      setIsDirty(false)
    }
  }, [selectedPatient])

  // Add to recent patients separately to avoid infinite loop
  useEffect(() => {
    if (selectedPatient) {
      addRecentPatient(selectedPatient)
    }
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
    setSelectedId(null)
    setForm(emptyForm)
    setSelectedPatient(null)
    setError('')
    setIsDirty(false)
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

  const handlePhoneChange = (value: string) => {
    set('contact_number', formatPhoneNumber(value))
  }

  useCtrlS(handleSave)

  useGlobalShortcuts({
    onSave: handleSave,
    onNew: handleNew,
    onSearch: () => setSearchOpen(true),
  })

  const handleAutoSave = useCallback(async () => {
    if (isDirty && form.last_name && form.first_name) {
      await saveMutation.mutateAsync(form)
    }
  }, [isDirty, form, saveMutation])

  const lastVisit = (labHistory as any[]).length > 0
    ? [...(labHistory as any[])].sort((a, b) => new Date(b.result_date).getTime() - new Date(a.result_date).getTime())[0]
    : null

  const lastVisitInfo = lastVisit ? {
    date: lastVisit.result_date ? format(new Date(lastVisit.result_date), 'MMM dd, yyyy') : '—',
    test: lastVisit.report_type || '—',
    normal: lastVisit.is_normal,
  } : null

  // Calculate section completion
  const sections = [
    { 
      id: 'personal', 
      label: 'Personal Info', 
      completed: !!(form.last_name && form.first_name),
      hasError: !!(error && (!form.last_name || !form.first_name))
    },
    { 
      id: 'contact', 
      label: 'Contact', 
      completed: !!(form.address || form.contact_number),
      hasError: false
    },
    { 
      id: 'demographics', 
      label: 'Demographics', 
      completed: !!(form.birthdate && form.gender),
      hasError: false
    },
  ]

  // Determine patient status
  const getPatientStatus = () => {
    if (!selectedId) return 'incomplete'
    if (lastVisitInfo?.normal === false) return 'abnormal'
    if (labHistory.length === 0) return 'pending'
    return 'complete'
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pb-24">
      {selectedPatient && <StickyPatientHeader patient={selectedPatient} extra={lastVisitInfo} />}
      <div className="overflow-auto">
        <div className="max-w-5xl mx-auto w-full px-4 py-6 space-y-5">
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
            <div className="bg-[hsl(var(--accent)/0.4)] border border-[hsl(var(--accent))] rounded-xl px-4 py-3 text-sm text-[hsl(var(--accent-foreground))]">
              Use the search bar on the left to find an existing patient, or fill in the form below to create a new one.
              <button 
                onClick={() => setSearchOpen(true)}
                className="ml-2 text-[hsl(var(--primary))] font-medium hover:underline cursor-pointer"
              >
                Open Search (Ctrl+K)
              </button>
            </div>
          )}

          {error && (
            <div className="bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--destructive))] px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {/* Section progress */}
          <SectionProgress sections={sections} />

          <SectionCard>
            <ReadOnlyField
              label="Registration Date"
              value={form.registration_date ? format(new Date(form.registration_date), 'MMMM dd, yyyy') : '—'}
              highlight
            />
          </SectionCard>

          <SectionCard title="Personal Information">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Last Name" required>
                <Input 
                  value={form.last_name} 
                  onChange={e => set('last_name', e.target.value)} 
                  placeholder="Last name"
                  className={!form.last_name && error ? 'border-[hsl(var(--destructive))]' : ''}
                />
              </FormField>
              <FormField label="First Name" required>
                <Input 
                  value={form.first_name} 
                  onChange={e => set('first_name', e.target.value)} 
                  placeholder="First name"
                  className={!form.first_name && error ? 'border-[hsl(var(--destructive))]' : ''}
                />
              </FormField>
              <FormField label="Middle Name">
                <Input value={form.middle_name} onChange={e => set('middle_name', e.target.value)} placeholder="Middle name" />
              </FormField>
            </div>
            <div className="mt-4">
              <FormField label="Address">
                <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full address" />
              </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <FormField label="Contact Number" hint="Auto-formats as you type">
                <Input 
                  value={form.contact_number} 
                  onChange={e => handlePhoneChange(e.target.value)} 
                  placeholder="+63 XXX XXX XXXX" 
                />
              </FormField>
              <FormField label="Employer">
                <Input value={form.employer} onChange={e => set('employer', e.target.value)} placeholder="Company / Employer" />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Demographics">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField label="Birthdate">
                <Input type="date" value={form.birthdate} onChange={e => set('birthdate', e.target.value)} />
              </FormField>
              <FormField label="Age">
                <div className="px-3 py-2 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--muted-foreground))]">
                  {form.birthdate ? `${calcAge(form.birthdate)} years old` : '—'}
                </div>
              </FormField>
              <FormField label="Gender">
                <Select value={form.gender} onValueChange={v => set('gender', v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Marital Status">
                <Select value={form.marital_status} onValueChange={v => set('marital_status', v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {MARITAL.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Nationality" className="sm:col-span-2">
                <Input
                  list="nat-list"
                  value={form.nationality}
                  onChange={e => set('nationality', e.target.value)}
                  placeholder="Type or select…"
                />
                <datalist id="nat-list">
                  {NATIONALITIES.map(n => <option key={n} value={n} />)}
                </datalist>
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Lab Test History">
            {selectedId ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[hsl(var(--muted)/0.5)]">
                    <th className="text-left px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase">Test</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase">Remark</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase">Status</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(labHistory as any[]).map((r: any, i: number) => (
                    <tr key={r.id} className={`transition-colors hover:bg-[hsl(var(--accent)/0.4)] ${i % 2 === 0 ? 'bg-[hsl(var(--card))]' : 'bg-[hsl(var(--muted)/0.2)]'}`}>
                      <td className="px-4 py-2">{r.report_type}</td>
                      <td className="px-4 py-2 text-[hsl(var(--muted-foreground))]">{r.remarks || '—'}</td>
                      <td className="px-4 py-2">
                        {r.is_normal !== undefined && (
                          <StatusBadge 
                            status={r.is_normal ? 'complete' : 'abnormal'} 
                            label={r.is_normal ? 'Normal' : 'Abnormal'}
                            size="sm" 
                          />
                        )}
                      </td>
                      <td className="px-4 py-2 text-[hsl(var(--muted-foreground))]">
                        {r.result_date ? format(new Date(r.result_date), 'MM/dd/yyyy') : '—'}
                      </td>
                    </tr>
                  ))}
                  {labHistory.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-6 text-[hsl(var(--muted-foreground))]">No lab tests on record</td></tr>
                  )}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-4">Save patient first to view lab history</p>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Floating action bar */}
      <FloatingActionBar
        onSave={handleSave}
        saving={saveMutation.isPending}
      />
    </div>
  )
}
