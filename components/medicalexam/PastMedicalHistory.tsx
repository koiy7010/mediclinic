"use client"

import { SectionCard, FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

const CONDITIONS = [
  'Allergies', 'Chickenpox', 'Diabetes', 'Epilepsy', 'Measles', 'Cancer',
  'Hernia', 'Kidney Disease', 'Thyroid', 'Gastritis', 'Heart Disease', 'Hepatitis',
  'Hypertension', 'PTB', 'Vertigo', 'Psychological Disorder', 'Asthma', 'Arthritis',
  'Anemia', 'Migraine', 'Hyperlipidemia'
]

export default function PastMedicalHistory({ data, onChange }: { data: any; onChange: (v: any) => void }) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v })
  const conditions = data.conditions || {}
  const setCondition = (c: string, v: any) => set('conditions', { ...conditions, [c]: v })

  return (
    <SectionCard title="Section I — Past Medical History">
      <div className="space-y-5">
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          <span className="font-semibold text-[hsl(var(--primary))]">✓ Checked</span> = Condition not present &nbsp;|&nbsp;
          <span className="font-semibold text-[hsl(var(--destructive))]">Unchecked</span> = Flagged / Present
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CONDITIONS.map(c => (
            <label key={c} className="flex items-center gap-2 cursor-pointer group px-2 py-1.5 rounded-lg hover:bg-[hsl(var(--accent)/0.5)] transition-colors">
              <Checkbox id={`cond-${c}`} checked={conditions[c] !== false} onCheckedChange={v => setCondition(c, v)} />
              <span className="text-sm group-hover:text-[hsl(var(--foreground))] text-[hsl(var(--muted-foreground))]">{c}</span>
            </label>
          ))}
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
