"use client"

import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { CheckCheck, Eraser } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FollowUpReminder } from '@/components/ui/FollowUpReminder'
import { usePatient } from '@/lib/patient-context'

const EVALUATIONS = [
  { value: 'A', label: 'Class A', description: 'Fit for work', color: 'success' },
  { value: 'B', label: 'Class B', description: 'Fit with minor defects', color: 'warning' },
  { value: 'C', label: 'Class C', description: "At management's discretion", color: 'orange' },
  { value: 'pending', label: 'Pending', description: 'Awaiting results', color: 'muted' },
]

const NORMAL_VALUES = {
  evaluation: 'A',
  remarks: 'Fit for work',
  recommendations: '',
  for_clearance: false,
}

export default function Evaluation({ data, onChange }: { data: any; onChange: (v: any) => void }) {
  const set = (k: string, v: any) => onChange({ ...data, [k]: v })
  const { selectedPatient } = usePatient()

  const getStatusStyle = (color: string, isSelected: boolean) => {
    if (!isSelected) return 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent)/0.5)]'
    switch (color) {
      case 'success': return 'border-[hsl(var(--success))] bg-[hsl(var(--success-muted))] text-[hsl(var(--success))] font-semibold'
      case 'warning': return 'border-yellow-400 bg-yellow-50 text-yellow-700 font-semibold'
      case 'orange': return 'border-orange-400 bg-orange-50 text-orange-700 font-semibold'
      case 'muted': return 'border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] font-semibold'
      default: return ''
    }
  }

  return (
    <div className="bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
        <h3 className="text-sm font-semibold text-[hsl(var(--primary))]">Section IV — Evaluation</h3>
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

      <table className="w-full text-left">
        <tbody>
          <tr className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
            <td colSpan={2} className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Evaluation Class</td>
          </tr>
          <tr className="border-b border-[hsl(var(--border))]">
            <td colSpan={2} className="px-4 py-3">
              <div className="flex flex-wrap gap-2">
                {EVALUATIONS.map(e => {
                  const isSelected = data.evaluation === e.value
                  return (
                    <button
                      key={e.value}
                      type="button"
                      onClick={() => set('evaluation', isSelected ? '' : e.value)}
                      className={cn(
                        'px-4 py-2 rounded-lg border text-sm transition-all cursor-pointer',
                        getStatusStyle(e.color, isSelected)
                      )}
                    >
                      {e.label} — {e.description}
                    </button>
                  )
                })}
              </div>
            </td>
          </tr>

          <tr className="bg-[hsl(var(--muted)/0.5)] border-b border-[hsl(var(--border))]">
            <td colSpan={2} className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Details</td>
          </tr>
          <tr className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
            <td className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] w-[40%]">Remarks</td>
            <td className="px-4 py-2.5">
              <Input value={data.remarks || ''} onChange={e => set('remarks', e.target.value)} placeholder="Additional remarks…" className="h-8 text-sm" />
            </td>
          </tr>
          <tr className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
            <td className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] w-[40%]">Recommendations</td>
            <td className="px-4 py-2.5">
              <Input value={data.recommendations || ''} onChange={e => set('recommendations', e.target.value)} placeholder="Recommendations…" className="h-8 text-sm" />
            </td>
          </tr>
          <tr className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
            <td className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] w-[40%]">For Clearance</td>
            <td className="px-4 py-2.5">
              <div className="flex items-center gap-3">
                <Checkbox checked={!!data.for_clearance} onCheckedChange={v => set('for_clearance', v)} />
                <span className="text-sm">{data.for_clearance ? 'Yes — Patient requires medical clearance' : 'No'}</span>
              </div>
            </td>
          </tr>

          {/* Follow-up reminder row */}
          {selectedPatient && (
            <tr className="hover:bg-[hsl(var(--accent)/0.3)] transition-colors">
              <td className="px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] w-[40%]">Follow-up Reminder</td>
              <td className="px-4 py-2.5">
                <FollowUpReminder
                  patientId={selectedPatient.id}
                  patientName={`${selectedPatient.last_name}, ${selectedPatient.first_name}`}
                  forClearance={!!data.for_clearance}
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
