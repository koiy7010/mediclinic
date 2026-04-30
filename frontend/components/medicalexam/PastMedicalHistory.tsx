"use client"

import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { CheckCheck, Eraser } from 'lucide-react'

const CONDITIONS = [
  'Allergies', 'Chickenpox', 'Diabetes', 'Epilepsy', 'Measles', 'Cancer',
  'Hernia', 'Kidney Disease', 'Thyroid', 'Gastritis', 'Heart Disease', 'Hepatitis',
  'Hypertension', 'PTB', 'Vertigo', 'Psychological Disorder', 'Asthma', 'Arthritis',
  'Anemia', 'Migraine', 'Hyperlipidemia'
]

const NORMAL_VALUES = {
  conditions: {},
  other_conditions: '',
  present_illness: '',
  medications: '',
  allergies: '',
  operations: '',
  smoker: false,
  alcohol: false,
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

export default function PastMedicalHistory({ data, onChange }: { data: any; onChange: (v: any) => void }) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v })
  const conditions = data.conditions || {}
  const setCondition = (c: string, v: any) => set('conditions', { ...conditions, [c]: v })

  return (
    <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
        <h3 className="text-sm font-semibold text-[hsl(var(--primary))]">Section I — Past Medical History</h3>
        <QuickActions onNormal={() => onChange({ ...NORMAL_VALUES })} onClear={() => onChange({})} />
      </div>

      <table className="w-full text-left">
        <tbody>
          {/* Conditions header */}
          <tr className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
            <td colSpan={2} className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
              Medical Conditions
            </td>
          </tr>
          <tr className="border-b border-[hsl(var(--border))]">
            <td colSpan={2} className="px-4 py-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {CONDITIONS.map(c => {
                  const flagged = !!conditions[c]
                  return (
                    <label
                      key={c}
                      className={`flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded text-sm transition-colors ${
                        flagged
                          ? 'bg-[hsl(var(--destructive)/0.08)] text-[hsl(var(--destructive))] font-medium'
                          : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent)/0.5)]'
                      }`}
                    >
                      <Checkbox checked={flagged} onCheckedChange={v => setCondition(c, v)} />
                      <span>{c}</span>
                    </label>
                  )
                })}
              </div>
            </td>
          </tr>

          {/* Additional details */}
          <tr className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
            <td colSpan={2} className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
              Additional Details
            </td>
          </tr>
          {[
            { label: 'Other Conditions', key: 'other_conditions' },
            { label: 'Present Illness', key: 'present_illness' },
            { label: 'Current Medications', key: 'medications' },
            { label: 'Allergies (detail)', key: 'allergies' },
            { label: 'Operations / Hospitalizations', key: 'operations' },
          ].map(f => (
            <tr key={f.key} className="border-b border-[hsl(var(--border))] last:border-b-0 hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
              <td className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] w-[40%] whitespace-nowrap">{f.label}</td>
              <td className="px-4 py-2.5">
                <Input value={data[f.key] || ''} onChange={e => set(f.key, e.target.value)} className="h-8 text-sm" />
              </td>
            </tr>
          ))}

          {/* Social History */}
          <tr className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
            <td colSpan={2} className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
              Social History
            </td>
          </tr>
          <tr className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
            <td className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] w-[40%]">Smoker</td>
            <td className="px-4 py-2.5">
              <div className="flex items-center gap-3">
                <Checkbox checked={!!data.smoker} onCheckedChange={v => set('smoker', v)} />
                <span className="text-sm">{data.smoker ? 'Yes' : 'No'}</span>
                {data.smoker && (
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">Packs/day:</span>
                    <Input type="number" step="0.5" value={data.packs_per_day || ''} onChange={e => set('packs_per_day', e.target.value)} className="w-20 h-7 text-sm" />
                  </div>
                )}
              </div>
            </td>
          </tr>
          <tr className="hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
            <td className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] w-[40%]">Alcohol Drinker</td>
            <td className="px-4 py-2.5">
              <div className="flex items-center gap-3">
                <Checkbox checked={!!data.alcohol} onCheckedChange={v => set('alcohol', v)} />
                <span className="text-sm">{data.alcohol ? 'Yes' : 'No'}</span>
                {data.alcohol && (
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">Years:</span>
                    <Input type="number" value={data.alcohol_years || ''} onChange={e => set('alcohol_years', e.target.value)} className="w-20 h-7 text-sm" />
                  </div>
                )}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
