"use client"

import { SectionCard, FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { CheckCheck } from 'lucide-react'

const EVALUATIONS = [
  { value: 'A', label: 'Class A — Fit for work', color: 'bg-[hsl(var(--success-muted))] border-[hsl(var(--success)/0.4)] text-[hsl(var(--success))]' },
  { value: 'B', label: 'Class B — Fit with minor defects', color: 'bg-yellow-50 border-yellow-300 text-yellow-700' },
  { value: 'C', label: "Class C — At management's discretion", color: 'bg-orange-50 border-orange-300 text-orange-700' },
  { value: 'pending', label: 'Pending', color: 'bg-[hsl(var(--muted))] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]' },
]

const NORMAL_VALUES = {
  evaluation: 'A',
  remarks: 'Fit for work',
  recommendations: '',
  for_clearance: false,
}

export default function Evaluation({ data, onChange }: { data: any; onChange: (v: any) => void }) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v })

  return (
    <SectionCard title="Section IV — Evaluation">
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Evaluation Class</p>
          <Button variant="outline" size="sm" onClick={() => onChange({ ...NORMAL_VALUES })}
            className="border-[hsl(var(--success)/0.5)] text-[hsl(var(--success))] hover:bg-[hsl(var(--success-muted))] hover:text-[hsl(var(--success))]">
            <CheckCheck className="w-3.5 h-3.5 mr-1" /> Class A
          </Button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {EVALUATIONS.map(e => (
            <button
              key={e.value}
              type="button"
              onClick={() => set('evaluation', data.evaluation === e.value ? '' : e.value)}
              className={`px-3 py-2.5 rounded-lg border text-sm font-semibold transition-all text-left cursor-pointer ${
                data.evaluation === e.value
                  ? e.color + ' shadow-sm ring-2 ring-offset-1 ring-current'
                  : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent)/0.5)]'
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>

        <FormField label="Remarks">
          <Input value={data.remarks || ''} onChange={e => set('remarks', e.target.value)} placeholder="Additional remarks…" />
        </FormField>

        <FormField label="Recommendations">
          <textarea value={data.recommendations || ''} onChange={e => set('recommendations', e.target.value)} rows={3}
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none transition-all hover:border-[hsl(var(--primary)/0.5)] hover:shadow-md"
            placeholder="Recommendations for the patient…" />
        </FormField>

        <label className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-[hsl(var(--accent)/0.5)] transition-colors">
          <Checkbox checked={!!data.for_clearance} onCheckedChange={v => set('for_clearance', v)} />
          <span className="text-sm font-semibold">For Clearance</span>
        </label>
      </div>
    </SectionCard>
  )
}
