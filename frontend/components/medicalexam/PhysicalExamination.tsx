"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { CheckCheck, Eraser, ChevronDown } from 'lucide-react'

const BODY_SYSTEMS = [
  'Head / Scalp', 'Eyes', 'Ears', 'Nose', 'Neck / Throat',
  'Chest / Breasts', 'Lungs', 'Heart', 'Abdomen', 'Back',
  'Genitals', 'Extremities', 'Skin', 'Anus',
]
const VA_ROWS = ['OD (Right)', 'OS (Left)', 'OU (Both)']
const VA_COLS = ['w/o Glasses', 'w/ Glasses', 'Near']

const NORMAL_VALUES = {
  bp_systolic: '120',
  bp_diastolic: '80',
  pulse_rate: '72',
  respiration: '18',
  temperature: '36.5',
  ishihara: 'Normal',
  systems: BODY_SYSTEMS.reduce((acc, s) => ({ ...acc, [s]: { normal: true, findings: '' } }), {}),
  visual_acuity: {
    'OD (Right)_w/o Glasses': '20/20',
    'OS (Left)_w/o Glasses': '20/20',
    'OU (Both)_w/o Glasses': '20/20',
  },
}

function QuickActions({ onNormal, onClear }: { onNormal: () => void; onClear: () => void }) {
  return (
    <div className="flex items-center rounded-lg border border-[hsl(var(--border))] overflow-hidden">
      <Button variant="ghost" size="sm" onClick={onNormal}
        className="rounded-none border-r border-[hsl(var(--border))] text-[hsl(var(--success))] hover:bg-[hsl(var(--success-muted))] hover:text-[hsl(var(--success))]">
        <CheckCheck className="w-3.5 h-3.5 mr-1" /> Normal
      </Button>
      <Button variant="ghost" size="sm" onClick={onClear}
        className="rounded-none text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]">
        <Eraser className="w-3.5 h-3.5 mr-1" /> Clear
      </Button>
    </div>
  )
}

export default function PhysicalExamination({ data, patient, onChange }: { data: any; patient: any; onChange: (v: any) => void }) {
  const [dentalOpen, setDentalOpen] = useState(false)
  const [obGyneOpen, setObGyneOpen] = useState(false)
  const set = (k: string, v: any) => onChange({ ...data, [k]: v })
  const systems = data.systems || {}
  const va = data.visual_acuity || {}
  const setSystem = (s: string, k: string, v: any) => set('systems', { ...systems, [s]: { ...(systems[s] || {}), [k]: v } })
  const setVA = (r: string, c: string, v: any) => set('visual_acuity', { ...va, [`${r}_${c}`]: v })

  return (
    <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
        <h3 className="text-sm font-semibold text-[hsl(var(--primary))]">Section II — Physical Examination</h3>
        <QuickActions onNormal={() => onChange({ ...data, ...NORMAL_VALUES })} onClear={() => onChange({})} />
      </div>

      <table className="w-full text-left">
        <tbody>
          {/* Vital Signs */}
          <tr className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
            <td colSpan={2} className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Vital Signs</td>
          </tr>
          {[
            { label: 'BP Systolic (mmHg)', key: 'bp_systolic', placeholder: 'mmHg' },
            { label: 'BP Diastolic (mmHg)', key: 'bp_diastolic', placeholder: 'mmHg' },
            { label: 'Pulse Rate (bpm)', key: 'pulse_rate', placeholder: 'bpm' },
            { label: 'Respiration (cpm)', key: 'respiration', placeholder: 'cpm' },
            { label: 'Temperature (°C)', key: 'temperature', placeholder: '°C' },
          ].map(f => (
            <tr key={f.key} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
              <td className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] w-[40%] whitespace-nowrap">{f.label}</td>
              <td className="px-4 py-2.5">
                <Input type="number" step={f.key === 'temperature' ? '0.1' : undefined} value={data[f.key] || ''} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} className="max-w-[200px] h-8 text-sm" />
              </td>
            </tr>
          ))}

          {/* Body Systems */}
          <tr className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
            <td className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Body System</td>
            <td className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
              <div className="flex items-center gap-8">
                <span className="w-16 text-center">Normal</span>
                <span>Findings</span>
              </div>
            </td>
          </tr>
          {BODY_SYSTEMS.map(s => {
            const sys = systems[s] || {}
            return (
              <tr key={s} className="border-b border-[hsl(var(--border))] last:border-b-0 hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
                <td className="px-4 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] w-[40%]">{s}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-8">
                    <div className="w-16 flex justify-center">
                      <Checkbox checked={!!sys.normal} onCheckedChange={v => setSystem(s, 'normal', v)} />
                    </div>
                    <Input value={sys.findings || ''} onChange={e => setSystem(s, 'findings', e.target.value)}
                      disabled={!!sys.normal} placeholder={sys.normal ? 'Normal' : 'Findings…'} className="h-7 text-sm flex-1" />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Visual Acuity table */}
      <table className="w-full text-left border-t border-[hsl(var(--border))]">
        <thead>
          <tr className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
            <th className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Visual Acuity</th>
            {VA_COLS.map(c => <th key={c} className="px-3 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide text-center">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {VA_ROWS.map(r => (
            <tr key={r} className="border-b border-[hsl(var(--border))] last:border-b-0 hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
              <td className="px-4 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))]">{r}</td>
              {VA_COLS.map(c => (
                <td key={c} className="px-3 py-2">
                  <Input value={va[`${r}_${c}`] || ''} onChange={e => setVA(r, c, e.target.value)} className="h-7 text-xs text-center" placeholder="20/—" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Ishihara + OB/Gyne + Dental in table rows */}
      <table className="w-full text-left border-t border-[hsl(var(--border))]">
        <tbody>
          <tr className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
            <td colSpan={2} className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Ishihara Color Vision</td>
          </tr>
          <tr className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
            <td className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] w-[40%]">Result</td>
            <td className="px-4 py-2.5">
              <div className="flex items-center gap-4">
                {['Normal', 'Defective'].map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="ishihara" value={opt} checked={data.ishihara === opt} onChange={() => set('ishihara', opt)} className="w-4 h-4 accent-[hsl(var(--primary))]" />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
                {data.ishihara && (
                  <button type="button" onClick={() => set('ishihara', '')} className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] cursor-pointer">✕ Clear</button>
                )}
              </div>
            </td>
          </tr>

          {patient?.gender === 'Female' && (
            <>
              <tr className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
                <td colSpan={2} className="px-4 py-0">
                  <button
                    type="button"
                    onClick={() => setObGyneOpen(!obGyneOpen)}
                    className="w-full flex items-center justify-between py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide cursor-pointer hover:text-[hsl(var(--foreground))] transition-colors"
                  >
                    <span>OB / Gyne</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${obGyneOpen ? 'rotate-180' : ''}`} />
                  </button>
                </td>
              </tr>
              {obGyneOpen && [
                { label: 'LMP', key: 'lmp', type: 'date' },
                { label: 'OB Score', key: 'ob_score', placeholder: 'G_P_' },
                { label: 'Interval', key: 'interval' },
                { label: 'Duration', key: 'duration' },
                { label: 'Dysmenorrhea', key: 'dysmenorrhea' },
              ].map(f => (
                <tr key={f.key} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
                  <td className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] w-[40%]">{f.label}</td>
                  <td className="px-4 py-2.5">
                    <Input type={f.type || 'text'} value={data[f.key] || ''} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} className="max-w-[200px] h-8 text-sm" />
                  </td>
                </tr>
              ))}
            </>
          )}

          {/* Dental */}
          <tr className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
            <td colSpan={2} className="px-4 py-0">
              <button
                type="button"
                onClick={() => setDentalOpen(!dentalOpen)}
                className="w-full flex items-center justify-between py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide cursor-pointer hover:text-[hsl(var(--foreground))] transition-colors"
              >
                <span>Dental</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${dentalOpen ? 'rotate-180' : ''}`} />
              </button>
            </td>
          </tr>
          {dentalOpen && (
            <>
              {['Upper Right', 'Upper Left', 'Lower Right', 'Lower Left'].map(q => (
            <tr key={q} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
              <td className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] w-[40%]">{q}</td>
              <td className="px-4 py-2.5">
                <Input value={data[`dental_${q.toLowerCase().replace(' ', '_')}`] || ''}
                  onChange={e => set(`dental_${q.toLowerCase().replace(' ', '_')}`, e.target.value)}
                  placeholder="Tooth chart" className="max-w-[200px] h-8 text-sm" />
              </td>
            </tr>
          ))}
          {['Oral Prophylaxis', 'Fillings', 'Extraction'].map(item => (
            <tr key={item} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
              <td className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] w-[40%]">
                <div className="flex items-center gap-2">
                  <Checkbox checked={!!(data[`dental_${item.toLowerCase().replace(' ', '_')}`])}
                    onCheckedChange={v => set(`dental_${item.toLowerCase().replace(' ', '_')}`, v)} />
                  <span>{item}</span>
                </div>
              </td>
              <td className="px-4 py-2.5">
                <Input value={data[`dental_${item.toLowerCase().replace(' ', '_')}_detail`] || ''}
                  onChange={e => set(`dental_${item.toLowerCase().replace(' ', '_')}_detail`, e.target.value)}
                  placeholder="Details…" className="h-8 text-sm" />
              </td>
            </tr>
          ))}
          <tr className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
            <td className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] w-[40%]">Others</td>
            <td className="px-4 py-2.5"><Input value={data.dental_others || ''} onChange={e => set('dental_others', e.target.value)} className="h-8 text-sm" /></td>
          </tr>
          <tr className="hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
            <td className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] w-[40%]">Attending Dentist</td>
            <td className="px-4 py-2.5"><Input value={data.attending_dentist || ''} onChange={e => set('attending_dentist', e.target.value)} className="h-8 text-sm" /></td>
          </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}
