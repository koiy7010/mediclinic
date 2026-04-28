"use client"

import { useState, useEffect, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import StickyPatientHeader from '@/components/StickyPatientHeader'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import PastMedicalHistory from '@/components/medicalexam/PastMedicalHistory'
import PhysicalExamination from '@/components/medicalexam/PhysicalExamination'
import LabDiagnosticSummary from '@/components/medicalexam/LabDiagnosticSummary'
import Evaluation from '@/components/medicalexam/Evaluation'
import { Save, Stethoscope, CheckCheck, Eraser } from 'lucide-react'
import { format } from 'date-fns'
import { mockMedicalExams } from '@/lib/mockData'
import { usePatient } from '@/lib/patient-context'
import { toast } from '@/lib/use-toast'
import { useCtrlS } from '@/lib/use-ctrl-s'
import NoPatientSelected from '@/components/NoPatientSelected'
import { FloatingActionBar } from '@/components/ui/FloatingActionBar'
import { AutoSaveIndicator } from '@/components/ui/AutoSaveIndicator'
import { useGlobalShortcuts } from '@/components/ui/KeyboardShortcuts'
import { SectionProgress } from '@/components/ui/ProgressIndicator'
import { PageBreadcrumb } from '@/components/ui/Breadcrumb'
import { PrintButton } from '@/components/ui/PrintButton'

const BMI_CLASS = ['Normal', 'Overweight', 'Underweight', 'Obese Class I', 'Obese Class II', 'Obese Class III']

// Normal values for quick fill
const NORMAL_PHYSICAL_EXAM = {
  bp_systolic: '120',
  bp_diastolic: '80',
  pulse_rate: '72',
  respiration: '18',
  temperature: '36.5',
  ishihara: 'Normal',
  systems: [
    'Head / Scalp', 'Eyes', 'Ears', 'Nose', 'Neck / Throat',
    'Chest / Breasts', 'Lungs', 'Heart', 'Abdomen', 'Back',
    'Genitals', 'Extremities', 'Skin', 'Anus',
  ].reduce((acc, s) => ({ ...acc, [s]: { normal: true, findings: '' } }), {}),
  visual_acuity: {
    'OD (Right)_w/o Glasses': '20/20',
    'OS (Left)_w/o Glasses': '20/20',
    'OU (Both)_w/o Glasses': '20/20',
  },
}

const NORMAL_LAB_SUMMARY = {
  tests: {
    'Hematology': { result: 'Normal', status: 'Normal' },
    'Urinalysis': { result: 'Normal', status: 'Normal' },
    'Fecalysis': { result: 'Normal', status: 'Normal' },
    'Chest X-Ray': { result: 'Normal', status: 'Normal' },
    'ECG': { result: 'Normal Sinus Rhythm', status: 'Normal' },
    'HBsAg': { result: 'Non-Reactive', status: 'Normal' },
    'Drug Test': { result: 'Negative', status: 'Normal' },
  },
}

const NORMAL_EVALUATION = {
  evaluation: 'A',
  remarks: 'Fit for work',
  recommendations: '',
  for_clearance: false,
}

const PRINT_SECTIONS = [
  { id: 'patient-info', label: 'Patient Information', defaultChecked: true },
  { id: 'past-history', label: 'Past Medical History', defaultChecked: true },
  { id: 'physical-exam', label: 'Physical Examination', defaultChecked: true },
  { id: 'lab-summary', label: 'Lab/Diagnostic Summary', defaultChecked: true },
  { id: 'evaluation', label: 'Evaluation', defaultChecked: true },
]

function calcBMI(weight: string, height: string) {
  const w = parseFloat(weight)
  const h = parseFloat(height) / 100
  if (!w || !h) return ''
  return (w / (h * h)).toFixed(1)
}

function calcAge(birthdate: string) {
  if (!birthdate) return '—'
  return Math.floor((Date.now() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
}

/* ── Reusable table row ── */
function TableRow({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <tr className={`border-b border-[hsl(var(--border))] last:border-b-0 hover:bg-[hsl(var(--accent)/0.3)] transition-colors ${className}`}>
      <td className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] w-[40%] align-middle whitespace-nowrap">{label}</td>
      <td className="px-4 py-2.5 text-sm text-[hsl(var(--foreground))] align-middle">{children}</td>
    </tr>
  )
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <tr className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
      <td colSpan={2} className="px-4 py-2 text-xs font-semibold text-[hsl(var(--primary))] uppercase tracking-wide">{children}</td>
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

export default function MedicalExamination() {
  const [form, setForm] = useState<any>({
    result_date: format(new Date(), 'yyyy-MM-dd'),
    use_current_date: true,
    height: '', weight: '', bmi: '', bmi_classification: '',
    sa_no: '',
    past_history: {}, physical_exam: {}, lab_summary: {}, evaluation: {}
  })
  const [isDirty, setIsDirty] = useState(false)
  const qc = useQueryClient()
  const { selectedPatient } = usePatient()

  useEffect(() => {
    if (selectedPatient) {
      const exam = mockMedicalExams[selectedPatient.id]
      if (exam) {
        setForm((f: any) => ({
          ...f,
          height: String(exam.height ?? ''),
          weight: String(exam.weight ?? ''),
          bmi: String(exam.bmi ?? ''),
          bmi_classification: exam.bmi_classification ?? '',
          sa_no: exam.sa_no ?? '',
          result_date: exam.result_date ?? f.result_date,
          past_history: exam.past_medical_history ?? {},
          physical_exam: exam.physical_examination ?? {},
          evaluation: { evaluation: exam.evaluation, remarks: exam.remarks, recommendations: exam.recommendations, for_clearance: exam.for_clearance },
        }))
        setIsDirty(false)
      }
    }
  }, [selectedPatient])

  const saveMutation = useMutation({
    mutationFn: async () => form,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medical-exams'] })
      toast({ title: 'Medical examination saved', variant: 'success' })
      setIsDirty(false)
    },
  })

  const set = (k: string, v: any) => {
    setForm((f: any) => ({ ...f, [k]: v }))
    setIsDirty(true)
  }

  const handleSave = useCallback(() => {
    saveMutation.mutate()
  }, [saveMutation])

  useCtrlS(handleSave)
  useGlobalShortcuts({ onSave: handleSave })

  function handleHeightWeight(k: string, v: string) {
    const updated = { ...form, [k]: v }
    updated.bmi = calcBMI(k === 'weight' ? v : form.weight, k === 'height' ? v : form.height)
    setForm(updated)
    setIsDirty(true)
  }

  function fillAllNormal() {
    setForm((f: any) => ({
      ...f,
      bmi_classification: 'Normal',
      past_history: { conditions: {}, smoker: false, alcohol: false },
      physical_exam: NORMAL_PHYSICAL_EXAM,
      lab_summary: NORMAL_LAB_SUMMARY,
      evaluation: NORMAL_EVALUATION,
    }))
    setIsDirty(true)
    toast({ title: 'Filled with normal values', variant: 'success' })
  }

  function clearAllFields() {
    setForm((f: any) => ({
      ...f,
      height: '', weight: '', bmi: '', bmi_classification: '',
      past_history: {}, physical_exam: {}, lab_summary: {}, evaluation: {},
    }))
    setIsDirty(true)
    toast({ title: 'All fields cleared', variant: 'default' })
  }

  const handleAutoSave = useCallback(async () => {
    if (isDirty) await saveMutation.mutateAsync()
  }, [isDirty, saveMutation])

  const sections = [
    { id: 'patient-info', label: 'Patient Info', completed: !!(form.height && form.weight), hasError: false },
    { id: 'past-history', label: 'Past History', completed: Object.keys(form.past_history || {}).length > 0, hasError: false },
    { id: 'physical-exam', label: 'Physical Exam', completed: !!(form.physical_exam?.bp_systolic), hasError: false },
    { id: 'lab-summary', label: 'Lab Summary', completed: Object.keys(form.lab_summary?.tests || {}).length > 0, hasError: false },
    { id: 'evaluation', label: 'Evaluation', completed: !!(form.evaluation?.evaluation), hasError: false },
  ]

  if (!selectedPatient) {
    return <NoPatientSelected icon={Stethoscope} label="Medical Exam" />
  }

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))] pb-24">
      <StickyPatientHeader patient={selectedPatient} module="Medical Exam" />

      <div className="max-w-5xl mx-auto w-full px-4 py-6 space-y-4">
        <PageBreadcrumb
          patientName={`${selectedPatient.last_name}, ${selectedPatient.first_name}`}
          module="Medical Exam"
        />

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Stethoscope className="w-5 h-5 text-[hsl(var(--primary))]" />
            <h2 className="text-lg font-bold">Medical Examination</h2>
            <AutoSaveIndicator isDirty={isDirty} onAutoSave={handleAutoSave} />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-[hsl(var(--muted-foreground))]">Ctrl+S to save</span>
            <div className="flex items-center rounded-lg border border-[hsl(var(--border))] overflow-hidden">
              <Button variant="ghost" size="sm" onClick={fillAllNormal}
                className="rounded-none border-r border-[hsl(var(--border))] text-[hsl(var(--success))] hover:bg-[hsl(var(--success-muted))] hover:text-[hsl(var(--success))]">
                <CheckCheck className="w-4 h-4 mr-1.5" /> All Normal
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAllFields}
                className="rounded-none text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]">
                <Eraser className="w-4 h-4 mr-1.5" /> Clear
              </Button>
            </div>
            <PrintButton sections={PRINT_SECTIONS} />
          </div>
        </div>

        <SectionProgress sections={sections} />

        {/* Patient Information */}
        <SectionTable title="Patient Information" id="patient-info">
          <TableRow label="Company">{selectedPatient.employer || '—'}</TableRow>
          <TableRow label="Name">{`${selectedPatient.last_name}, ${selectedPatient.first_name}`}</TableRow>
          <TableRow label="Gender">{selectedPatient.gender || '—'}</TableRow>
          <TableRow label="Birthdate">{selectedPatient.birthdate || '—'}</TableRow>
          <TableRow label="Age">{`${calcAge(selectedPatient.birthdate ?? '')} yrs`}</TableRow>
          <TableHeader>Measurements</TableHeader>
          <TableRow label="Height (cm)">
            <Input type="number" value={form.height} onChange={e => handleHeightWeight('height', e.target.value)} placeholder="cm" className="max-w-[200px] h-8 text-sm" />
          </TableRow>
          <TableRow label="Weight (kg)">
            <Input type="number" value={form.weight} onChange={e => handleHeightWeight('weight', e.target.value)} placeholder="kg" className="max-w-[200px] h-8 text-sm" />
          </TableRow>
          <TableRow label="BMI">
            <span className="font-semibold">{form.bmi || '—'}</span>
          </TableRow>
          <TableRow label="BMI Classification">
            <Select value={form.bmi_classification} onValueChange={v => set('bmi_classification', v)}>
              <SelectTrigger className="max-w-[200px] h-8 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{BMI_CLASS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </TableRow>
          <TableRow label="SA No."><span>{form.sa_no || '—'}</span></TableRow>
          <TableRow label="Result Date">
            <div className="flex items-center gap-3">
              <Input type="date" value={form.result_date} onChange={e => set('result_date', e.target.value)} disabled={form.use_current_date} className="max-w-[200px] h-8 text-sm" />
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={!!form.use_current_date} onCheckedChange={v => { set('use_current_date', v); if (v) set('result_date', format(new Date(), 'yyyy-MM-dd')) }} />
                <span className="text-sm">Use Current Date</span>
              </label>
            </div>
          </TableRow>
        </SectionTable>

        <div id="past-history">
          <PastMedicalHistory data={form.past_history} onChange={v => set('past_history', v)} />
        </div>

        <div id="physical-exam">
          <PhysicalExamination data={form.physical_exam} patient={selectedPatient} onChange={v => set('physical_exam', v)} />
        </div>

        <div id="lab-summary">
          <LabDiagnosticSummary data={form.lab_summary} onChange={v => set('lab_summary', v)} />
        </div>

        <div id="evaluation">
          <Evaluation data={form.evaluation} onChange={v => set('evaluation', v)} />
        </div>
      </div>

      <FloatingActionBar onSave={handleSave} saving={saveMutation.isPending} />
    </div>
  )
}
