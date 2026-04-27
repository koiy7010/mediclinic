"use client"

import { SectionCard, FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'

const BODY_SYSTEMS = [
  'Head / Scalp', 'Eyes', 'Ears', 'Nose', 'Neck / Throat',
  'Chest / Breasts', 'Lungs', 'Heart', 'Abdomen', 'Back',
  'Genitals', 'Extremities', 'Skin', 'Anus',
]
const VA_ROWS = ['OD (Right)', 'OS (Left)', 'OU (Both)']
const VA_COLS = ['w/o Glasses', 'w/ Glasses', 'Near']

export default function PhysicalExamination({ data, patient, onChange }: { data: any; patient: any; onChange: (v: any) => void }) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v })
  const systems = data.systems || {}
  const va = data.visual_acuity || {}
  const setSystem = (s: string, k: string, v: any) => set('systems', { ...systems, [s]: { ...(systems[s] || {}), [k]: v } })
  const setVA = (r: string, c: string, v: any) => set('visual_acuity', { ...va, [`${r}_${c}`]: v })

  return (
    <SectionCard title="Section II — Physical Examination">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-3">Body Systems</p>
          <div className="space-y-2">
            {BODY_SYSTEMS.map(s => {
              const sys = systems[s] || {}
              return (
                <div key={s} className="flex items-center gap-3 p-2 rounded-lg border border-[hsl(var(--border)/0.5)] hover:bg-[hsl(var(--accent)/0.4)] hover:border-[hsl(var(--primary)/0.3)] transition-all">
                  <Checkbox checked={!!sys.normal} onCheckedChange={v => setSystem(s, 'normal', v)} />
                  <span className="text-sm font-medium w-32 flex-shrink-0">{s}</span>
                  <Input value={sys.findings || ''} onChange={e => setSystem(s, 'findings', e.target.value)}
                    disabled={!!sys.normal} placeholder={sys.normal ? 'Normal' : 'Findings…'} className="h-7 text-sm flex-1" />
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-[hsl(var(--muted)/0.2)] rounded-xl border border-[hsl(var(--border))] p-4">
            <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-3">Vital Signs</p>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="BP Systolic"><Input type="number" value={data.bp_systolic || ''} onChange={e => set('bp_systolic', e.target.value)} placeholder="mmHg" /></FormField>
              <FormField label="BP Diastolic"><Input type="number" value={data.bp_diastolic || ''} onChange={e => set('bp_diastolic', e.target.value)} placeholder="mmHg" /></FormField>
              <FormField label="Pulse Rate"><Input type="number" value={data.pulse_rate || ''} onChange={e => set('pulse_rate', e.target.value)} placeholder="bpm" /></FormField>
              <FormField label="Respiration"><Input type="number" value={data.respiration || ''} onChange={e => set('respiration', e.target.value)} placeholder="cpm" /></FormField>
              <FormField label="Temperature" className="col-span-2"><Input type="number" step="0.1" value={data.temperature || ''} onChange={e => set('temperature', e.target.value)} placeholder="°C" /></FormField>
            </div>
          </div>

          <div className="bg-[hsl(var(--muted)/0.2)] rounded-xl border border-[hsl(var(--border))] p-4">
            <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-3">Visual Acuity</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))]">
                    <th className="text-left pb-2 text-xs text-[hsl(var(--muted-foreground))]"></th>
                    {VA_COLS.map(c => <th key={c} className="text-center pb-2 text-xs text-[hsl(var(--muted-foreground))] font-semibold">{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {VA_ROWS.map(r => (
                    <tr key={r} className="border-b border-[hsl(var(--border)/0.3)] last:border-0 hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
                      <td className="py-2 text-xs font-medium text-[hsl(var(--muted-foreground))] pr-3">{r}</td>
                      {VA_COLS.map(c => (
                        <td key={c} className="py-2 px-1">
                          <Input value={va[`${r}_${c}`] || ''} onChange={e => setVA(r, c, e.target.value)} className="h-7 text-xs text-center" placeholder="20/—" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[hsl(var(--muted)/0.2)] rounded-xl border border-[hsl(var(--border))] p-4">
            <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-3">Ishihara Color Vision</p>
            <div className="flex items-center gap-4">
              {['Normal', 'Defective'].map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="ishihara" value={opt} checked={data.ishihara === opt} onChange={() => set('ishihara', opt)} className="w-4 h-4 accent-[hsl(var(--primary))]" />
                  <span className="text-sm font-medium">{opt}</span>
                </label>
              ))}
              <Button variant="ghost" size="sm" className="text-[hsl(var(--muted-foreground))] text-xs" onClick={() => set('ishihara', '')}>✕ Clear</Button>
            </div>
          </div>

          {patient?.gender === 'Female' && (
            <div className="bg-[hsl(var(--muted)/0.2)] rounded-xl border border-[hsl(var(--border))] p-4">
              <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-3">OB / Gyne</p>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="LMP"><Input type="date" value={data.lmp || ''} onChange={e => set('lmp', e.target.value)} /></FormField>
                <FormField label="OB Score"><Input value={data.ob_score || ''} onChange={e => set('ob_score', e.target.value)} placeholder="G_P_" /></FormField>
                <FormField label="Interval"><Input value={data.interval || ''} onChange={e => set('interval', e.target.value)} /></FormField>
                <FormField label="Duration"><Input value={data.duration || ''} onChange={e => set('duration', e.target.value)} /></FormField>
                <FormField label="Dysmenorrhea" className="col-span-2"><Input value={data.dysmenorrhea || ''} onChange={e => set('dysmenorrhea', e.target.value)} /></FormField>
              </div>
            </div>
          )}

          <div className="bg-[hsl(var(--muted)/0.2)] rounded-xl border border-[hsl(var(--border))] p-4">
            <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-3">Dental</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {['Upper Right', 'Upper Left', 'Lower Right', 'Lower Left'].map(q => (
                <FormField key={q} label={q}>
                  <Input value={data[`dental_${q.toLowerCase().replace(' ', '_')}`] || ''}
                    onChange={e => set(`dental_${q.toLowerCase().replace(' ', '_')}`, e.target.value)}
                    placeholder="Tooth chart" className="h-8 text-sm" />
                </FormField>
              ))}
            </div>
            <div className="space-y-2">
              {['Oral Prophylaxis', 'Fillings', 'Extraction'].map(item => (
                <div key={item} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-[hsl(var(--accent)/0.4)] transition-colors">
                  <Checkbox checked={!!(data[`dental_${item.toLowerCase().replace(' ', '_')}`])}
                    onCheckedChange={v => set(`dental_${item.toLowerCase().replace(' ', '_')}`, v)} />
                  <span className="text-sm w-32">{item}</span>
                  <Input value={data[`dental_${item.toLowerCase().replace(' ', '_')}_detail`] || ''}
                    onChange={e => set(`dental_${item.toLowerCase().replace(' ', '_')}_detail`, e.target.value)}
                    className="h-7 text-sm flex-1" placeholder="Details…" />
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <FormField label="Others"><Input value={data.dental_others || ''} onChange={e => set('dental_others', e.target.value)} /></FormField>
              <FormField label="Attending Dentist"><Input value={data.attending_dentist || ''} onChange={e => set('attending_dentist', e.target.value)} /></FormField>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
