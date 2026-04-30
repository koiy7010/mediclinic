"use client"

import { useState, useEffect, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import StickyPatientHeader from '@/components/StickyPatientHeader'
import { SectionCard, FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioTower } from 'lucide-react'
import { format } from 'date-fns'
import { mockRadiologyReports } from '@/lib/mockData'
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
import { FileUpload } from '@/components/ui/FileUpload'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { cn } from '@/lib/utils'

const TEMPLATES = [
  { label: 'Normal Chest PA', findings: 'The lungs are clear. No infiltrates, consolidation, or pleural effusion noted. The heart is not enlarged. The mediastinum is within normal limits. The bony thorax is intact.', impression: 'Normal chest PA view.', isNormal: true },
  { label: 'Mild Cardiomegaly', findings: 'The heart appears mildly enlarged. The pulmonary vascularity is within normal limits. No pleural effusion. Lungs are clear.', impression: 'Mild cardiomegaly.', isNormal: false },
  { label: 'PTB Active', findings: 'There are patchy infiltrates noted in the upper lobe of the right lung. The left lung is clear. No pleural effusion.', impression: 'Findings may suggest active pulmonary tuberculosis. Correlation with clinical findings recommended.', isNormal: false },
  { label: 'PTB Minimal', findings: 'Minimal infiltrates noted in the right upper lobe. Left lung is clear. Heart size is normal. Bony thorax intact.', impression: 'Findings suggest minimal PTB. Please correlate clinically.', isNormal: false },
]

const PRINT_SECTIONS = [
  { id: 'patient-info', label: 'Patient Information', defaultChecked: true },
  { id: 'xray-details', label: 'X-Ray Details', defaultChecked: true },
  { id: 'findings', label: 'Findings & Impression', defaultChecked: true },
]

function calcAge(birthdate: string) {
  if (!birthdate) return '—'
  return Math.floor((Date.now() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
}

export default function XRayReport() {
  const [form, setForm] = useState({
    report_title: 'Chest PA (Postero-Anterior)',
    result_date: format(new Date(), 'yyyy-MM-dd'),
    examination_type: 'X-Ray',
    xray_no: '',
    findings: '',
    impression: '',
    is_normal: null as boolean | null,
  })
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const qc = useQueryClient()
  const { selectedPatient } = usePatient()
  const { confirm, ConfirmDialog } = useConfirm()

  useEffect(() => {
    if (selectedPatient) {
      const reports = mockRadiologyReports[selectedPatient.id]
      if (reports && reports.length > 0) {
        const r = reports[0]
        setForm({ report_title: r.report_title, result_date: r.result_date, examination_type: r.examination_type, xray_no: r.xray_no, findings: r.findings, impression: r.impression, is_normal: r.is_normal })
        setIsDirty(false)
      }
    }
  }, [selectedPatient])

  const saveMutation = useMutation({
    mutationFn: async () => form,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['radiology'] })
      toast({ title: 'X-Ray report saved', variant: 'success' })
      setIsDirty(false)
    },
  })

  const set = (k: string, v: any) => {
    setForm(f => ({ ...f, [k]: v }))
    setIsDirty(true)
  }

  const handleSave = useCallback(async () => {
    // Validate required fields
    if (!form.findings || !form.impression) {
      const proceed = await confirm({
        title: 'Missing Required Fields',
        message: 'Findings and Impression are required. Do you want to save anyway?',
        confirmLabel: 'Save Anyway',
        cancelLabel: 'Go Back',
        variant: 'warning',
      })
      if (!proceed) return
    }
    saveMutation.mutate()
  }, [saveMutation, form, confirm])

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

  const handleImageUpload = async (files: File[]) => {
    setUploadedImages(prev => [...prev, ...files])
    setIsDirty(true)
    toast({ title: `${files.length} image(s) attached`, variant: 'success' })
  }

  const handleImageRemove = (fileId: string) => {
    // In a real app, this would remove from storage
    toast({ title: 'Image removed', variant: 'default' })
  }

  if (!selectedPatient) {
    return <NoPatientSelected icon={RadioTower} label="X-Ray" />
  }

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))] pb-24">
      <StickyPatientHeader patient={selectedPatient} module="X-Ray" />
      <div className="max-w-5xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Breadcrumb */}
        <PageBreadcrumb
          patientName={`${selectedPatient.last_name}, ${selectedPatient.first_name}`}
          module="X-Ray"
        />

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <RadioTower className="w-5 h-5 text-[hsl(var(--primary))]" />
              <h2 className="text-lg font-bold">X-Ray Report</h2>
            </div>
            <AutoSaveIndicator isDirty={isDirty} onAutoSave={handleAutoSave} />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-[hsl(var(--muted-foreground))]">Ctrl+S to save</span>
            <PrintButton sections={PRINT_SECTIONS} />
          </div>
        </div>

        <div className="bg-[hsl(var(--primary))] rounded-lg px-4 py-2.5 flex items-center justify-center">
          <h2 className="text-base font-bold text-[hsl(var(--primary-foreground))]">{form.report_title}</h2>
        </div>

        <SectionCard title="Patient Information" id="patient-info">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div><p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Name</p><p className="text-sm font-medium mt-1">{selectedPatient.last_name}, {selectedPatient.first_name}</p></div>
            <div><p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Company</p><p className="text-sm font-medium mt-1">{selectedPatient.employer || '—'}</p></div>
            <div><p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Age / Sex</p><p className="text-sm font-medium mt-1">{calcAge(selectedPatient.birthdate ?? '')} yrs / {selectedPatient.gender || '—'}</p></div>
            <FormField label="Result Date"><Input type="date" value={form.result_date} onChange={e => set('result_date', e.target.value)} /></FormField>
          </div>
        </SectionCard>

        <SectionCard title="X-Ray Details" id="xray-details">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <FormField label="Report Title" className="sm:col-span-2"><Input value={form.report_title} onChange={e => set('report_title', e.target.value)} /></FormField>
            <FormField label="Examination Type"><Input value={form.examination_type} onChange={e => set('examination_type', e.target.value)} placeholder="e.g. Chest PA" /></FormField>
            <FormField label="X-Ray No."><Input value={form.xray_no} onChange={e => set('xray_no', e.target.value)} placeholder="XR-000000" /></FormField>
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

          <FormField label="Radiology Findings" required className="mb-4" id="findings">
            <textarea value={form.findings} onChange={e => set('findings', e.target.value)} rows={5}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-y transition-all hover:border-[hsl(var(--primary)/0.5)] hover:shadow-md"
              placeholder="Describe the radiology findings…" />
          </FormField>

          <FormField label="Impression" required className="mb-4">
            <textarea value={form.impression} onChange={e => set('impression', e.target.value)} rows={3}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-y transition-all hover:border-[hsl(var(--primary)/0.5)] hover:shadow-md"
              placeholder="Clinical impression…" />
          </FormField>

          <NormalToggle value={form.is_normal} onChange={v => set('is_normal', v)} name="xray_normal" />
        </SectionCard>

        {/* Image Attachments */}
        <SectionCard title="X-Ray Images">
          <FileUpload
            accept="image/*,.dcm"
            multiple={true}
            maxSize={20}
            maxFiles={5}
            onUpload={handleImageUpload}
            onRemove={handleImageRemove}
            label="Attach X-Ray Images"
            hint="Drag and drop X-ray images here, or click to browse. Supports JPEG, PNG, and DICOM files."
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
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-[hsl(var(--muted-foreground))] text-center px-1">{file.name.split('.').pop()?.toUpperCase()}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedImages(prev => prev.filter((_, i) => i !== idx))
                        setIsDirty(true)
                      }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[hsl(var(--destructive))] text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      ×
                    </button>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1 truncate w-24">{file.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">
            Note: For DICOM files, a specialized viewer may be required for full functionality.
          </p>
        </SectionCard>
      </div>

      {/* Floating action bar */}
      <FloatingActionBar
        onSave={handleSave}
        saving={saveMutation.isPending}
      />
      
      {/* Confirm dialog */}
      {ConfirmDialog}
    </div>
  )
}
