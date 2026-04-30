"use client"

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { CheckCheck, Eraser } from 'lucide-react'

const colors = ['Brown', 'Yellow', 'Green', 'Black', 'Red', 'Clay', 'Other']
const consistency = ['Formed', 'Semi-formed', 'Soft', 'Watery', 'Liquid']

const NORMAL_VALUES = {
  result_date: format(new Date(), 'yyyy-MM-dd'),
  color: 'Brown', consistency: 'Formed', wbc: '0–2', rbc: '0–2',
  fat_globules: 'None', bacteria: 'None', ova: 'none', remark: '', is_normal: true,
}

function Drop({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <Select value={value || ''} onValueChange={onChange}>
      <SelectTrigger className="h-8 text-sm max-w-[220px]"><SelectValue placeholder="Select…" /></SelectTrigger>
      <SelectContent>{options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
    </Select>
  )
}

function TRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
      <td className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] w-[40%] whitespace-nowrap">{label}</td>
      <td className="px-4 py-2.5 text-sm">{children}</td>
    </tr>
  )
}

function GroupHeader({ children }: { children: React.ReactNode }) {
  return (
    <tr className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
      <td colSpan={2} className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{children}</td>
    </tr>
  )
}

export default function FecalysisTab({ data, onChange }: { data: any; onChange: (v: any) => void }) {
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
        <tbody>
          <GroupHeader>Physical Examination</GroupHeader>
          <TRow label="Color"><Drop value={data.color} onChange={v => set('color', v)} options={colors} /></TRow>
          <TRow label="Consistency"><Drop value={data.consistency} onChange={v => set('consistency', v)} options={consistency} /></TRow>

          <GroupHeader>Microscopic Examination</GroupHeader>
          <TRow label="WBC / HPF"><Input value={data.wbc || ''} onChange={e => set('wbc', e.target.value)} className="max-w-[220px] h-8 text-sm" /></TRow>
          <TRow label="RBC / HPF"><Input value={data.rbc || ''} onChange={e => set('rbc', e.target.value)} className="max-w-[220px] h-8 text-sm" /></TRow>
          <TRow label="Fat Globules"><Input value={data.fat_globules || ''} onChange={e => set('fat_globules', e.target.value)} className="max-w-[220px] h-8 text-sm" /></TRow>
          <TRow label="Bacteria"><Input value={data.bacteria || ''} onChange={e => set('bacteria', e.target.value)} className="max-w-[220px] h-8 text-sm" /></TRow>

          <GroupHeader>Ova / Parasite</GroupHeader>
          <TRow label="Result">
            <div className="flex items-center gap-4">
              {['found', 'none'].map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="ova" value={opt} checked={data.ova === opt} onChange={() => set('ova', opt)} className="w-4 h-4 accent-[hsl(var(--primary))]" />
                  <span className="text-sm">{opt === 'found' ? 'Found' : 'None Found'}</span>
                </label>
              ))}
              {data.ova && (
                <button type="button" onClick={() => set('ova', '')} className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] cursor-pointer">✕ Clear</button>
              )}
            </div>
          </TRow>
          <TRow label="Remark"><Input value={data.remark || ''} onChange={e => set('remark', e.target.value)} className="h-8 text-sm" /></TRow>
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
