"use client"

import { SectionCard } from '@/components/ui/FormField'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const LEFT_TESTS = ['Hematology', 'Urinalysis', 'Fecalysis', 'Chest X-Ray', 'ECG']
const RIGHT_TESTS = ['Psychological Test', 'HBsAg', 'Pregnancy Test', 'Blood Type', 'Drug Test']

const NORMAL_VALUES = {
  tests: {
    'Hematology': { result: 'Normal', status: 'Normal' },
    'Urinalysis': { result: 'Normal', status: 'Normal' },
    'Fecalysis': { result: 'Normal', status: 'Normal' },
    'Chest X-Ray': { result: 'Normal', status: 'Normal' },
    'ECG': { result: 'Normal Sinus Rhythm', status: 'Normal' },
    'HBsAg': { result: 'Non-Reactive', status: 'Normal' },
    'Drug Test': { result: 'Negative', status: 'Normal' },
  },
}

function TestRow({ label, data, onChange }: any) {
  const isNormal = data?.status === 'Normal'
  const isAbnormal = data?.status === 'Abnormal'
  return (
    <div className="grid grid-cols-[1fr_auto_auto] gap-2 py-2 px-2 rounded-lg border-b border-[hsl(var(--border)/0.4)] last:border-0 hover:bg-[hsl(var(--accent)/0.3)] transition-colors items-center">
      <div>
        <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1">{label}</p>
        <Input value={data?.result || ''} onChange={e => onChange({ ...data, result: e.target.value })} placeholder="Result / Findings" className="h-8 text-sm" />
      </div>
      <button
        type="button"
        onClick={() => onChange({ ...data, status: isNormal ? '' : 'Normal' })}
        className={cn(
          'text-xs px-2 py-1 rounded-md border font-semibold transition-all whitespace-nowrap cursor-pointer',
          isNormal
            ? 'bg-[hsl(var(--success))] border-[hsl(var(--success))] text-white'
            : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--success)/0.5)] hover:text-[hsl(var(--success))]'
        )}
      >N</button>
      <button
        type="button"
        onClick={() => onChange({ ...data, status: isAbnormal ? '' : 'Abnormal' })}
        className={cn(
          'text-xs px-2 py-1 rounded-md border font-semibold transition-all whitespace-nowrap cursor-pointer',
          isAbnormal
            ? 'bg-[hsl(var(--destructive))] border-[hsl(var(--destructive))] text-white'
            : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--destructive)/0.5)] hover:text-[hsl(var(--destructive))]'
        )}
      >A</button>
    </div>
  )
}

export default function LabDiagnosticSummary({ data, onChange }: { data: any; onChange: (v: any) => void }) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v })
  const tests = data.tests || {}
  const setTest = (t: string, v: any) => set('tests', { ...tests, [t]: v })

  return (
    <SectionCard title="Section III — Lab & Diagnostic Summary">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-[hsl(var(--muted-foreground))]">N = Normal · A = Abnormal</p>
        <Button variant="outline" size="sm" onClick={() => onChange({ ...NORMAL_VALUES })}
          className="border-[hsl(var(--success)/0.5)] text-[hsl(var(--success))] hover:bg-[hsl(var(--success-muted))] hover:text-[hsl(var(--success))]">
          <CheckCheck className="w-3.5 h-3.5 mr-1" /> Normal
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-semibold text-[hsl(var(--primary))] uppercase tracking-wide mb-3">Laboratory Tests</p>
          {LEFT_TESTS.map(t => <TestRow key={t} label={t} data={tests[t]} onChange={(v: any) => setTest(t, v)} />)}
        </div>
        <div>
          <p className="text-xs font-semibold text-[hsl(var(--primary))] uppercase tracking-wide mb-3">Diagnostic Tests</p>
          {RIGHT_TESTS.map(t => <TestRow key={t} label={t} data={tests[t]} onChange={(v: any) => setTest(t, v)} />)}
        </div>
      </div>
    </SectionCard>
  )
}
