"use client"

import { FormField, SectionCard } from '@/components/ui/FormField'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

const colors = ['Brown', 'Yellow', 'Green', 'Black', 'Red', 'Clay', 'Other']
const consistency = ['Formed', 'Semi-formed', 'Soft', 'Watery', 'Liquid']

const NORMAL_VALUES = {
  result_date: format(new Date(), 'yyyy-MM-dd'),
  color: 'Brown', consistency: 'Formed', wbc: '0–2', rbc: '0–2',
  fat_globules: 'None', bacteria: 'None', ova: 'none', remark: '', is_normal: true,
}

export default function FecalysisTab({ data, onChange }: { data: any; onChange: (v: any) => void }) {
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

      <SectionCard title="Physical Examination">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Color">
            <Select value={data.color || ''} onValueChange={v => set('color', v)}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{colors.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
          <FormField label="Consistency">
            <Select value={data.consistency || ''} onValueChange={v => set('consistency', v)}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{consistency.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Microscopic Examination">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[{ key: 'wbc', label: 'WBC / HPF' }, { key: 'rbc', label: 'RBC / HPF' }, { key: 'fat_globules', label: 'Fat Globules' }, { key: 'bacteria', label: 'Bacteria' }].map(f => (
            <FormField key={f.key} label={f.label}>
              <Input value={data[f.key] || ''} onChange={e => set(f.key, e.target.value)} />
            </FormField>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Ova / Parasite">
        <div className="flex items-center gap-4">
          {['found', 'none'].map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-[hsl(var(--accent)/0.5)] transition-colors">
              <input type="radio" name="ova" value={opt} checked={data.ova === opt} onChange={() => set('ova', opt)} className="w-4 h-4 accent-[hsl(var(--primary))]" />
              <span className="text-sm font-medium">{opt === 'found' ? 'Found' : 'None Found'}</span>
            </label>
          ))}
          <Button variant="outline" size="sm" onClick={() => set('ova', '')}>Clear</Button>
        </div>
      </SectionCard>

      <FormField label="Remark">
        <Input value={data.remark || ''} onChange={e => set('remark', e.target.value)} />
      </FormField>

      <div className="flex items-center gap-2 pt-2">
        <Checkbox id="normal-f" checked={!!data.is_normal} onCheckedChange={v => set('is_normal', v)} />
        <label htmlFor="normal-f" className="text-sm font-semibold text-[hsl(var(--primary))] cursor-pointer">NORMAL</label>
      </div>
    </div>
  )
}
