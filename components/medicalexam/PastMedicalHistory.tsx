"use client"

import { SectionCard, FormField } from '@/components/ui/FormField'
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

export default function PastMedicalHistory({ data, onChange }: { data: any; onChange: (v: any) => void }) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v })
  const conditions = data.conditions || {}
  const setCondition = (c: string, v: any) => set('conditions', { ...conditions, [c]: v })

  return (
    <SectionCard title="Section I — Past Medical History">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Check all conditions that apply to the patient.
          </p>
          <div className="flex items-center rounded-lg border border-[hsl(var(--border))] overflow-hidden">
            <Button variant="ghost" size="sm" onClick={() => onChange({ ...NORMAL_VALUES })}
              className="rounded-none border-r border-[hsl(var(--border))] text-[hsl(var(--success))] hover:bg-[hsl(var(--success-muted))] hover:text-[hsl(var(--success))]">
              <CheckCheck className="w-3.5 h-3.5 mr-1" /> Normal
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onChange({})}
              className="rounded-none text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]">
              <Eraser className="w-3.5 h-3.5 mr-1" /> Clear
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CONDITIONS.map(c => {
            const flagged = !!conditions[c]
            return (
              <label
                key={c}
                className={`flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-lg border transition-colors ${
                  flagged
                    ? 'bg-[hsl(var(--destructive)/0.08)] border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--destructive))]'
                    : 'border-transparent hover:bg-[hsl(var(--accent)/0.5)] text-[hsl(var(--muted-foreground))]'
                }`}
              >
                <Checkbox
                  id={`cond-${c}`}
                  checked={flagged}
                  onCheckedChange={v => setCondition(c, v)}
                />
                <span className="text-sm font-medium">{c}</span>
              </label>
            )
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[hsl(var(--border))]">
          <FormField label="Other Conditions"><Input value={data.other_conditions || ''} onChange={e => set('other_conditions', e.target.value)} /></FormField>
          <FormField label="Present Illness"><Input value={data.present_illness || ''} onChange={e => set('present_illness', e.target.value)} /></FormField>
          <FormField label="Current Medications"><Input value={data.medications || ''} onChange={e => set('medications', e.target.value)} /></FormField>
          <FormField label="Allergies (detail)"><Input value={data.allergies || ''} onChange={e => set('allergies', e.target.value)} /></FormField>
          <FormField label="Operations / Hospitalizations" className="sm:col-span-2">
            <Input value={data.operations || ''} onChange={e => set('operations', e.target.value)} />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[hsl(var(--border))]">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Social History</p>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-[hsl(var(--accent)/0.5)] transition-colors">
                <Checkbox checked={!!data.smoker} onCheckedChange={v => set('smoker', v)} />
                <span className="text-sm font-medium">Smoker</span>
              </label>
              {data.smoker && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">Packs/day:</span>
                  <Input type="number" step="0.5" value={data.packs_per_day || ''} onChange={e => set('packs_per_day', e.target.value)} className="w-20 h-8 text-sm" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-[hsl(var(--accent)/0.5)] transition-colors">
                <Checkbox checked={!!data.alcohol} onCheckedChange={v => set('alcohol', v)} />
                <span className="text-sm font-medium">Alcohol Drinker</span>
              </label>
              {data.alcohol && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">Years:</span>
                  <Input type="number" value={data.alcohol_years || ''} onChange={e => set('alcohol_years', e.target.value)} className="w-20 h-8 text-sm" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
