"use client"

import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import StickyPatientHeader from '@/components/StickyPatientHeader'
import UrinalysisTab from '@/components/laboratory/UrinalysisTab'
import SerologyTab from '@/components/laboratory/SerologyTab'
import HematologyTab from '@/components/laboratory/HematologyTab'
import HbA1cTab from '@/components/laboratory/HbA1cTab'
import FecalysisTab from '@/components/laboratory/FecalysisTab'
import Chem10Tab from '@/components/laboratory/Chem10Tab'
import BloodTypingTab from '@/components/laboratory/BloodTypingTab'
import { Button } from '@/components/ui/button'
import { FlaskConical, CheckCheck, Copy, ChevronLeft, ChevronRight, Eraser } from 'lucide-react'
import { format } from 'date-fns'
import { usePatient } from '@/lib/patient-context'
import { apiClient } from '@/lib/api-client'
import { toast } from '@/lib/use-toast'
import { useCtrlS } from '@/lib/use-ctrl-s'
import NoPatientSelected from '@/components/NoPatientSelected'
import { FloatingActionBar } from '@/components/ui/FloatingActionBar'
import { AutoSaveIndicator } from '@/components/ui/AutoSaveIndicator'
import { useTabShortcuts, useGlobalShortcuts } from '@/components/ui/KeyboardShortcuts'
import { TabCompletionBadge, ProgressIndicator } from '@/components/ui/ProgressIndicator'
import { PageBreadcrumb } from '@/components/ui/Breadcrumb'
import { PrintButton } from '@/components/ui/PrintButton'
import { cn } from '@/lib/utils'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { useEditGuard } from '@/lib/use-edit-guard'
import { VisitSelector } from '@/components/ui/VisitSelector'

const TAB_TO_REPORT_TYPE: Record<string, string> = {
  Urinalysis: 'urinalysis',
  Serology: 'serology',
  Hematology: 'hematology',
  HbA1c: 'hba1c',
  Fecalysis: 'fecalysis',
  Chem10: 'chem10',
  BloodTyping: 'blood-typing',
}

const TABS = [
  { id: 'Urinalysis', label: 'Urinalysis', shortcut: '1' },
  { id: 'Serology', label: 'Serology', shortcut: '2' },
  { id: 'Hematology', label: 'Hematology', shortcut: '3' },
  { id: 'HbA1c', label: 'HbA1c', shortcut: '4' },
  { id: 'Fecalysis', label: 'Fecalysis', shortcut: '5' },
  { id: 'Chem10', label: 'Chem 10', shortcut: '6' },
  { id: 'BloodTyping', label: 'Blood Typing', shortcut: '7' },
]

const today = format(new Date(), 'yyyy-MM-dd')

const ALL_NORMAL_VALUES: Record<string, any> = {
  Urinalysis: { result_date: today, color: 'Yellow', transparency: 'Clear', specific_gravity: '1.010', ph: '6.0', glucose: 'Negative', protein: 'Negative', wbc: '0–2', rbc: '0–2', epithelial: 'Few', mucus: 'None', bacteria: 'None', amorphous_urates: 'None', amorphous_phosphates: 'None', others: '', remark: '', is_normal: true },
  Serology: { result_date: today, rows: [{ test: 'HBsAg', specimen: 'Serum', result: 'Non-Reactive' }, { test: 'VDRL', specimen: 'Serum', result: 'Non-Reactive' }], is_normal: true },
  Hematology: { result_date: today, rbc: '5.0', hemoglobin: '140', hematocrit: '0.42', platelet: '250', wbc: '7.0', neutrophil: '60', lymphocyte: '30', monocyte: '5', eosinophil: '2', basophil: '0', others_diff: '', remark: '', is_normal: true },
  HbA1c: { result_date: today, hba1c: '5.2', is_normal: true },
  Fecalysis: { result_date: today, color: 'Brown', consistency: 'Formed', wbc: '0–2', rbc: '0–2', fat_globules: 'None', bacteria: 'None', ova: 'none', remark: '', is_normal: true },
  Chem10: { result_date: today, fbs: '5.0', bun: '5.0', uric_acid: '310', creatinine: '88', cholesterol: '4.5', triglyceride: '1.2', hdl: '1.3', ldl: '2.5', vldl: '0.6', sgpt: '25', sgot: '22', is_normal: true },
  BloodTyping: { result_date: today, rows: [{ test: 'ABO Typing', specimen: 'EDTA Blood', result: 'O' }, { test: 'Rh Typing', specimen: 'EDTA Blood', result: 'Rh Positive (+)' }], is_normal: true },
}

const PRINT_SECTIONS = TABS.map(t => ({ id: t.id, label: t.label, defaultChecked: true }))

export default function LaboratoryReport() {
  const [activeTab, setActiveTab] = useState('Urinalysis')
  const [tabData, setTabData] = useState<any>({})
  const [isDirty, setIsDirty] = useState(false)
  const [selectedVisitDate, setSelectedVisitDate] = useState<string | null>(null) // null = new visit
  const qc = useQueryClient()
  const { selectedPatient } = usePatient()
  const { confirm, ConfirmDialog } = useConfirm()
  const { guardEdit, ConfirmDialog: EditGuardDialog } = useEditGuard()

  const { data: labReports } = useQuery<any[]>({
    queryKey: ['lab-reports', selectedPatient?.id],
    queryFn: () => apiClient.labReports.list(selectedPatient!.id),
    enabled: !!selectedPatient,
  })

  // Reset when patient changes
  useEffect(() => {
    setSelectedVisitDate(null)
    setTabData({})
  }, [selectedPatient?.id])

  // Default to most recent visit date on first load
  useEffect(() => {
    if (labReports && labReports.length > 0 && selectedVisitDate === null) {
      const dates = [...new Set(labReports.map((r: any) => r.resultDate ?? r.result_date))].sort().reverse()
      setSelectedVisitDate(dates[0] as string)
    }
  }, [labReports])

  const setData = (tab: string, val: any) => {
    setTabData((prev: any) => ({ ...prev, [tab]: val }))
    setIsDirty(true)
  }

  const upsertTab = async (tabId: string, payload: any) => {
    // If editing an existing visit date, update the matching report; otherwise create new
    const existing = selectedVisitDate
      ? labReports?.find((r: any) => r.reportType === TAB_TO_REPORT_TYPE[tabId] && (r.resultDate ?? r.result_date) === selectedVisitDate)
      : null
    if (existing) {
      return apiClient.labReports.update(selectedPatient!.id, existing.id, payload)
    }
    return apiClient.labReports.create(selectedPatient!.id, payload)
  }

  const buildPayload = (tabId: string, tabPayload: any) => {
    const { result_date, is_normal, remark, ...rest } = tabPayload
    return {
      reportType: TAB_TO_REPORT_TYPE[tabId],
      resultDate: result_date ?? today,
      isNormal: is_normal ?? null,
      remark: remark ?? '',
      data: rest,
    }
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const tabPayload = tabData[activeTab] ?? {}
      return upsertTab(activeTab, buildPayload(activeTab, tabPayload))
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lab-reports', selectedPatient?.id] })
      toast({ title: `${activeTab} saved`, variant: 'success' })
      setTabData((prev: any) => { const next = { ...prev }; delete next[activeTab]; return next })
      setIsDirty(false)
    },
  })

  const saveAllMutation = useMutation({
    mutationFn: async (dataToSave: Record<string, any>) => {
      const entries = Object.entries(dataToSave).filter(([tabId]) => TAB_TO_REPORT_TYPE[tabId])
      await Promise.all(entries.map(([tabId, tabPayload]) =>
        upsertTab(tabId, buildPayload(tabId, tabPayload))
      ))
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lab-reports', selectedPatient?.id] })
      toast({ title: 'All tabs saved', variant: 'success' })
      setIsDirty(false)
    },
  })

  const patientApiData = (labReports && selectedVisitDate)
    ? Object.fromEntries(
        labReports
          .filter((r: any) => (r.resultDate ?? r.result_date) === selectedVisitDate)
          .map((r: any) => {
            const tabKey = Object.entries(TAB_TO_REPORT_TYPE).find(([, v]) => v === r.reportType)?.[0] ?? r.reportType
            return [tabKey, { ...r.data, result_date: r.resultDate, is_normal: r.isNormal, remark: r.remark }]
          })
      )
    : {}
  const current = tabData[activeTab] ?? patientApiData[activeTab] ?? { result_date: today }

  const handleSave = useCallback(async () => {
    if (selectedVisitDate) {
      const ok = await guardEdit({
        resultDate: selectedVisitDate,
        patientId: selectedPatient!.id,
        patientName: `${selectedPatient!.last_name}, ${selectedPatient!.first_name}`,
        module: 'Laboratory',
        detail: activeTab,
      })
      if (!ok) return
    }
    saveMutation.mutate()
  }, [saveMutation, selectedVisitDate, guardEdit, selectedPatient, activeTab])

  useCtrlS(handleSave)

  // Tab keyboard shortcuts (Alt+1 through Alt+7)
  useTabShortcuts(TABS, activeTab, setActiveTab)

  // Global shortcuts
  useGlobalShortcuts({
    onSave: handleSave,
    onNextTab: () => {
      const currentIndex = TABS.findIndex(t => t.id === activeTab)
      if (currentIndex < TABS.length - 1) {
        setActiveTab(TABS[currentIndex + 1].id)
      }
    },
    onPrevTab: () => {
      const currentIndex = TABS.findIndex(t => t.id === activeTab)
      if (currentIndex > 0) {
        setActiveTab(TABS[currentIndex - 1].id)
      }
    }
  })

  // Check if tab has data
  function tabHasData(tabId: string) {
    const d = tabData[tabId] ?? patientApiData[tabId]
    return !!d && Object.keys(d).length > 1
  }

  function tabIsComplete(tabId: string) {
    const d = tabData[tabId] ?? patientApiData[tabId]
    return d?.is_normal !== undefined && d?.is_normal !== null
  }

  function fillAllNormal() {
    setTabData(ALL_NORMAL_VALUES)
    setIsDirty(true)
    saveAllMutation.mutate(ALL_NORMAL_VALUES)
  }

  function clearAllFields() {
    confirm({
      title: 'Clear All Fields',
      message: 'This will clear data from all 7 lab tabs. Are you sure?',
      confirmLabel: 'Clear All',
      cancelLabel: 'Cancel',
      variant: 'warning',
    }).then((confirmed) => {
      if (confirmed) {
        setTabData({})
        setIsDirty(true)
        toast({ title: 'All fields cleared', variant: 'default' })
      }
    })
  }

  function copyFromPrevious() {
    if (patientApiData[activeTab]) {
      setData(activeTab, { ...patientApiData[activeTab], result_date: today })
      toast({ title: 'Copied from previous visit', variant: 'success' })
    } else {
      toast({ title: 'No previous data found', variant: 'default' })
    }
  }

  const handleAutoSave = useCallback(async () => {
    if (isDirty) {
      const dirtyTabs = Object.keys(tabData)
      if (dirtyTabs.length > 1) {
        await saveAllMutation.mutateAsync(tabData)
      } else {
        await saveMutation.mutateAsync()
      }
    }
  }, [isDirty, tabData, saveMutation, saveAllMutation])

  const goToNextTab = () => {
    const currentIndex = TABS.findIndex(t => t.id === activeTab)
    if (currentIndex < TABS.length - 1) {
      setActiveTab(TABS[currentIndex + 1].id)
    }
  }

  const goToPrevTab = () => {
    const currentIndex = TABS.findIndex(t => t.id === activeTab)
    if (currentIndex > 0) {
      setActiveTab(TABS[currentIndex - 1].id)
    }
  }

  const currentTabIndex = TABS.findIndex(t => t.id === activeTab)
  const hasNextTab = currentTabIndex < TABS.length - 1
  const hasPrevTab = currentTabIndex > 0

  // Calculate progress
  const completedTabs = TABS.filter(t => tabIsComplete(t.id)).length

  if (!selectedPatient) {
    return <NoPatientSelected icon={FlaskConical} label="Laboratory" />
  }

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))] pb-24">
      <StickyPatientHeader patient={selectedPatient} module="Laboratory" />

      <div className="max-w-5xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Breadcrumb */}
        <PageBreadcrumb
          patientName={`${selectedPatient.last_name}, ${selectedPatient.first_name}`}
          module="Laboratory"
          section={activeTab}
        />

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-[hsl(var(--primary))]" />
              <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">Laboratory Report</h2>
            </div>
            <AutoSaveIndicator isDirty={isDirty} onAutoSave={handleAutoSave} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="hidden sm:inline text-xs text-[hsl(var(--muted-foreground))]">Alt+1-7 tabs</span>
            {(() => {
              const dates = [...new Set((labReports ?? []).map((r: any) => r.resultDate ?? r.result_date))]
                .filter(Boolean)
                .sort()
                .reverse()
              const visits = dates.map((d: any) => ({ id: d, resultDate: d }))
              return (
                <VisitSelector
                  visits={visits}
                  selectedId={selectedVisitDate}
                  onSelect={(id) => {
                    setSelectedVisitDate(id)
                    setTabData({})
                  }}
                />
              )
            })()}
            <Button variant="outline" size="sm" onClick={copyFromPrevious} title={`Copy ${activeTab} from previous visit`}>
              <Copy className="w-4 h-4 mr-1.5" /> <span className="hidden sm:inline">Copy Prev</span> {activeTab}
            </Button>
            <PrintButton sections={PRINT_SECTIONS} />
          </div>
        </div>

        {/* Progress indicator */}
        <ProgressIndicator
          completed={completedTabs}
          total={TABS.length}
          label="Lab Tests Progress"
        />

        <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] shadow-sm overflow-hidden">
          {/* Tab navigation */}
          <div className="flex items-center bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
            <button
              onClick={goToPrevTab}
              disabled={!hasPrevTab}
              className="p-3 hover:bg-[hsl(var(--accent)/0.5)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Previous tab (Alt+←)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex-1 relative">
              {/* Scroll fade indicators */}
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[hsl(var(--muted))] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[hsl(var(--muted))] to-transparent z-10 pointer-events-none" />
              <div className="flex overflow-x-auto scrollbar-hide">
              {TABS.map((t, index) => {
                const hasData = tabHasData(t.id)
                const isComplete = tabIsComplete(t.id)
                const isUnsaved = !!tabData[t.id]
                return (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className={cn(
                      "relative px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer flex items-center gap-1",
                      activeTab === t.id
                        ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))] bg-[hsl(var(--card))]'
                        : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent)/0.3)]'
                    )}>
                    <span className="hidden sm:inline text-[10px] text-[hsl(var(--muted-foreground))] mr-1">
                      {index + 1}
                    </span>
                    {t.label}
                    <TabCompletionBadge completed={isComplete} hasData={hasData} unsaved={isUnsaved} />
                  </button>
                )
              })}
              </div>
            </div>

            <button
              onClick={goToNextTab}
              disabled={!hasNextTab}
              className="p-3 hover:bg-[hsl(var(--accent)/0.5)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Next tab (Alt+→)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            {activeTab === 'Urinalysis' && <UrinalysisTab data={current} onChange={v => setData('Urinalysis', v)} />}
            {activeTab === 'Serology' && <SerologyTab data={current} onChange={v => setData('Serology', v)} />}
            {activeTab === 'Hematology' && <HematologyTab data={current} onChange={v => setData('Hematology', v)} />}
            {activeTab === 'HbA1c' && <HbA1cTab data={current} onChange={v => setData('HbA1c', v)} />}
            {activeTab === 'Fecalysis' && <FecalysisTab data={current} onChange={v => setData('Fecalysis', v)} />}
            {activeTab === 'Chem10' && <Chem10Tab data={current} onChange={v => setData('Chem10', v)} />}
            {activeTab === 'BloodTyping' && <BloodTypingTab data={current} onChange={v => setData('BloodTyping', v)} />}
          </div>
        </div>
      </div>

      {/* Floating action bar */}
      <FloatingActionBar
        onSave={handleSave}
        saving={saveMutation.isPending || saveAllMutation.isPending}
        hasNext={hasNextTab}
        nextLabel={hasNextTab ? TABS[currentTabIndex + 1].label : undefined}
        onNext={goToNextTab}
        onSaveAll={Object.keys(tabData).length > 1 ? () => saveAllMutation.mutate(tabData) : undefined}
      />
      {ConfirmDialog}
      {EditGuardDialog}
    </div>
  )
}
