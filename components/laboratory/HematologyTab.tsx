"use client"

import { FormField, SectionCard } from '@/components/ui/FormField'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

const cbcFields = [
  { key: 'rbc', label: 'RBC', ref: 'M: 4.5–5.5 | F: 4.0–5.0 (×10⁶/µL)' },
  { key: 'hemoglobin', label: 'Hemoglobin', ref: 'M: 140–175 | F: 120–155 (g/L)' },
  { key: 'hematocrit', label: 'Hematocrit', ref: 'M: 0.42–0.52 | F: 0.37–0.47' },
  { key: 'platelet', label: 'Platelet Count', ref: '150–400 (×10³/µL)' },
  { key: 'wbc', label: 'WBC', ref: '5.0–10.0 (×10³/µL)' },
]
const diffFields = [
  { key: 'neutrophil', label: 'Neutrophil', ref: '50–70%' },
  { key: 'lymphocyte', label: 'Lymphocyte', ref: '20–40%' },
  { key: 'monocyte', label: 'Monocyte', ref: '2–8%' },
  { key: 'eosinophil', label: 'Eosinophil', ref: '1–4%' },
  { key: 'basophil', label: 'Basophil', ref: '0–1%' },
  { key: 'others_diff', label: 'Others', ref: '' },
]

const NORMAL_VALUES = {
  result_date: format(new Date(), 'yyyy-MM-dd'),
  rbc: '5.0', hemoglobin: '140', hematocrit: '0.42', platelet: '250', wbc: '7.0',
  neutrophil: '60', lymphocyte: '30', monocyte: '5', eosinophil: '2', basophil: '0',
  others_diff: '', remark: '', is_normal: true,
}

export default function HematologyTab({ data, onChange }: { data: any; onChange: (v: any) => void }) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const set = (k: string, v: any) => onChange({ ...data, [k]: v })

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

      <SectionCard title="Complete Blood Count">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cbcFields.map(f => (
            <FormField key={f.key} label={f.label} hint={f.ref}>
              <Input value={data[f.key] || ''} onChange={e => set(f.key, e.target.value)} placeholder="Value" />
            </FormField>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Differential Count">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {diffFields.map(f => (
            <FormField key={f.key} label={f.label} hint={f.ref}>
              <Input value={data[f.key] || ''} onChange={e => set(f.key, e.target.value)} placeholder="%" />
            </FormField>
          ))}
        </div>
      </SectionCard>

      <FormField label="Remark">
        <Input value={data.remark || ''} onChange={e => set('remark', e.target.value)} />
      </FormField>

      <div className="flex items-center gap-2 pt-2">
        <Checkbox id="normal-h" checked={!!data.is_normal} onCheckedChange={v => set('is_normal', v)} />
        <label htmlFor="normal-h" className="text-sm font-semibold text-[hsl(var(--primary))] cursor-pointer px-2 py-1 rounded-lg hover:bg-[hsl(var(--accent)/0.5)] transition-colors">NORMAL</label>
      </div>
    </div>
  )
}
