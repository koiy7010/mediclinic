"use client"

import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { CheckCheck, Eraser } from 'lucide-react'

const NORMAL_VALUES = { result_date: format(new Date(), 'yyyy-MM-dd'), hba1c: '5.2', is_normal: true }

export default function HbA1cTab({ data, onChange }: { data: any; onChange: (v: any) => void }) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const set = (k: string, v: any) => onChange({ ...data, [k]: v })

  const val = parseFloat(data.hba1c) || 0
  const classification =
    val === 0 ? null :
    val < 5.7 ? { label: 'Normal', color: 'text-[hsl(var(--success))]' } :
    val < 6.5 ? { label: 'Pre-Diabetic', color: 'text-yellow-700' } :
    { label: 'Diabetic', color: 'text-[hsl(var(--destructive))]' }

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
        <tbody>
          <tr className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
            <td colSpan={2} className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">HbA1c Result</td>
          </tr>
          <tr className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
            <td className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] w-[40%]">HbA1c (%)</td>
            <td className="px-4 py-2.5">
              <Input type="number" step="0.1" value={data.hba1c || ''} onChange={e => set('hba1c', e.target.value)} placeholder="e.g. 5.4" className="max-w-[200px] h-8 text-sm" />
            </td>
          </tr>
          <tr className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
            <td className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))]">Classification</td>
            <td className="px-4 py-2.5">
              {classification
                ? <span className={`text-sm font-semibold ${classification.color}`}>{classification.label}</span>
                : <span className="text-sm text-[hsl(var(--muted-foreground))]">—</span>}
            </td>
          </tr>

          <tr className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
            <td colSpan={2} className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Reference Ranges</td>
          </tr>
          {[
            { label: 'Normal', range: '< 5.7%', color: 'text-[hsl(var(--success))]' },
            { label: 'Pre-Diabetic', range: '5.7 – 6.4%', color: 'text-yellow-700' },
            { label: 'Diabetic', range: '≥ 6.5%', color: 'text-[hsl(var(--destructive))]' },
          ].map(r => (
            <tr key={r.label} className="border-b border-[hsl(var(--border))]">
              <td className={`px-4 py-2 text-sm font-medium ${r.color}`}>{r.label}</td>
              <td className="px-4 py-2 text-sm text-[hsl(var(--muted-foreground))]">{r.range}</td>
            </tr>
          ))}
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
