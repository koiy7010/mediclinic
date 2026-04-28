"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { CheckCheck, Eraser } from 'lucide-react'

const tests = ['HBsAg', 'Anti-HCV', 'VDRL', 'RPR', 'Pregnancy Test', 'Other']
const specimens = ['Serum', 'Plasma', 'Urine', 'Whole Blood']
const results = ['Reactive', 'Non-Reactive', 'Positive', 'Negative', 'Weakly Reactive']

const NORMAL_VALUES = {
  result_date: format(new Date(), 'yyyy-MM-dd'),
  rows: [
    { test: 'HBsAg', specimen: 'Serum', result: 'Non-Reactive' },
    { test: 'VDRL', specimen: 'Serum', result: 'Non-Reactive' },
  ],
  is_normal: true,
}

export default function SerologyTab({ data, onChange }: { data: any; onChange: (v: any) => void }) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const set = (k: string, v: any) => onChange({ ...data, [k]: v })
  const rows = data.rows || [{}, {}]
  const setRow = (i: number, val: any) => { const updated = [...rows]; updated[i] = val; set('rows', updated) }
  const setRowField = (i: number, k: string, v: any) => setRow(i, { ...rows[i], [k]: v })

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
            <th className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide w-12">#</th>
            <th className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Test</th>
            <th className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Specimen</th>
            <th className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Result</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r: any, i: number) => (
            <tr key={i} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
              <td className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))]">{i + 1}</td>
              <td className="px-4 py-2.5">
                <Select value={r.test || ''} onValueChange={v => setRowField(i, 'test', v)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Test…" /></SelectTrigger>
                  <SelectContent>{tests.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </td>
              <td className="px-4 py-2.5">
                <Select value={r.specimen || ''} onValueChange={v => setRowField(i, 'specimen', v)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Specimen…" /></SelectTrigger>
                  <SelectContent>{specimens.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </td>
              <td className="px-4 py-2.5">
                <Select value={r.result || ''} onValueChange={v => setRowField(i, 'result', v)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Result…" /></SelectTrigger>
                  <SelectContent>{results.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </td>
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
