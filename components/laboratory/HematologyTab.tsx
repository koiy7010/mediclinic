"use client"

import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { CheckCheck, Eraser } from 'lucide-react'

const cbcFields = [
  { key: 'rbc', label: 'RBC', ref: 'M: 4.5–5.5 | F: 4.0–5.0 (×10⁶/µL)', min: 3.5, max: 6.5 },
  { key: 'hemoglobin', label: 'Hemoglobin', ref: 'M: 140–175 | F: 120–155 (g/L)', min: 100, max: 200 },
  { key: 'hematocrit', label: 'Hematocrit', ref: 'M: 0.42–0.52 | F: 0.37–0.47', min: 0.30, max: 0.60 },
  { key: 'platelet', label: 'Platelet Count', ref: '150–400 (×10³/µL)', min: 100, max: 500 },
  { key: 'wbc', label: 'WBC', ref: '5.0–10.0 (×10³/µL)', min: 3.0, max: 15.0 },
]
const diffFields = [
  { key: 'neutrophil', label: 'Neutrophil', ref: '50–70%', min: 40, max: 80 },
  { key: 'lymphocyte', label: 'Lymphocyte', ref: '20–40%', min: 15, max: 50 },
  { key: 'monocyte', label: 'Monocyte', ref: '2–8%', min: 0, max: 15 },
  { key: 'eosinophil', label: 'Eosinophil', ref: '1–4%', min: 0, max: 10 },
  { key: 'basophil', label: 'Basophil', ref: '0–1%', min: 0, max: 3 },
  { key: 'others_diff', label: 'Others', ref: '' },
]

const NORMAL_VALUES = {
  result_date: format(new Date(), 'yyyy-MM-dd'),
  rbc: '5.0', hemoglobin: '140', hematocrit: '0.42', platelet: '250', wbc: '7.0',
  neutrophil: '60', lymphocyte: '30', monocyte: '5', eosinophil: '2', basophil: '0',
  others_diff: '', remark: '', is_normal: true,
}

function isInRange(value: string, min?: number, max?: number): boolean | null {
  if (!value || min === undefined || max === undefined) return null
  const num = parseFloat(value)
  if (isNaN(num)) return null
  return num >= min && num <= max
}

function LabRow({ field, value, onChange }: { field: { key: string; label: string; ref: string; min?: number; max?: number }; value: string; onChange: (v: string) => void }) {
  const inRange = isInRange(value, field.min, field.max)
  return (
    <tr className={cn("border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent)/0.3)] transition-colors",
      inRange === false && "bg-[hsl(var(--destructive)/0.04)]")}>
      <td className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))]">{field.label}</td>
      <td className="px-4 py-2.5">
        <Input value={value} onChange={e => onChange(e.target.value)} placeholder="Value"
          className={cn("h-8 text-sm max-w-[140px]",
            inRange === true && "border-[hsl(var(--success))]",
            inRange === false && "border-[hsl(var(--destructive))]")} />
      </td>
      <td className="px-4 py-2.5 text-xs text-[hsl(var(--muted-foreground))]">{field.ref}</td>
      <td className="px-4 py-2.5 text-center w-12">
        {inRange !== null && (
          <span className={cn("text-sm font-bold", inRange ? "text-[hsl(var(--success))]" : "text-[hsl(var(--destructive))]")}>
            {inRange ? '✓' : '!'}
          </span>
        )}
      </td>
    </tr>
  )
}

export default function HematologyTab({ data, onChange }: { data: any; onChange: (v: any) => void }) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const set = (k: string, v: any) => onChange({ ...data, [k]: v })

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase">Result Date</span>
          <input type="date" value={data.result_date || today} onChange={e => set('result_date', e.target.value)}
            className="border border-[hsl(var(--input))] rounded px-2.5 py-1 text-sm bg-[hsl(var(--card))] w-44 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => onChange({ ...NORMAL_VALUES })}
            className="h-7 text-xs border-[hsl(var(--success)/0.5)] text-[hsl(var(--success))] hover:bg-[hsl(var(--success-muted))]">
            <CheckCheck className="w-3.5 h-3.5 mr-1" /> Fill Normal
          </Button>
          <Button variant="outline" size="sm" onClick={() => onChange({ result_date: data.result_date || today })}
            className="h-7 text-xs text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]">
            <Eraser className="w-3.5 h-3.5 mr-1" /> Clear
          </Button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-left">
        <thead>
          <tr className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
            <th className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide w-[35%]">Complete Blood Count</th>
            <th className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide w-36">Result</th>
            <th className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Reference Range</th>
            <th className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide w-12 text-center">✓</th>
          </tr>
        </thead>
        <tbody>
          {cbcFields.map(f => <LabRow key={f.key} field={f} value={data[f.key] || ''} onChange={v => set(f.key, v)} />)}

          {/* Differential Count section header */}
          <tr className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
            <td className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Differential Count</td>
            <td className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Result</td>
            <td className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Reference Range</td>
            <td className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide w-12 text-center">✓</td>
          </tr>
          {diffFields.map(f => <LabRow key={f.key} field={f} value={data[f.key] || ''} onChange={v => set(f.key, v)} />)}

          {/* Remark */}
          <tr className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
            <td className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))]">Remark</td>
            <td colSpan={3} className="px-4 py-2.5">
              <Input value={data.remark || ''} onChange={e => set('remark', e.target.value)} className="h-8 text-sm" />
            </td>
          </tr>
        </tbody>
      </table>

      {/* Footer */}
      <div className="flex items-center gap-3 px-4 py-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={!!data.is_normal} onCheckedChange={v => set('is_normal', v)} />
          <span className="text-sm font-semibold text-[hsl(var(--primary))]">Mark as NORMAL</span>
        </label>
      </div>
    </div>
  )
}
