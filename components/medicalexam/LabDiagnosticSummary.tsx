"use client"

import { SectionCard, FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/input'

const LEFT_TESTS = ['Hematology', 'Urinalysis', 'Fecalysis', 'Chest X-Ray', 'ECG']
const RIGHT_TESTS = ['Psychological Test', 'HBsAg', 'Pregnancy Test', 'Blood Type', 'Drug Test']

function TestRow({ label, data, onChange }: any) {
  return (
    <div className="grid grid-cols-2 gap-3 py-2 px-2 rounded-lg border-b border-[hsl(var(--border)/0.4)] last:border-0 hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
      <div>
        <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1">{label}</p>
        <Input value={data?.result || ''} onChange={e => onChange({ ...data, result: e.target.value })} placeholder="Result" className="h-8 text-sm" />
      </div>
      <div>
        <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1">Findings</p>
        <Input value={data?.findings || ''} onChange={e => onChange({ ...data, findings: e.target.value })} placeholder="Findings" className="h-8 text-sm" />
      </div>
    </div>
  )
}

export default function LabDiagnosticSummary({ data, onChange }: { data: any; onChange: (v: any) => void }) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v })
  const tests = data.tests || {}
  const setTest = (t: string, v: any) => set('tests', { ...tests, [t]: v })

  return (
    <SectionCard title="Section III — Lab & Diagnostic Summary">
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
