"use client"

import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { CheckCheck, Eraser } from 'lucide-react'

const chem10Tests = [
  { key: 'fbs', label: 'FBS (Fasting Blood Sugar)', unit: 'mmol/L', ref: '3.9–6.1', normal: '5.0', min: 3.9, max: 6.1 },
  { key: 'bun', label: 'BUN', unit: 'mmol/L', ref: '2.5–7.1', normal: '5.0', min: 2.5, max: 7.1 },
  { key: 'uric_acid', label: 'Uric Acid', unit: 'µmol/L', ref: 'M: 202–416 | F: 143–339', normal: '310', min: 143, max: 416 },
  { key: 'creatinine', label: 'Creatinine', unit: 'µmol/L', ref: 'M: 62–115 | F: 53–97', normal: '88', min: 53, max: 115 },
  { key: 'cholesterol', label: 'Cholesterol', unit: 'mmol/L', ref: '< 5.18', normal: '4.5', min: 0, max: 5.18 },
  { key: 'triglyceride', label: 'Triglyceride', unit: 'mmol/L', ref: '< 1.70', normal: '1.2', min: 0, max: 1.70 },
  { key: 'hdl', label: 'HDL', unit: 'mmol/L', ref: '> 1.04', normal: '1.3', min: 1.04, max: 999 },
  { key: 'ldl', label: 'LDL', unit: 'mmol/L', ref: '< 3.36', normal: '2.5', min: 0, max: 3.36 },
  { key: 'vldl', label: 'VLDL', unit: 'mmol/L', ref: '0.26–1.04', normal: '0.6', min: 0.26, max: 1.04 },
  { key: 'sgpt', label: 'SGPT (ALT)', unit: 'U/L', ref: '7–56', normal: '25', min: 7, max: 56 },
  { key: 'sgot', label: 'SGOT (AST)', unit: 'U/L', ref: '10–40', normal: '22', min: 10, max: 40 },
]

const NORMAL_VALUES = chem10Tests.reduce((acc: any, t) => {
  acc[t.key] = t.normal
  return acc
}, { result_date: format(new Date(), 'yyyy-MM-dd'), is_normal: true })

function isInRange(value: string, min?: number, max?: number): boolean | null {
  if (!value || min === undefined || max === undefined) return null
  const num = parseFloat(value)
  if (isNaN(num)) return null
  return num >= min && num <= max
}

export default function Chem10Tab({ data, onChange }: { data: any; onChange: (v: any) => void }) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const set = (k: string, v: any) => onChange({ ...data, [k]: v })
  const outOfRangeCount = chem10Tests.filter(t => isInRange(data[t.key], t.min, t.max) === false).length

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase">Result Date</span>
          <input type="date" value={data.result_date || today} onChange={e => set('result_date', e.target.value)}
            className="border border-[hsl(var(--input))] rounded px-2.5 py-1 text-sm bg-[hsl(var(--card))] w-44 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
          {outOfRangeCount > 0 && (
            <span className="text-xs text-[hsl(var(--destructive))] font-medium ml-2">
              {outOfRangeCount} value{outOfRangeCount > 1 ? 's' : ''} out of range
            </span>
          )}
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
            <th className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Test</th>
            <th className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide w-32">Result</th>
            <th className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide w-20">Unit</th>
            <th className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Reference</th>
            <th className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide w-12 text-center">✓</th>
          </tr>
        </thead>
        <tbody>
          {chem10Tests.map(t => {
            const inRange = isInRange(data[t.key], t.min, t.max)
            return (
              <tr key={t.key} className={cn(
                "border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent)/0.3)] transition-colors",
                inRange === false && "bg-[hsl(var(--destructive)/0.04)]"
              )}>
                <td className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))]">{t.label}</td>
                <td className="px-4 py-2.5">
                  <Input value={data[t.key] || ''} onChange={e => set(t.key, e.target.value)} placeholder="—"
                    className={cn("h-8 text-sm",
                      inRange === true && "border-[hsl(var(--success))]",
                      inRange === false && "border-[hsl(var(--destructive))]"
                    )} />
                </td>
                <td className="px-4 py-2.5 text-xs text-[hsl(var(--muted-foreground))]">{t.unit}</td>
                <td className="px-4 py-2.5 text-xs text-[hsl(var(--muted-foreground))]">{t.ref}</td>
                <td className="px-4 py-2.5 text-center">
                  {inRange !== null && (
                    <span className={cn("text-sm font-bold", inRange ? "text-[hsl(var(--success))]" : "text-[hsl(var(--destructive))]")}>
                      {inRange ? '✓' : '!'}
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
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
