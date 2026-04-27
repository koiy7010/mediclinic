"use client"

import { FormField, SectionCard } from '@/components/ui/FormField'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

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

function DropSelect({ value, onChange, options, placeholder = 'Select…' }: any) {
  return (
    <Select value={value || ''} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {options.map((o: string) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}

export default function UrinalysisTab({ data, onChange }: { data: any; onChange: (v: any) => void }) {
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
          <FormField label="Color"><DropSelect value={data.color} onChange={(v: string) => set('color', v)} options={colors} /></FormField>
          <FormField label="Transparency"><DropSelect value={data.transparency} onChange={(v: string) => set('transparency', v)} options={trans} /></FormField>
        </div>
      </SectionCard>

      <SectionCard title="Chemical Examination">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Specific Gravity"><DropSelect value={data.specific_gravity} onChange={(v: string) => set('specific_gravity', v)} options={grads} /></FormField>
          <FormField label="pH"><Input type="number" step="0.1" min="4" max="9" value={data.ph || ''} onChange={e => set('ph', e.target.value)} placeholder="5.0–8.0" /></FormField>
          <FormField label="Glucose"><DropSelect value={data.glucose} onChange={(v: string) => set('glucose', v)} options={levels} /></FormField>
          <FormField label="Protein"><DropSelect value={data.protein} onChange={(v: string) => set('protein', v)} options={levels} /></FormField>
        </div>
      </SectionCard>

      <SectionCard title="Microscopic Examination">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="WBC / HPF"><Input value={data.wbc || ''} onChange={e => set('wbc', e.target.value)} placeholder="e.g. 0–2" /></FormField>
          <FormField label="RBC / HPF"><Input value={data.rbc || ''} onChange={e => set('rbc', e.target.value)} placeholder="e.g. 0–2" /></FormField>
          <FormField label="Epithelial Cells"><DropSelect value={data.epithelial} onChange={(v: string) => set('epithelial', v)} options={micro} /></FormField>
          <FormField label="Mucus Threads"><DropSelect value={data.mucus} onChange={(v: string) => set('mucus', v)} options={micro} /></FormField>
          <FormField label="Bacteria"><DropSelect value={data.bacteria} onChange={(v: string) => set('bacteria', v)} options={micro} /></FormField>
          <FormField label="Amorphous Urates"><DropSelect value={data.amorphous_urates} onChange={(v: string) => set('amorphous_urates', v)} options={micro} /></FormField>
          <FormField label="Amorphous Phosphates"><DropSelect value={data.amorphous_phosphates} onChange={(v: string) => set('amorphous_phosphates', v)} options={micro} /></FormField>
          <FormField label="Others"><Input value={data.others || ''} onChange={e => set('others', e.target.value)} /></FormField>
          <FormField label="Remark"><Input value={data.remark || ''} onChange={e => set('remark', e.target.value)} /></FormField>
        </div>
      </SectionCard>

      <div className="flex items-center gap-2 pt-2">
        <Checkbox id="normal-u" checked={!!data.is_normal} onCheckedChange={v => set('is_normal', v)} />
        <label htmlFor="normal-u" className="text-sm font-semibold text-[hsl(var(--primary))] cursor-pointer px-2 py-1 rounded-lg hover:bg-[hsl(var(--accent)/0.5)] transition-colors">NORMAL</label>
      </div>
    </div>
  )
}
