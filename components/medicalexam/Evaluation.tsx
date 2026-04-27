"use client"

import { SectionCard, FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { CheckCheck, Eraser, CircleCheck, CircleAlert, CircleMinus, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const EVALUATIONS = [
  { value: 'A', label: 'Class A', description: 'Fit for work', icon: CircleCheck, color: 'success' },
  { value: 'B', label: 'Class B', description: 'Fit with minor defects', icon: CircleAlert, color: 'warning' },
  { value: 'C', label: 'Class C', description: "At management's discretion", icon: CircleMinus, color: 'orange' },
  { value: 'pending', label: 'Pending', description: 'Awaiting results', icon: Clock, color: 'muted' },
]

const NORMAL_VALUES = {
  evaluation: 'A',
  remarks: 'Fit for work',
  recommendations: '',
  for_clearance: false,
}

export default function Evaluation({ data, onChange }: { data: any; onChange: (v: any) => void }) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v })

  const getColorClasses = (color: string, isSelected: boolean) => {
    if (!isSelected) {
      return 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent)/0.5)] hover:border-[hsl(var(--primary)/0.3)]'
    }
    switch (color) {
      case 'success':
        return 'border-[hsl(var(--success))] bg-[hsl(var(--success-muted))] text-[hsl(var(--success))] ring-2 ring-[hsl(var(--success)/0.3)] ring-offset-1'
      case 'warning':
        return 'border-yellow-400 bg-yellow-50 text-yellow-700 ring-2 ring-yellow-200 ring-offset-1'
      case 'orange':
        return 'border-orange-400 bg-orange-50 text-orange-700 ring-2 ring-orange-200 ring-offset-1'
      case 'muted':
        return 'border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] ring-2 ring-[hsl(var(--border))] ring-offset-1'
      default:
        return ''
    }
  }

  const getIconColor = (color: string, isSelected: boolean) => {
    if (!isSelected) return 'text-[hsl(var(--muted-foreground))]'
    switch (color) {
      case 'success': return 'text-[hsl(var(--success))]'
      case 'warning': return 'text-yellow-600'
      case 'orange': return 'text-orange-600'
      case 'muted': return 'text-[hsl(var(--foreground))]'
      default: return ''
    }
  }

  return (
    <SectionCard title="Section IV — Evaluation">
      <div className="space-y-5">
        {/* Header with buttons */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Select Evaluation Class</p>
          <div className="flex items-center rounded-lg border border-[hsl(var(--border))] overflow-hidden">
            <Button variant="ghost" size="sm" onClick={() => onChange({ ...NORMAL_VALUES })}
              className="rounded-none border-r border-[hsl(var(--border))] text-[hsl(var(--success))] hover:bg-[hsl(var(--success-muted))] hover:text-[hsl(var(--success))]">
              <CheckCheck className="w-3.5 h-3.5 mr-1" /> Class A
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onChange({})}
              className="rounded-none text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]">
              <Eraser className="w-3.5 h-3.5 mr-1" /> Clear
            </Button>
          </div>
        </div>
        
        {/* Evaluation cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {EVALUATIONS.map(e => {
            const isSelected = data.evaluation === e.value
            const Icon = e.icon
            return (
              <button
                key={e.value}
                type="button"
                onClick={() => set('evaluation', isSelected ? '' : e.value)}
                className={cn(
                  'relative flex flex-col items-center p-4 rounded-xl border-2 transition-all cursor-pointer text-center',
                  getColorClasses(e.color, isSelected)
                )}
              >
                <Icon className={cn('w-8 h-8 mb-2', getIconColor(e.color, isSelected))} />
                <span className="font-bold text-sm">{e.label}</span>
                <span className={cn(
                  'text-xs mt-1',
                  isSelected ? 'opacity-90' : 'text-[hsl(var(--muted-foreground))]'
                )}>
                  {e.description}
                </span>
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCheck className="w-4 h-4" />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t border-[hsl(var(--border))]">
          <FormField label="Remarks">
            <Input value={data.remarks || ''} onChange={e => set('remarks', e.target.value)} placeholder="Additional remarks…" />
          </FormField>

          <FormField label="Recommendations">
            <Input value={data.recommendations || ''} onChange={e => set('recommendations', e.target.value)} placeholder="Recommendations for the patient…" />
          </FormField>
        </div>

        {/* For Clearance checkbox */}
        <div className="pt-2">
          <label className={cn(
            'inline-flex items-center gap-3 cursor-pointer px-4 py-3 rounded-xl border-2 transition-all',
            data.for_clearance 
              ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)] text-[hsl(var(--primary))]' 
              : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--accent)/0.5)] hover:border-[hsl(var(--primary)/0.3)]'
          )}>
            <Checkbox checked={!!data.for_clearance} onCheckedChange={v => set('for_clearance', v)} />
            <div>
              <span className="text-sm font-semibold">For Clearance</span>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Patient requires medical clearance</p>
            </div>
          </label>
        </div>
      </div>
    </SectionCard>
  )
}
