"use client"

import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import StickyPatientHeader from '@/components/StickyPatientHeader'
import UrinalysisTab from '@/components/laboratory/UrinalysisTab'
import SerologyTab from '@/components/laboratory/SerologyTab'
import HematologyTab from '@/components/laboratory/HematologyTab'
import HbA1cTab from '@/components/laboratory/HbA1cTab'
import FecalysisTab from '@/components/laboratory/FecalysisTab'
import Chem10Tab from '@/components/laboratory/Chem10Tab'
import BloodTypingTab from '@/components/laboratory/BloodTypingTab'
import { Button } from '@/components/ui/button'
import { Save, FlaskConical, CheckCheck, Copy, ChevronLeft, ChevronRight, Eraser } from 'lucide-react'
import { format } from 'date-fns'
import { mockLabData } from '@/lib/mockData'
import { usePatient } from '@/lib/patient-context'
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
  const qc = useQueryClient()
  const { selectedPatient } = usePatient()

  const saveMutation = useMutation({
    mutationFn: async () => tabData[activeTab],
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lab-reports', selectedPatient?.id] })
      toast({ title: `${activeTab} saved`, variant: 'success' })
      setIsDirty(false)
    },
  })

  const setData = (tab: string, val: any) => {
    setTabData((prev: any) => ({ ...prev, [tab]: val }))
    setIsDirty(true)
  }
  
  const patientMockData = selectedPatient ? (mockLabData[selectedPatient.id] ?? {}) : {}
  const current = tabData[activeTab] ?? patientMockData[activeTab] ?? { result_date: today }

  const handleSave = useCallback(() => {
    saveMutation.mutate()
  }, [saveMutation])

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
    const d = tabData[tabId] ?? patientMockData[tabId]
    return !!d && Object.keys(d).length > 1
  }

  // Check if tab is complete (has is_normal set)
  function tabIsComplete(tabId: string) {
    const d = tabData[tabId] ?? patientMockData[tabId]
    return d?.is_normal !== undefined && d?.is_normal !== null
  }

  function fillAllNormal() {
    setTabData(ALL_NORMAL_VALUES)
    setIsDirty(true)
    toast({ title: 'All tabs filled with normal values', variant: 'success' })
  }

  function clearAllFields() {
    setTabData({})
    setIsDirty(true)
    toast({ title: 'All fields cleared', variant: 'default' })
  }

  function copyFromPrevious() {
    if (patientMockData[activeTab]) {
      setData(activeTab, { ...patientMockData[activeTab], result_date: today })
      toast({ title: 'Copied from previous visit', variant: 'success' })
    } else {
      toast({ title: 'No previous data found', variant: 'default' })
    }
  }

  const handleAutoSave = useCallback(async () => {
    if (isDirty) {
      await saveMutation.mutateAsync()
    }
  }, [isDirty, saveMutation])

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
            <Button variant="outline" size="sm" onClick={copyFromPrevious} title="Copy from previous visit">
              <Copy className="w-4 h-4 mr-1.5" /> Previous
            </Button>
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
            
            <div className="flex-1 flex overflow-x-auto">
              {TABS.map((t, index) => {
                const hasData = tabHasData(t.id)
                const isComplete = tabIsComplete(t.id)
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
                    <TabCompletionBadge completed={isComplete} hasData={hasData} />
                  </button>
                )
              })}
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
        saving={saveMutation.isPending}
        hasNext={hasNextTab}
        nextLabel={hasNextTab ? TABS[currentTabIndex + 1].label : undefined}
        onNext={goToNextTab}
      />
    </div>
  )
}
