"use client"

import { SectionCard } from '@/components/ui/FormField'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

const chem10Tests = [
  { key: 'fbs', label: 'FBS (Fasting Blood Sugar)', unit: 'mmol/L', ref: '3.9–6.1', normal: '5.0' },
  { key: 'bun', label: 'BUN', unit: 'mmol/L', ref: '2.5–7.1', normal: '5.0' },
  { key: 'uric_acid', label: 'Uric Acid', unit: 'µmol/L', ref: 'M: 202–416 | F: 143–339', normal: '310' },
  { key: 'creatinine', label: 'Creatinine', unit: 'µmol/L', ref: 'M: 62–115 | F: 53–97', normal: '88' },
  { key: 'cholesterol', label: 'Cholesterol', unit: 'mmol/L', ref: '< 5.18', normal: '4.5' },
  { key: 'triglyceride', label: 'Triglyceride', unit: 'mmol/L', ref: '< 1.70', normal: '1.2' },
  { key: 'hdl', label: 'HDL', unit: 'mmol/L', ref: '> 1.04', normal: '1.3' },
  { key: 'ldl', label: 'LDL', unit: 'mmol/L', ref: '< 3.36', normal: '2.5' },
  { key: 'vldl', label: 'VLDL', unit: 'mmol/L', ref: '0.26–1.04', normal: '0.6' },
  { key: 'sgpt', label: 'SGPT (ALT)', unit: 'U/L', ref: '7–56', normal: '25' },
  { key: 'sgot', label: 'SGOT (AST)', unit: 'U/L', ref: '10–40', normal: '22' },
]

const NORMAL_VALUES = chem10Tests.reduce((acc: any, t) => {
  acc[t.key] = t.normal
  acc[`${t.key}_remark`] = ''
  return acc
}, { result_date: format(new Date(), 'yyyy-MM-dd'), is_normal: true })

export default function Chem10Tab({ data, onChange }: { data: any; onChange: (v: any) => void }) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const set = (k: string, v: any) => onChange({ ...data, [k]: v })

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Result Date</label>
          <input type="date" value={data.result_date || today} onChange={e => set('result_date', e.target.value)}
            className="mt-1 border border-[hsl(var(--input))] rounded-lg px-3 py-2 text-sm bg-[hsl(var(--card))] w-48 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-all hover:border-[hsl(var(--primary)/0.5)] hover:shadow-md block" />
        </div>
        <Button variant="outline" size="sm" onClick={() => onChange({ ...NORMAL_VALUES })}
          className="mb-0.5 border-[hsl(var(--success)/0.5)] text-[hsl(var(--success))] hover:bg-[hsl(var(--success-muted))] hover:text-[hsl(var(--success))]">
          ✓ Fill Normal Values
        </Button>
      </div>

      <SectionCard title="Chemistry Panel (Chem 10)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[hsl(var(--muted)/0.5)]">
                <th className="text-left px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase">Test</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase w-32">Result</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase w-24">Unit</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase">Reference Range</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase w-36">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {chem10Tests.map((t, i) => (
                <tr key={t.key} className={`transition-colors hover:bg-[hsl(var(--accent)/0.4)] ${i % 2 === 0 ? 'bg-[hsl(var(--card))]' : 'bg-[hsl(var(--muted)/0.2)]'}`}>
                  <td className="px-4 py-2.5 font-medium">{t.label}</td>
                  <td className="px-4 py-2.5">
                    <Input value={data[t.key] || ''} onChange={e => set(t.key, e.target.value)} className="h-8 text-sm" placeholder="—" />
                  </td>
                  <td className="px-4 py-2.5 text-[hsl(var(--muted-foreground))] text-xs">{t.unit}</td>
                  <td className="px-4 py-2.5 text-[hsl(var(--muted-foreground))] text-xs">{t.ref}</td>
                  <td className="px-4 py-2.5">
                    <Input value={data[`${t.key}_remark`] || ''} onChange={e => set(`${t.key}_remark`, e.target.value)} className="h-8 text-sm" placeholder="—" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="flex items-center gap-2 pt-2">
        <Checkbox id="normal-c" checked={!!data.is_normal} onCheckedChange={v => set('is_normal', v)} />
        <label htmlFor="normal-c" className="text-sm font-semibold text-[hsl(var(--primary))] cursor-pointer px-2 py-1 rounded-lg hover:bg-[hsl(var(--accent)/0.5)] transition-colors">NORMAL</label>
      </div>
    </div>
  )
}
