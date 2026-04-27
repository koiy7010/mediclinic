"use client"

import { SectionCard, FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

const EVALUATIONS = [
  { value: 'A', label: 'Class A — Fit for work' },
  { value: 'B', label: 'Class B — Fit with minor defects' },
  { value: 'C', label: "Class C — At management's discretion" },
  { value: 'pending', label: 'Pending' },
]

export default function Evaluation({ data, onChange }: { data: any; onChange: (v: any) => void }) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v })

  return (
    <SectionCard title="Section IV — Evaluation">
      <div className="space-y-4 max-w-2xl">
        <FormField label="Evaluation">
          <Select value={data.evaluation || ''} onValueChange={v => set('evaluation', v)}>
            <SelectTrigger><SelectValue placeholder="Select evaluation class…" /></SelectTrigger>
            <SelectContent>
              {EVALUATIONS.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>

        {data.evaluation && (
          <div className={`px-4 py-3 rounded-lg border text-sm font-semibold ${
            data.evaluation === 'A' ? 'bg-[hsl(var(--success-muted))] border-[hsl(var(--success)/0.3)] text-[hsl(var(--success))]' :
            data.evaluation === 'B' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
            data.evaluation === 'C' ? 'bg-orange-50 border-orange-200 text-orange-700' :
            'bg-[hsl(var(--muted))] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'
          }`}>
            {EVALUATIONS.find(e => e.value === data.evaluation)?.label}
          </div>
        )}

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
