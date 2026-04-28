"use client"

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCheck, Eraser } from 'lucide-react'
import { cn } from '@/lib/utils'

const ALL_TESTS = [
  { label: 'Hematology', group: 'Laboratory' },
  { label: 'Urinalysis', group: 'Laboratory' },
  { label: 'Fecalysis', group: 'Laboratory' },
  { label: 'Chest X-Ray', group: 'Laboratory' },
  { label: 'ECG', group: 'Laboratory' },
  { label: 'Psychological Test', group: 'Diagnostic' },
  { label: 'HBsAg', group: 'Diagnostic' },
  { label: 'Pregnancy Test', group: 'Diagnostic' },
  { label: 'Blood Type', group: 'Diagnostic' },
  { label: 'Drug Test', group: 'Diagnostic' },
]

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

export default function LabDiagnosticSummary({ data, onChange }: { data: any; onChange: (v: any) => void }) {
  const tests = data.tests || {}
  const setTest = (t: string, v: any) => onChange({ ...data, tests: { ...tests, [t]: v } })

  const labTests = ALL_TESTS.filter(t => t.group === 'Laboratory')
  const diagTests = ALL_TESTS.filter(t => t.group === 'Diagnostic')

  return (
    <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
        <h3 className="text-sm font-semibold text-[hsl(var(--primary))]">Section III — Lab & Diagnostic Summary</h3>
        <div className="flex items-center rounded-lg border border-[hsl(var(--border))] overflow-hidden">
          <Button variant="ghost" size="sm" onClick={() => onChange({ ...NORMAL_VALUES })}
            className="rounded-none border-r border-[hsl(var(--border))] text-[hsl(var(--success))] hover:bg-[hsl(var(--success-muted))] hover:text-[hsl(var(--success))]">
            <CheckCheck className="w-3.5 h-3.5 mr-1" /> Normal
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onChange({})}
            className="rounded-none text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]">
            <Eraser className="w-3.5 h-3.5 mr-1" /> Clear
          </Button>
        </div>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
            <th className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide w-[35%]">Test Name</th>
            <th className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Result / Findings</th>
            <th className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide w-20 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {/* Laboratory Tests group header */}
          <tr className="bg-[hsl(var(--primary)/0.05)] border-b border-[hsl(var(--border))]">
            <td colSpan={3} className="px-4 py-1.5 text-xs font-semibold text-[hsl(var(--primary))] uppercase tracking-wide">Laboratory Tests</td>
          </tr>
          {labTests.map(t => {
            const d = tests[t.label] || {}
            return (
              <tr key={t.label} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
                <td className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))]">{t.label}</td>
                <td className="px-4 py-2.5">
                  <Input value={d.result || ''} onChange={e => setTest(t.label, { ...d, result: e.target.value })} placeholder="Result / Findings" className="h-8 text-sm" />
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center justify-center gap-1">
                    <button type="button" onClick={() => setTest(t.label, { ...d, status: d.status === 'Normal' ? '' : 'Normal' })}
                      className={cn('text-xs px-2 py-1 rounded border font-semibold transition-all cursor-pointer',
                        d.status === 'Normal' ? 'bg-[hsl(var(--success))] border-[hsl(var(--success))] text-white' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--success)/0.5)]'
                      )}>N</button>
                    <button type="button" onClick={() => setTest(t.label, { ...d, status: d.status === 'Abnormal' ? '' : 'Abnormal' })}
                      className={cn('text-xs px-2 py-1 rounded border font-semibold transition-all cursor-pointer',
                        d.status === 'Abnormal' ? 'bg-[hsl(var(--destructive))] border-[hsl(var(--destructive))] text-white' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--destructive)/0.5)]'
                      )}>A</button>
                  </div>
                </td>
              </tr>
            )
          })}

          {/* Diagnostic Tests group header */}
          <tr className="bg-[hsl(var(--primary)/0.05)] border-b border-[hsl(var(--border))]">
            <td colSpan={3} className="px-4 py-1.5 text-xs font-semibold text-[hsl(var(--primary))] uppercase tracking-wide">Diagnostic Tests</td>
          </tr>
          {diagTests.map(t => {
            const d = tests[t.label] || {}
            return (
              <tr key={t.label} className="border-b border-[hsl(var(--border))] last:border-b-0 hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
                <td className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))]">{t.label}</td>
                <td className="px-4 py-2.5">
                  <Input value={d.result || ''} onChange={e => setTest(t.label, { ...d, result: e.target.value })} placeholder="Result / Findings" className="h-8 text-sm" />
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center justify-center gap-1">
                    <button type="button" onClick={() => setTest(t.label, { ...d, status: d.status === 'Normal' ? '' : 'Normal' })}
                      className={cn('text-xs px-2 py-1 rounded border font-semibold transition-all cursor-pointer',
                        d.status === 'Normal' ? 'bg-[hsl(var(--success))] border-[hsl(var(--success))] text-white' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--success)/0.5)]'
                      )}>N</button>
                    <button type="button" onClick={() => setTest(t.label, { ...d, status: d.status === 'Abnormal' ? '' : 'Abnormal' })}
                      className={cn('text-xs px-2 py-1 rounded border font-semibold transition-all cursor-pointer',
                        d.status === 'Abnormal' ? 'bg-[hsl(var(--destructive))] border-[hsl(var(--destructive))] text-white' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--destructive)/0.5)]'
                      )}>A</button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
