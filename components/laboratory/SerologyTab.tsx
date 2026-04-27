"use client"

import { FormField, SectionCard } from '@/components/ui/FormField'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

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

function Row({ row, onChange, label }: any) {
  const set = (k: string, v: any) => onChange({ ...row, [k]: v })
  return (
    <tr className="border-b border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
      <td className="px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">{label}</td>
      <td className="px-4 py-3">
        <Select value={row.test || ''} onValueChange={v => set('test', v)}>
          <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Test…" /></SelectTrigger>
          <SelectContent>{tests.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
      </td>
      <td className="px-4 py-3">
        <Select value={row.specimen || ''} onValueChange={v => set('specimen', v)}>
          <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Specimen…" /></SelectTrigger>
          <SelectContent>{specimens.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </td>
      <td className="px-4 py-3">
        <Select value={row.result || ''} onValueChange={v => set('result', v)}>
          <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Result…" /></SelectTrigger>
          <SelectContent>{results.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
        </Select>
      </td>
    </tr>
  )
}

export default function SerologyTab({ data, onChange }: { data: any; onChange: (v: any) => void }) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const set = (k: string, v: any) => onChange({ ...data, [k]: v })
  const rows = data.rows || [{}, {}]
  const setRow = (i: number, val: any) => { const updated = [...rows]; updated[i] = val; set('rows', updated) }

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
      <SectionCard title="Serology Results">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[hsl(var(--muted)/0.5)]">
                <th className="px-4 py-2 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase">#</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase">Test</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase">Specimen</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase">Result</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any, i: number) => <Row key={i} row={r} onChange={(val: any) => setRow(i, val)} label={i + 1} />)}
            </tbody>
          </table>
        </div>
      </SectionCard>
      <div className="flex items-center gap-2 pt-2">
        <Checkbox id="normal-s" checked={!!data.is_normal} onCheckedChange={v => set('is_normal', v)} />
        <label htmlFor="normal-s" className="text-sm font-semibold text-[hsl(var(--primary))] cursor-pointer px-2 py-1 rounded-lg hover:bg-[hsl(var(--accent)/0.5)] transition-colors">NORMAL</label>
      </div>
    </div>
  )
}
