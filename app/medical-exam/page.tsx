"use client"

import { useState, useEffect, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import StickyPatientHeader from '@/components/StickyPatientHeader'
import { SectionCard, FormField } from '@/components/ui/FormField'
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
import { Tooltip } from '@/components/ui/Tooltip'

const BMI_CLASS = ['Normal', 'Overweight', 'Underweight', 'Obese Class I', 'Obese Class II', 'Obese Class III']

const BODY_SYSTEMS = [
  'Head / Scalp', 'Eyes', 'Ears', 'Nose', 'Neck / Throat',
  'Chest / Breasts', 'Lungs', 'Heart', 'Abdomen', 'Back',
  'Genitals', 'Extremities', 'Skin', 'Anus',
]

// Normal values for quick fill
const NORMAL_PHYSICAL_EXAM = {
  bp_systolic: '120',
  bp_diastolic: '80',
  pulse_rate: '72',
  respiration: '18',
  temperature: '36.5',
  ishihara: 'Normal',
  systems: BODY_SYSTEMS.reduce((acc, s) => ({ ...acc, [s]: { normal: true, findings: '' } }), {}),
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

  useGlobalShortcuts({
    onSave: handleSave,
  })

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
      height: '',
      weight: '',
      bmi: '',
      bmi_classification: '',
      past_history: {},
      physical_exam: {},
      lab_summary: {},
      evaluation: {},
    }))
    setIsDirty(true)
    toast({ title: 'All fields cleared', variant: 'default' })
  }

  const handleAutoSave = useCallback(async () => {
    if (isDirty) {
      await saveMutation.mutateAsync()
    }
  }, [isDirty, saveMutation])

  // Calculate section completion
  const sections = [
    { 
      id: 'patient-info', 
      label: 'Patient Info', 
      completed: !!(form.height && form.weight),
      hasError: false
    },
    { 
      id: 'past-history', 
      label: 'Past History', 
      completed: Object.keys(form.past_history || {}).length > 0,
      hasError: false
    },
    { 
      id: 'physical-exam', 
      label: 'Physical Exam', 
      completed: !!(form.physical_exam?.bp_systolic),
      hasError: false
    },
    { 
      id: 'lab-summary', 
      label: 'Lab Summary', 
      completed: Object.keys(form.lab_summary?.tests || {}).length > 0,
      hasError: false
    },
    { 
      id: 'evaluation', 
      label: 'Evaluation', 
      completed: !!(form.evaluation?.evaluation),
      hasError: false
    },
  ]

  if (!selectedPatient) {
    return <NoPatientSelected icon={Stethoscope} label="Medical Exam" />
  }

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))] pb-24">
      <StickyPatientHeader patient={selectedPatient} module="Medical Exam" />

      <div className="max-w-5xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Breadcrumb */}
        <PageBreadcrumb
          patientName={`${selectedPatient.last_name}, ${selectedPatient.first_name}`}
          module="Medical Exam"
        />

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[hsl(var(--primary))]" />
              <h2 className="text-lg font-bold">Medical Examination</h2>
            </div>
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

        {/* Section progress */}
        <SectionProgress sections={sections} />

        <SectionCard title="Patient Information" id="patient-info">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
            {[
              { label: 'Company', val: selectedPatient.employer },
              { label: 'Name', val: `${selectedPatient.last_name}, ${selectedPatient.first_name}` },
              { label: 'Gender', val: selectedPatient.gender },
              { label: 'Birthdate', val: selectedPatient.birthdate },
              { label: 'Age', val: `${calcAge(selectedPatient.birthdate ?? '')} yrs` },
            ].map(f => (
              <div key={f.label}>
                <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{f.label}</p>
                <p className="text-sm font-medium mt-1">{f.val || '—'}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <FormField label="Height (cm)">
              <Input type="number" value={form.height} onChange={e => handleHeightWeight('height', e.target.value)} placeholder="cm" />
            </FormField>
            <FormField label="Weight (kg)">
              <Input type="number" value={form.weight} onChange={e => handleHeightWeight('weight', e.target.value)} placeholder="kg" />
            </FormField>
            <FormField label="BMI">
              <Tooltip content="Body Mass Index - calculated from height and weight">
                <div className="px-3 py-2 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm font-semibold cursor-help">
                  {form.bmi || '—'}
                </div>
              </Tooltip>
            </FormField>
            <FormField label="BMI Classification" className="col-span-2">
              <Select value={form.bmi_classification} onValueChange={v => set('bmi_classification', v)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>{BMI_CLASS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField label="SA No.">
              <div className="px-3 py-2 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--muted-foreground))]">{form.sa_no || '—'}</div>
            </FormField>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <FormField label="Result Date">
              <Input type="date" value={form.result_date} onChange={e => set('result_date', e.target.value)} disabled={form.use_current_date} className="w-48" />
            </FormField>
            <label className="flex items-center gap-2 cursor-pointer mt-5">
              <Checkbox checked={!!form.use_current_date} onCheckedChange={v => { set('use_current_date', v); if (v) set('result_date', format(new Date(), 'yyyy-MM-dd')) }} />
              <span className="text-sm">Use Current Date</span>
            </label>
          </div>
        </SectionCard>

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

      {/* Floating action bar */}
      <FloatingActionBar
        onSave={handleSave}
        saving={saveMutation.isPending}
      />
    </div>
  )
}
