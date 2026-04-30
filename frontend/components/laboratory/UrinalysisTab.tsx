"use client"

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { CheckCheck, Eraser } from 'lucide-react'

const colors = ['Yellow', 'Amber', 'Dark Yellow', 'Orange', 'Brown', 'Red', 'Colorless', 'Other']
const trans = ['Clear', 'Slightly Turbid', 'Turbid', 'Cloudy']
const grads = ['1.000–1.030', '1.005', '1.010', '1.015', '1.020', '1.025', '1.030']
const levels = ['Negative', 'Trace', '+1', '+2', '+3', '+4']
const micro = ['None', 'Few', 'Moderate', 'Many', 'Loaded']

const NORMAL_VALUES = {
  result_date: format(new Date(), 'yyyy-MM-dd'),
  color: 'Yellow', transparency: 'Clear', specific_gravity: '1.010',
  ph: '6.0', glucose: 'Negative', protein: 'Negative',
  wbc: '0–2', rbc: '0–2', epithelial: 'Few', mucus: 'None',
  bacteria: 'None', amorphous_urates: 'None', amorphous_phosphates: 'None',
  others: '', remark: '', is_normal: true,
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

export default function UrinalysisTab({ data, onChange }: { data: any; onChange: (v: any) => void }) {
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
          <TRow label="Transparency"><Drop value={data.transparency} onChange={v => set('transparency', v)} options={trans} /></TRow>

          <GroupHeader>Chemical Examination</GroupHeader>
          <TRow label="Specific Gravity"><Drop value={data.specific_gravity} onChange={v => set('specific_gravity', v)} options={grads} /></TRow>
          <TRow label="pH">
            <Input type="number" step="0.1" min="4" max="9" value={data.ph || ''} onChange={e => set('ph', e.target.value)} placeholder="5.0–8.0" className="max-w-[220px] h-8 text-sm" />
          </TRow>
          <TRow label="Glucose"><Drop value={data.glucose} onChange={v => set('glucose', v)} options={levels} /></TRow>
          <TRow label="Protein"><Drop value={data.protein} onChange={v => set('protein', v)} options={levels} /></TRow>

          <GroupHeader>Microscopic Examination</GroupHeader>
          <TRow label="WBC / HPF"><Input value={data.wbc || ''} onChange={e => set('wbc', e.target.value)} placeholder="e.g. 0–2" className="max-w-[220px] h-8 text-sm" /></TRow>
          <TRow label="RBC / HPF"><Input value={data.rbc || ''} onChange={e => set('rbc', e.target.value)} placeholder="e.g. 0–2" className="max-w-[220px] h-8 text-sm" /></TRow>
          <TRow label="Epithelial Cells"><Drop value={data.epithelial} onChange={v => set('epithelial', v)} options={micro} /></TRow>
          <TRow label="Mucus Threads"><Drop value={data.mucus} onChange={v => set('mucus', v)} options={micro} /></TRow>
          <TRow label="Bacteria"><Drop value={data.bacteria} onChange={v => set('bacteria', v)} options={micro} /></TRow>
          <TRow label="Amorphous Urates"><Drop value={data.amorphous_urates} onChange={v => set('amorphous_urates', v)} options={micro} /></TRow>
          <TRow label="Amorphous Phosphates"><Drop value={data.amorphous_phosphates} onChange={v => set('amorphous_phosphates', v)} options={micro} /></TRow>
          <TRow label="Others"><Input value={data.others || ''} onChange={e => set('others', e.target.value)} className="h-8 text-sm" /></TRow>
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
