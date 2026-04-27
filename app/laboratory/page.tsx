"use client"

import { useState } from 'react'
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
import { Save, FlaskConical, CheckCheck } from 'lucide-react'
import { format } from 'date-fns'
import { mockLabData } from '@/lib/mockData'
import { usePatient } from '@/lib/patient-context'
import { toast } from '@/lib/use-toast'
import { useCtrlS } from '@/lib/use-ctrl-s'
import NoPatientSelected from '@/components/NoPatientSelected'

const TABS = [
  { id: 'Urinalysis', label: 'Urinalysis' },
  { id: 'Serology', label: 'Serology' },
  { id: 'Hematology', label: 'Hematology' },
  { id: 'HbA1c', label: 'HbA1c' },
  { id: 'Fecalysis', label: 'Fecalysis' },
  { id: 'Chem10', label: 'Chem 10' },
  { id: 'BloodTyping', label: 'Blood Typing' },
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

export default function LaboratoryReport() {
  const [activeTab, setActiveTab] = useState('Urinalysis')
  const [tabData, setTabData] = useState<any>({})
  const qc = useQueryClient()
  const { selectedPatient } = usePatient()

  const saveMutation = useMutation({
    mutationFn: async () => tabData[activeTab],
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lab-reports', selectedPatient?.id] })
      toast({ title: `${activeTab} saved`, variant: 'success' })
    },
  })

  const today = format(new Date(), 'yyyy-MM-dd')
  const setData = (tab: string, val: any) => setTabData((prev: any) => ({ ...prev, [tab]: val }))
  const patientMockData = selectedPatient ? (mockLabData[selectedPatient.id] ?? {}) : {}
  const current = tabData[activeTab] ?? patientMockData[activeTab] ?? { result_date: today }

  useCtrlS(() => saveMutation.mutate())

  // A tab has data if it has been touched or has mock data
  function tabHasData(tabId: string) {
    const d = tabData[tabId] ?? patientMockData[tabId]
    return !!d && Object.keys(d).length > 1
  }

  function fillAllNormal() {
    setTabData(ALL_NORMAL_VALUES)
    toast({ title: 'All tabs filled with normal values', variant: 'success' })
  }

  if (!selectedPatient) {
    return <NoPatientSelected icon={FlaskConical} label="Laboratory" />
  }

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))]">
      <StickyPatientHeader patient={selectedPatient} module="Laboratory" />

      <div className="max-w-5xl mx-auto w-full px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-[hsl(var(--primary))]" />
            <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">Laboratory Report</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-[hsl(var(--muted-foreground))]">Ctrl+S to save</span>
            <Button variant="outline" size="sm" onClick={fillAllNormal}
              className="border-[hsl(var(--success)/0.5)] text-[hsl(var(--success))] hover:bg-[hsl(var(--success-muted))] hover:text-[hsl(var(--success))]">
              <CheckCheck className="w-4 h-4 mr-1.5" /> All Normal
            </Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? 'Saving…' : `Save ${activeTab}`}
            </Button>
          </div>
        </div>

        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-sm overflow-hidden">
          <div className="flex overflow-x-auto border-b border-[hsl(var(--border))]">
            {TABS.map(t => {
              const hasData = tabHasData(t.id)
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                    activeTab === t.id
                      ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))] bg-[hsl(var(--accent)/0.3)]'
                      : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.3)]'
                  }`}>
                  {t.label}
                  {hasData && (
                    <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-[hsl(var(--success))] align-middle" />
                  )}
                </button>
              )
            })}
          </div>
          <div className="p-5">
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
    </div>
  )
}
