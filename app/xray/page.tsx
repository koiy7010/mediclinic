"use client"

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import StickyPatientHeader from '@/components/StickyPatientHeader'
import { SectionCard, FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, Search, RadioTower } from 'lucide-react'
import { format } from 'date-fns'
import { mockRadiologyReports } from '@/lib/mockData'
import { usePatient } from '@/lib/patient-context'
import { useSearch } from '@/lib/search-context'

const TEMPLATES = [
  { label: 'Normal Chest PA', findings: 'The lungs are clear. No infiltrates, consolidation, or pleural effusion noted. The heart is not enlarged. The mediastinum is within normal limits. The bony thorax is intact.', impression: 'Normal chest PA view.' },
  { label: 'Mild Cardiomegaly', findings: 'The heart appears mildly enlarged. The pulmonary vascularity is within normal limits. No pleural effusion. Lungs are clear.', impression: 'Mild cardiomegaly.' },
  { label: 'PTB Active', findings: 'There are patchy infiltrates noted in the upper lobe of the right lung. The left lung is clear. No pleural effusion.', impression: 'Findings may suggest active pulmonary tuberculosis. Correlation with clinical findings recommended.' },
  { label: 'PTB Minimal', findings: 'Minimal infiltrates noted in the right upper lobe. Left lung is clear. Heart size is normal. Bony thorax intact.', impression: 'Findings suggest minimal PTB. Please correlate clinically.' },
]

function calcAge(birthdate: string) {
  if (!birthdate) return '—'
  return Math.floor((Date.now() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
}

export default function XRayReport() {
  const [form, setForm] = useState({ report_title: 'Chest PA (Postero-Anterior)', result_date: format(new Date(), 'yyyy-MM-dd'), examination_type: 'X-Ray', xray_no: '', findings: '', impression: '', is_normal: null as boolean | null })
  const qc = useQueryClient()
  const { selectedPatient } = usePatient()
  const { setOpen } = useSearch()

  useEffect(() => {
    if (selectedPatient) {
      const reports = mockRadiologyReports[selectedPatient.id]
      if (reports && reports.length > 0) {
        const r = reports[0]
        setForm({ report_title: r.report_title, result_date: r.result_date, examination_type: r.examination_type, xray_no: r.xray_no, findings: r.findings, impression: r.impression, is_normal: r.is_normal })
      }
    }
  }, [selectedPatient])

  const saveMutation = useMutation({ mutationFn: async () => form, onSuccess: () => qc.invalidateQueries({ queryKey: ['radiology'] }) })
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  if (!selectedPatient) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--background))] gap-4 px-4">
        <div className="w-14 h-14 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
          <RadioTower className="w-7 h-7 text-[hsl(var(--primary))]" />
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
            <RadioTower className="w-5 h-5 text-[hsl(var(--primary))]" />
            <h2 className="text-lg font-bold">X-Ray Report</h2>
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />{saveMutation.isPending ? 'Saving…' : 'Save Report'}
          </Button>
        </div>
        <div className="bg-[hsl(var(--primary))] rounded-xl px-6 py-4">
          <h2 className="text-xl font-bold text-[hsl(var(--primary-foreground))] text-center">{form.report_title}</h2>
        </div>
        <SectionCard title="Patient Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div><p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Name</p><p className="text-sm font-medium mt-1">{selectedPatient.last_name}, {selectedPatient.first_name}</p></div>
            <div><p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Company</p><p className="text-sm font-medium mt-1">{selectedPatient.employer || '—'}</p></div>
            <div><p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Age / Sex</p><p className="text-sm font-medium mt-1">{calcAge(selectedPatient.birthdate ?? '')} yrs / {selectedPatient.gender || '—'}</p></div>
            <FormField label="Result Date"><Input type="date" value={form.result_date} onChange={e => set('result_date', e.target.value)} /></FormField>
          </div>
        </SectionCard>
        <SectionCard title="X-Ray Details">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <FormField label="Report Title" className="sm:col-span-2"><Input value={form.report_title} onChange={e => set('report_title', e.target.value)} /></FormField>
            <FormField label="Examination Type"><Input value={form.examination_type} onChange={e => set('examination_type', e.target.value)} placeholder="e.g. Chest PA" /></FormField>
            <FormField label="X-Ray No."><Input value={form.xray_no} onChange={e => set('xray_no', e.target.value)} placeholder="XR-000000" /></FormField>
          </div>
          <div className="mb-4">
            <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-2">Quick Templates</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map(t => <Button key={t.label} variant="outline" size="sm" onClick={() => { set('findings', t.findings); set('impression', t.impression) }}>{t.label}</Button>)}
            </div>
          </div>
          <FormField label="Radiology Findings" required className="mb-4">
            <textarea value={form.findings} onChange={e => set('findings', e.target.value)} rows={5}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none transition-all hover:border-[hsl(var(--primary)/0.5)] hover:shadow-md" placeholder="Describe the radiology findings…" />
          </FormField>
          <FormField label="Impression" required className="mb-4">
            <textarea value={form.impression} onChange={e => set('impression', e.target.value)} rows={3}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none transition-all hover:border-[hsl(var(--primary)/0.5)] hover:shadow-md" placeholder="Clinical impression…" />
          </FormField>
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium">Normal?</p>
            {['Yes', 'No'].map(opt => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="xray_normal" value={opt} checked={form.is_normal === (opt === 'Yes')} onChange={() => set('is_normal', opt === 'Yes')} className="w-4 h-4 accent-[hsl(var(--primary))]" />
                <span className="text-sm font-medium">{opt}</span>
              </label>
            ))}
            <Button variant="ghost" size="sm" className="text-[hsl(var(--muted-foreground))]" onClick={() => set('is_normal', null)}>✕ Clear</Button>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
