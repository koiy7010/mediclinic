"use client"

import { useState, useEffect } from 'react'
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
import { Save, Search, Stethoscope } from 'lucide-react'
import { format } from 'date-fns'
import { mockMedicalExams } from '@/lib/mockData'
import { usePatient } from '@/lib/patient-context'
import { useSearch } from '@/lib/search-context'

const BMI_CLASS = ['Normal', 'Overweight', 'Underweight', 'Obese Class I', 'Obese Class II', 'Obese Class III']

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
  const qc = useQueryClient()
  const { selectedPatient } = usePatient()
  const { setOpen } = useSearch()

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
      }
    }
  }, [selectedPatient])

  const saveMutation = useMutation({
    mutationFn: async () => form,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medical-exams'] }),
  })

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  function handleHeightWeight(k: string, v: string) {
    const updated = { ...form, [k]: v }
    updated.bmi = calcBMI(k === 'weight' ? v : form.weight, k === 'height' ? v : form.height)
    setForm(updated)
  }

  if (!selectedPatient) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--background))] gap-4 px-4">
        <div className="w-14 h-14 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
          <Stethoscope className="w-7 h-7 text-[hsl(var(--primary))]" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-[hsl(var(--foreground))]">No patient selected</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Click Search Patient below to open the patient search overlay.</p>
        </div>
        <Button variant="outline" onClick={() => setOpen(true)}>
          <Search className="w-4 h-4 mr-2" /> Search Patient
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))]">
      <StickyPatientHeader patient={selectedPatient} />

      <div className="max-w-5xl mx-auto w-full px-4 py-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[hsl(var(--primary))]" />
              <h2 className="text-lg font-bold">Medical Examination</h2>
            </div>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />{saveMutation.isPending ? 'Saving…' : 'Save Examination'}
            </Button>
          </div>

            <SectionCard title="Patient Information">
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
                <FormField label="Height (cm)"><Input type="number" value={form.height} onChange={e => handleHeightWeight('height', e.target.value)} placeholder="cm" /></FormField>
                <FormField label="Weight (kg)"><Input type="number" value={form.weight} onChange={e => handleHeightWeight('weight', e.target.value)} placeholder="kg" /></FormField>
                <FormField label="BMI">
                  <div className="px-3 py-2 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm font-semibold">{form.bmi || '—'}</div>
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

          <PastMedicalHistory data={form.past_history} onChange={v => set('past_history', v)} />
          <PhysicalExamination data={form.physical_exam} patient={selectedPatient} onChange={v => set('physical_exam', v)} />
          <LabDiagnosticSummary data={form.lab_summary} onChange={v => set('lab_summary', v)} />
          <Evaluation data={form.evaluation} onChange={v => set('evaluation', v)} />

          <div className="flex justify-end pb-8">
            <Button size="lg" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              <Save className="w-5 h-5 mr-2" />{saveMutation.isPending ? 'Saving…' : 'Save Examination'}
            </Button>
          </div>
      </div>
    </div>
  )
}
