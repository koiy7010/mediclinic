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
import { Save, FlaskConical, Search } from 'lucide-react'
import { format } from 'date-fns'
import { mockLabData } from '@/lib/mockData'
import { usePatient } from '@/lib/patient-context'
import { useSearch } from '@/lib/search-context'

const TABS = [
  { id: 'Urinalysis', label: 'Urinalysis' },
  { id: 'Serology', label: 'Serology' },
  { id: 'Hematology', label: 'Hematology' },
  { id: 'HbA1c', label: 'HbA1c' },
  { id: 'Fecalysis', label: 'Fecalysis' },
  { id: 'Chem10', label: 'Chem 10' },
  { id: 'BloodTyping', label: 'Blood Typing' },
]

export default function LaboratoryReport() {
  const [activeTab, setActiveTab] = useState('Urinalysis')
  const [tabData, setTabData] = useState<any>({})
  const qc = useQueryClient()
  const { selectedPatient } = usePatient()
  const { setOpen } = useSearch()

  const saveMutation = useMutation({
    mutationFn: async () => tabData[activeTab],
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lab-reports', selectedPatient?.id] }),
  })

  const today = format(new Date(), 'yyyy-MM-dd')
  const setData = (tab: string, val: any) => setTabData((prev: any) => ({ ...prev, [tab]: val }))
  const patientMockData = selectedPatient ? (mockLabData[selectedPatient.id] ?? {}) : {}
  const current = tabData[activeTab] ?? patientMockData[activeTab] ?? { result_date: today }

  if (!selectedPatient) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--background))] gap-4 px-4">
        <div className="w-14 h-14 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
          <FlaskConical className="w-7 h-7 text-[hsl(var(--primary))]" />
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
            <FlaskConical className="w-5 h-5 text-[hsl(var(--primary))]" />
            <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">Laboratory Report</h2>
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? 'Saving…' : `Save ${activeTab}`}
          </Button>
        </div>

        <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-sm overflow-hidden">
          <div className="flex overflow-x-auto border-b border-[hsl(var(--border))]">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === t.id
                    ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))] bg-[hsl(var(--accent)/0.3)]'
                    : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.3)]'
                }`}>
                {t.label}
              </button>
            ))}
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
