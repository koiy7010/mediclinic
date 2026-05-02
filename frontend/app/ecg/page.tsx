"use client"

import { useState, useEffect, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import StickyPatientHeader from '@/components/StickyPatientHeader'
import { SectionCard, FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Zap } from 'lucide-react'
import { format } from 'date-fns'
import { usePatient } from '@/lib/patient-context'
import { apiClient } from '@/lib/api-client'
import { NormalToggle } from '@/components/ui/NormalToggle'
import { toast } from '@/lib/use-toast'
import { useCtrlS } from '@/lib/use-ctrl-s'
import NoPatientSelected from '@/components/NoPatientSelected'
import { FloatingActionBar } from '@/components/ui/FloatingActionBar'
import { AutoSaveIndicator } from '@/components/ui/AutoSaveIndicator'
import { useGlobalShortcuts } from '@/components/ui/KeyboardShortcuts'
import { PageBreadcrumb } from '@/components/ui/Breadcrumb'
import { PrintButton } from '@/components/ui/PrintButton'
import { FileUpload } from '@/components/ui/FileUpload'
import { VisitSelector } from '@/components/ui/VisitSelector'
import { cn } from '@/lib/utils'
import { useEditGuard } from '@/lib/use-edit-guard'

const TEMPLATES = [
  { label: 'Normal Sinus Rhythm', findings: 'Rate: 72 bpm. Regular rhythm. Normal P wave morphology. PR interval: 0.16s. QRS duration: 0.08s. Normal axis. No ST segment changes. No T wave abnormalities.', impression: 'Normal sinus rhythm. No acute changes.', isNormal: true },
  { label: 'Sinus Tachycardia', findings: 'Rate: 105 bpm. Regular rhythm. Normal P wave morphology. PR interval: 0.14s. QRS duration: 0.08s. Normal axis. No ST segment changes.', impression: 'Sinus tachycardia. Clinical correlation advised.', isNormal: false },
  { label: 'Sinus Bradycardia', findings: 'Rate: 52 bpm. Regular rhythm. Normal P wave morphology. PR interval: 0.18s. QRS duration: 0.08s. Normal axis. No ST or T wave changes.', impression: 'Sinus bradycardia. Clinical correlation advised.', isNormal: false },
  { label: 'LVH Pattern', findings: 'Rate: 78 bpm. Regular sinus rhythm. Increased QRS voltage in precordial leads. Sokolow-Lyon criterion positive. No significant ST-T changes.', impression: 'Electrocardiographic pattern consistent with left ventricular hypertrophy (LVH). Clinical correlation recommended.', isNormal: false },
]

const PRINT_SECTIONS = [
  { id: 'patient-info', label: 'Patient Information', defaultChecked: true },
  { id: 'ecg-details', label: 'ECG Details', defaultChecked: true },
  { id: 'findings', label: 'Findings & Impression', defaultChecked: true },
]

const EMPTY_FORM = {
  report_title: 'Electrocardiogram (ECG)',
  result_date: format(new Date(), 'yyyy-MM-dd'),
  examination_type: 'ECG',
  ecg_no: '',
  findings: '',
  impression: '',
  is_normal: null as boolean | null,
}

function calcAge(birthdate: string) {
  if (!birthdate) return '—'
  return Math.floor((Date.now() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
}

export default function EcgReport() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null)
  const qc = useQueryClient()
  const { selectedPatient } = usePatient()
  const { guardEdit, ConfirmDialog: EditGuardDialog } = useEditGuard()

  const { data: ecgReports } = useQuery<any[]>({
    queryKey: ['ecg-reports', selectedPatient?.id],
    queryFn: () => apiClient.ecgReports.list(selectedPatient!.id),
    enabled: !!selectedPatient,
  })

  // Default to most recent visit on first load
  useEffect(() => {
    if (ecgReports && ecgReports.length > 0 && selectedVisitId === null) {
      const latest = ecgReports.reduce((a: any, b: any) =>
        (b.resultDate ?? '') > (a.resultDate ?? '') ? b : a
      )
      setSelectedVisitId(latest.id)
    }
  }, [ecgReports])

  // Load form data when selected visit changes
  useEffect(() => {
    if (selectedVisitId === null) {
      setForm({ ...EMPTY_FORM, result_date: format(new Date(), 'yyyy-MM-dd') })
      setActiveTemplate(null)
      setIsDirty(false)
      return
    }
    const r = ecgReports?.find((x: any) => x.id === selectedVisitId)
    if (r) {
      setForm({
        report_title: r.reportTitle ?? r.report_title ?? 'Electrocardiogram (ECG)',
        result_date: r.resultDate ?? r.result_date ?? format(new Date(), 'yyyy-MM-dd'),
        examination_type: r.examinationType ?? r.examination_type ?? 'ECG',
        ecg_no: r.ecgNo ?? r.ecg_no ?? '',
        findings: r.findings ?? '',
        impression: r.impression ?? '',
        is_normal: r.isNormal ?? r.is_normal ?? null,
      })
      setActiveTemplate(null)
      setIsDirty(false)
    }
  }, [selectedVisitId, ecgReports])

  // Reset when patient changes
  useEffect(() => {
    setSelectedVisitId(null)
  }, [selectedPatient?.id])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        reportTitle: form.report_title,
        resultDate: form.result_date,
        examinationType: form.examination_type,
        ecgNo: form.ecg_no,
        findings: form.findings,
        impression: form.impression,
        isNormal: form.is_normal,
      }
      if (selectedVisitId) {
        return apiClient.ecgReports.update(selectedPatient!.id, selectedVisitId, payload)
      }
      return apiClient.ecgReports.create(selectedPatient!.id, payload)
    },
    onSuccess: (saved: any) => {
      qc.invalidateQueries({ queryKey: ['ecg-reports', selectedPatient?.id] })
      toast({ title: 'ECG report saved', variant: 'success' })
      setIsDirty(false)
      if (!selectedVisitId && saved?.id) setSelectedVisitId(saved.id)
    },
  })

  const set = (k: string, v: any) => {
    setForm(f => ({ ...f, [k]: v }))
    setIsDirty(true)
  }

  const handleSave = useCallback(async () => {
    if (selectedVisitId) {
      const ok = await guardEdit({
        resultDate: form.result_date,
        patientId: selectedPatient!.id,
        patientName: `${selectedPatient!.last_name}, ${selectedPatient!.first_name}`,
        module: 'ECG',
      })
      if (!ok) return
    }
    saveMutation.mutate()
  }, [saveMutation, selectedVisitId, guardEdit, selectedPatient, form.result_date])

  useCtrlS(handleSave)
  useGlobalShortcuts({ onSave: handleSave })

  const handleAutoSave = useCallback(async () => {
    if (isDirty) await saveMutation.mutateAsync()
  }, [isDirty, saveMutation])

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    set('findings', template.findings)
    set('impression', template.impression)
    set('is_normal', template.isNormal)
    setActiveTemplate(template.label)
  }

  if (!selectedPatient) {
    return <NoPatientSelected icon={Zap} label="ECG" />
  }

  const visits = (ecgReports ?? []).map((r: any) => ({ id: r.id, resultDate: r.resultDate ?? r.result_date }))

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))] pb-24">
      <StickyPatientHeader patient={selectedPatient} module="ECG" />
      <div className="max-w-5xl mx-auto w-full px-4 py-6 space-y-5">
        <PageBreadcrumb
          patientName={`${selectedPatient.last_name}, ${selectedPatient.first_name}`}
          module="ECG"
        />

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[hsl(var(--primary))]" />
              <h2 className="text-lg font-bold">ECG Report</h2>
            </div>
            <AutoSaveIndicator isDirty={isDirty} onAutoSave={handleAutoSave} />
          </div>
          <div className="flex items-center gap-2">
            <VisitSelector visits={visits} selectedId={selectedVisitId} onSelect={setSelectedVisitId} />
            <PrintButton sections={PRINT_SECTIONS} />
          </div>
        </div>

        <SectionCard title="Patient Information" id="patient-info">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div><p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Name</p><p className="text-sm font-medium mt-1">{selectedPatient.last_name}, {selectedPatient.first_name}</p></div>
            <div><p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Company</p><p className="text-sm font-medium mt-1">{selectedPatient.employer || '—'}</p></div>
            <div><p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Age / Sex</p><p className="text-sm font-medium mt-1">{calcAge(selectedPatient.birthdate ?? '')} yrs / {selectedPatient.gender || '—'}</p></div>
            <FormField label="Result Date"><Input type="date" value={form.result_date} onChange={e => set('result_date', e.target.value)} /></FormField>
          </div>
        </SectionCard>

        <SectionCard title="ECG Details" id="ecg-details">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <FormField label="Report Title" className="sm:col-span-2"><Input value={form.report_title} onChange={e => set('report_title', e.target.value)} /></FormField>
            <FormField label="Examination Type"><Input value={form.examination_type} onChange={e => set('examination_type', e.target.value)} placeholder="e.g. 12-Lead ECG" /></FormField>
            <FormField label="ECG No.">
              <div className="flex items-center gap-2">
                <Input value={form.ecg_no} onChange={e => set('ecg_no', e.target.value)} placeholder="ECG-000000" />
                {!form.ecg_no && (
                  <Button variant="outline" size="sm" type="button"
                    onClick={() => set('ecg_no', `ECG-${format(new Date(), 'yyyyMMdd')}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`)}
                    className="shrink-0 text-xs">
                    Generate
                  </Button>
                )}
              </div>
            </FormField>
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

          <FormField label="ECG Findings" required className="mb-4" id="findings">
            <textarea value={form.findings} onChange={e => set('findings', e.target.value)} rows={5}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-y transition-all hover:border-[hsl(var(--primary)/0.5)] hover:shadow-md"
              placeholder="Describe ECG findings…" />
          </FormField>

          <FormField label="Impression" required className="mb-4">
            <textarea value={form.impression} onChange={e => set('impression', e.target.value)} rows={3}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-y transition-all hover:border-[hsl(var(--primary)/0.5)] hover:shadow-md"
              placeholder="Clinical impression…" />
          </FormField>

          <NormalToggle value={form.is_normal} onChange={v => set('is_normal', v)} name="ecg_normal" />
        </SectionCard>

        <SectionCard title="ECG Tracing">
          <FileUpload
            accept="image/*,.pdf"
            multiple={true}
            maxSize={20}
            maxFiles={5}
            onUpload={async (files) => {
              setUploadedImages(prev => [...prev, ...files])
              setIsDirty(true)
              toast({ title: `${files.length} tracing(s) attached`, variant: 'success' })
            }}
            onRemove={() => toast({ title: 'Tracing removed', variant: 'default' })}
            label="Attach ECG Tracing"
            hint="Drag and drop ECG tracing images here, or click to browse. Supports JPEG, PNG, and PDF files."
          />
          {uploadedImages.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                Attached ({uploadedImages.length})
              </p>
              <div className="flex flex-wrap gap-3">
                {uploadedImages.map((file, idx) => (
                  <div key={`${file.name}-${idx}`} className="relative group">
                    <div className="w-24 h-24 rounded-lg border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--muted))] flex items-center justify-center">
                      {file.type.startsWith('image/') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-[hsl(var(--muted-foreground))] text-center px-1">{file.name.split('.').pop()?.toUpperCase()}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => { setUploadedImages(prev => prev.filter((_, i) => i !== idx)); setIsDirty(true) }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[hsl(var(--destructive))] text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >×</button>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1 truncate w-24">{file.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      <FloatingActionBar onSave={handleSave} saving={saveMutation.isPending} />
      {EditGuardDialog}
    </div>
  )
}
