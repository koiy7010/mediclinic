"use client"

import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import StickyPatientHeader from '@/components/StickyPatientHeader'
import { SectionCard, FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScanLine } from 'lucide-react'
import { format } from 'date-fns'
import { usePatient } from '@/lib/patient-context'
import { NormalToggle } from '@/components/ui/NormalToggle'
import { toast } from '@/lib/use-toast'
import { useCtrlS } from '@/lib/use-ctrl-s'
import NoPatientSelected from '@/components/NoPatientSelected'
import { FloatingActionBar } from '@/components/ui/FloatingActionBar'
import { AutoSaveIndicator } from '@/components/ui/AutoSaveIndicator'
import { useGlobalShortcuts } from '@/components/ui/KeyboardShortcuts'
import { PageBreadcrumb } from '@/components/ui/Breadcrumb'
import { PrintButton } from '@/components/ui/PrintButton'
import { cn } from '@/lib/utils'

const TEMPLATES = [
  { label: 'Normal Abdomen UTZ', findings: 'The liver is normal in size and echogenicity. No focal hepatic lesions. The gallbladder is normal. No calculi or wall thickening. The pancreas is not well visualized. The spleen is normal. Both kidneys are normal in size, shape, and echogenicity. No hydronephrosis or calculi. The urinary bladder is well-distended, with smooth walls and no intraluminal lesion.', impression: 'Normal abdominal ultrasound.', isNormal: true },
  { label: 'Fatty Liver', findings: 'The liver is enlarged with increased parenchymal echogenicity consistent with fatty infiltration. No focal hepatic lesions. The gallbladder, pancreas, spleen, and kidneys appear normal.', impression: 'Fatty liver (hepatic steatosis). Clinical correlation recommended.', isNormal: false },
  { label: 'Cholelithiasis', findings: 'The gallbladder contains multiple echogenic foci with posterior acoustic shadowing, consistent with gallstones. The common bile duct is not dilated. The liver, pancreas, spleen, and kidneys appear normal.', impression: 'Cholelithiasis.', isNormal: false },
  { label: 'KUB Normal', findings: 'Both kidneys are normal in size, shape, and position. The parenchymal echogenicity is normal. No hydronephrosis, calculi, or cysts detected. The urinary bladder is well-distended with smooth walls.', impression: 'Normal KUB ultrasound.', isNormal: true },
]

const PRINT_SECTIONS = [
  { id: 'patient-info', label: 'Patient Information', defaultChecked: true },
  { id: 'utz-details', label: 'UTZ Details', defaultChecked: true },
  { id: 'findings', label: 'Findings & Impression', defaultChecked: true },
]

function calcAge(birthdate: string) {
  if (!birthdate) return '—'
  return Math.floor((Date.now() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
}

export default function UtzReport() {
  const [form, setForm] = useState({ 
    report_title: 'Whole Abdomen UTZ', 
    result_date: format(new Date(), 'yyyy-MM-dd'), 
    examination_type: 'Ultrasound', 
    utz_no: '', 
    findings: '', 
    impression: '', 
    is_normal: null as boolean | null 
  })
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const qc = useQueryClient()
  const { selectedPatient } = usePatient()

  const saveMutation = useMutation({ 
    mutationFn: async () => form, 
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['radiology'] })
      toast({ title: 'UTZ report saved', variant: 'success' })
      setIsDirty(false)
    }
  })

  const set = (k: string, v: any) => {
    setForm(f => ({ ...f, [k]: v }))
    setIsDirty(true)
  }

  const handleSave = useCallback(() => {
    saveMutation.mutate()
  }, [saveMutation])

  useCtrlS(handleSave)

  useGlobalShortcuts({
    onSave: handleSave,
  })

  const handleAutoSave = useCallback(async () => {
    if (isDirty) {
      await saveMutation.mutateAsync()
    }
  }, [isDirty, saveMutation])

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    set('findings', template.findings)
    set('impression', template.impression)
    set('is_normal', template.isNormal)
    setActiveTemplate(template.label)
  }

  if (!selectedPatient) {
    return <NoPatientSelected icon={ScanLine} label="UTZ" />
  }

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))] pb-24">
      <StickyPatientHeader patient={selectedPatient} module="UTZ" />
      <div className="max-w-5xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Breadcrumb */}
        <PageBreadcrumb
          patientName={`${selectedPatient.last_name}, ${selectedPatient.first_name}`}
          module="UTZ"
        />

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-[hsl(var(--primary))]" />
              <h2 className="text-lg font-bold">UTZ (Ultrasound) Report</h2>
            </div>
            <AutoSaveIndicator isDirty={isDirty} onAutoSave={handleAutoSave} />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-[hsl(var(--muted-foreground))]">Ctrl+S to save</span>
            <PrintButton sections={PRINT_SECTIONS} />
          </div>
        </div>

        <div className="bg-[hsl(var(--primary))] rounded-xl px-6 py-4">
          <h2 className="text-xl font-bold text-[hsl(var(--primary-foreground))] text-center">{form.report_title}</h2>
        </div>

        <SectionCard title="Patient Information" id="patient-info">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div><p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Name</p><p className="text-sm font-medium mt-1">{selectedPatient.last_name}, {selectedPatient.first_name}</p></div>
            <div><p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Company</p><p className="text-sm font-medium mt-1">{selectedPatient.employer || '—'}</p></div>
            <div><p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Age / Sex</p><p className="text-sm font-medium mt-1">{calcAge(selectedPatient.birthdate ?? '')} yrs / {selectedPatient.gender || '—'}</p></div>
            <FormField label="Result Date"><Input type="date" value={form.result_date} onChange={e => set('result_date', e.target.value)} /></FormField>
          </div>
        </SectionCard>

        <SectionCard title="UTZ Details" id="utz-details">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <FormField label="Report Title" className="sm:col-span-2"><Input value={form.report_title} onChange={e => set('report_title', e.target.value)} /></FormField>
            <FormField label="Examination Type"><Input value={form.examination_type} onChange={e => set('examination_type', e.target.value)} placeholder="e.g. Whole Abdomen" /></FormField>
            <FormField label="UTZ No."><Input value={form.utz_no} onChange={e => set('utz_no', e.target.value)} placeholder="UTZ-000000" /></FormField>
          </div>

          <div className="mb-4">
            <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-2">Quick Templates</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map(t => (
                <Button key={t.label} variant="outline" size="sm"
                  onClick={() => applyTemplate(t)}
                  className={cn(
                    activeTemplate === t.label 
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]' 
                      : '',
                    !t.isNormal && 'border-amber-300 text-amber-700 hover:bg-amber-50'
                  )}>
                  {t.label}
                  {t.isNormal && <span className="ml-1 text-[10px] text-[hsl(var(--success))]">✓</span>}
                </Button>
              ))}
            </div>
          </div>

          <FormField label="Findings" required className="mb-4" id="findings">
            <textarea value={form.findings} onChange={e => set('findings', e.target.value)} rows={5}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none transition-all hover:border-[hsl(var(--primary)/0.5)] hover:shadow-md" 
              placeholder="Describe ultrasound findings…" />
          </FormField>

          <FormField label="Impression" required className="mb-4">
            <textarea value={form.impression} onChange={e => set('impression', e.target.value)} rows={3}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none transition-all hover:border-[hsl(var(--primary)/0.5)] hover:shadow-md" 
              placeholder="Clinical impression…" />
          </FormField>

          <NormalToggle value={form.is_normal} onChange={v => set('is_normal', v)} name="utz_normal" />
        </SectionCard>
      </div>

      {/* Floating action bar */}
      <FloatingActionBar
        onSave={handleSave}
        saving={saveMutation.isPending}
      />
    </div>
  )
}
