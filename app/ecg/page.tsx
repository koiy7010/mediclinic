"use client"

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import StickyPatientHeader from '@/components/StickyPatientHeader'
import { SectionCard, FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, Activity } from 'lucide-react'
import { format } from 'date-fns'
import { usePatient } from '@/lib/patient-context'
import { NormalToggle } from '@/components/ui/NormalToggle'
import { toast } from '@/lib/use-toast'
import { useCtrlS } from '@/lib/use-ctrl-s'
import NoPatientSelected from '@/components/NoPatientSelected'

const TEMPLATES = [
  { label: 'Normal Sinus Rhythm', findings: 'Rate: 72 bpm. Regular rhythm. Normal P wave morphology. PR interval: 0.16s. QRS duration: 0.08s. Normal axis. No ST segment changes. No T wave abnormalities.', impression: 'Normal sinus rhythm. No acute changes.' },
  { label: 'Sinus Tachycardia', findings: 'Rate: 105 bpm. Regular rhythm. Normal P wave morphology. PR interval: 0.14s. QRS duration: 0.08s. Normal axis. No ST segment changes.', impression: 'Sinus tachycardia. Clinical correlation advised.' },
  { label: 'Sinus Bradycardia', findings: 'Rate: 52 bpm. Regular rhythm. Normal P wave morphology. PR interval: 0.18s. QRS duration: 0.08s. Normal axis. No ST or T wave changes.', impression: 'Sinus bradycardia. Clinical correlation advised.' },
  { label: 'LVH Pattern', findings: 'Rate: 78 bpm. Regular sinus rhythm. Increased QRS voltage in precordial leads. Sokolow-Lyon criterion positive. No significant ST-T changes.', impression: 'Electrocardiographic pattern consistent with left ventricular hypertrophy (LVH). Clinical correlation recommended.' },
]

function calcAge(birthdate: string) {
  if (!birthdate) return '—'
  return Math.floor((Date.now() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
}

export default function EcgReport() {
  const [form, setForm] = useState({ report_title: 'Electrocardiogram (ECG)', result_date: format(new Date(), 'yyyy-MM-dd'), examination_type: 'ECG', xray_no: '', findings: '', impression: '', is_normal: null as boolean | null })
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)
  const qc = useQueryClient()
  const { selectedPatient } = usePatient()

  const saveMutation = useMutation({ mutationFn: async () => form, onSuccess: () => {
    qc.invalidateQueries({ queryKey: ['radiology'] })
    toast({ title: 'ECG report saved', variant: 'success' })
  }})
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))
  useCtrlS(() => saveMutation.mutate())

  if (!selectedPatient) {
    return <NoPatientSelected icon={Activity} label="ECG" />
  }

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))]">
      <StickyPatientHeader patient={selectedPatient} module="ECG" />
      <div className="max-w-5xl mx-auto w-full px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[hsl(var(--primary))]" />
            <h2 className="text-lg font-bold">ECG Report</h2>
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
        <SectionCard title="ECG Details">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <FormField label="Report Title" className="sm:col-span-2"><Input value={form.report_title} onChange={e => set('report_title', e.target.value)} /></FormField>
            <FormField label="Examination Type"><Input value={form.examination_type} onChange={e => set('examination_type', e.target.value)} placeholder="e.g. 12-Lead ECG" /></FormField>
            <FormField label="ECG No."><Input value={form.xray_no} onChange={e => set('xray_no', e.target.value)} placeholder="ECG-000000" /></FormField>
          </div>
          <div className="mb-4">
            <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-2">Quick Templates</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map(t => (
                <Button key={t.label} variant="outline" size="sm"
                  onClick={() => { set('findings', t.findings); set('impression', t.impression); setActiveTemplate(t.label) }}
                  className={activeTemplate === t.label ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]' : ''}>
                  {t.label}
                </Button>
              ))}
            </div>
          </div>
          <FormField label="ECG Findings" required className="mb-4">
            <textarea value={form.findings} onChange={e => set('findings', e.target.value)} rows={5}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none transition-all hover:border-[hsl(var(--primary)/0.5)] hover:shadow-md" placeholder="Describe ECG findings…" />
          </FormField>
          <FormField label="Impression" required className="mb-4">
            <textarea value={form.impression} onChange={e => set('impression', e.target.value)} rows={3}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none transition-all hover:border-[hsl(var(--primary)/0.5)] hover:shadow-md" placeholder="Clinical impression…" />
          </FormField>
          <div className="flex items-center gap-4">
            <NormalToggle value={form.is_normal} onChange={v => set('is_normal', v)} name="ecg_normal" />
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
