"use client"

import { FormField, SectionCard } from '@/components/ui/FormField'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

const NORMAL_VALUES = { result_date: format(new Date(), 'yyyy-MM-dd'), hba1c: '5.2', is_normal: true }

export default function HbA1cTab({ data, onChange }: { data: any; onChange: (v: any) => void }) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const set = (k: string, v: any) => onChange({ ...data, [k]: v })

  const val = parseFloat(data.hba1c) || 0
  const classification =
    val === 0 ? null :
    val < 5.7 ? { label: 'Normal', color: 'text-[hsl(var(--success))] bg-[hsl(var(--success-muted))] border-[hsl(var(--success)/0.3)]' } :
    val < 6.5 ? { label: 'Pre-Diabetic', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' } :
    { label: 'Diabetic', color: 'text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.1)] border-[hsl(var(--destructive)/0.3)]' }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4">
        <FormField label="Result Date">
          <input type="date" value={data.result_date || today} onChange={e => set('result_date', e.target.value)}
            className="border border-[hsl(var(--input))] rounded-lg px-3 py-2 text-sm bg-[hsl(var(--card))] w-48 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-all hover:border-[hsl(var(--primary)/0.5)] hover:shadow-md" />
        </FormField>
        <Button variant="outline" size="sm" onClick={() => onChange({ ...NORMAL_VALUES })}
          className="mb-0.5 border-[hsl(var(--success)/0.5)] text-[hsl(var(--success))] hover:bg-[hsl(var(--success-muted))] hover:text-[hsl(var(--success))]">
          ✓ Fill Normal Values
        </Button>
      </div>

      <SectionCard title="HbA1c Result">
        <div className="max-w-sm space-y-4">
          <FormField label="HbA1c (%)">
            <Input type="number" step="0.1" value={data.hba1c || ''} onChange={e => set('hba1c', e.target.value)} placeholder="e.g. 5.4" />
          </FormField>
          {classification && (
            <div className={`px-4 py-3 rounded-lg border text-sm font-semibold ${classification.color}`}>
              Classification: {classification.label}
            </div>
          )}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: 'Normal', range: '< 5.7%', color: 'border-[hsl(var(--success)/0.4)] bg-[hsl(var(--success-muted))] text-[hsl(var(--success))]' },
            { label: 'Pre-Diabetic', range: '5.7 – 6.4%', color: 'border-yellow-300 bg-yellow-50 text-yellow-700' },
            { label: 'Diabetic', range: '≥ 6.5%', color: 'border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))]' },
          ].map(r => (
            <div key={r.label} className={`rounded-lg border px-3 py-3 text-center ${r.color}`}>
              <p className="font-semibold text-sm">{r.label}</p>
              <p className="text-xs mt-0.5 opacity-80">{r.range}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="flex items-center gap-2 pt-2">
        <Checkbox id="normal-a" checked={!!data.is_normal} onCheckedChange={v => set('is_normal', v)} />
        <label htmlFor="normal-a" className="text-sm font-semibold text-[hsl(var(--primary))] cursor-pointer px-2 py-1 rounded-lg hover:bg-[hsl(var(--accent)/0.5)] transition-colors">NORMAL</label>
      </div>
    </div>
  )
}
