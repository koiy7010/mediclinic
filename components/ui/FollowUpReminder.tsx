"use client"

import { useState } from 'react'
import { Calendar, Plus, X, Bell } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'
import { cn } from '@/lib/utils'
import { addFollowUpReminder, createClearanceReminder } from '@/lib/notifications'
import { toast } from '@/lib/use-toast'
import { format, addDays, addWeeks, addMonths } from 'date-fns'

interface FollowUpReminderProps {
  patientId: string
  patientName: string
  forClearance?: boolean
  className?: string
}

const QUICK_DATES = [
  { label: '1 Week', getValue: () => format(addWeeks(new Date(), 1), 'yyyy-MM-dd') },
  { label: '2 Weeks', getValue: () => format(addWeeks(new Date(), 2), 'yyyy-MM-dd') },
  { label: '1 Month', getValue: () => format(addMonths(new Date(), 1), 'yyyy-MM-dd') },
  { label: '3 Months', getValue: () => format(addMonths(new Date(), 3), 'yyyy-MM-dd') },
]

export function FollowUpReminder({ patientId, patientName, forClearance, className }: FollowUpReminderProps) {
  const [showForm, setShowForm] = useState(false)
  const [reason, setReason] = useState(forClearance ? 'Medical clearance follow-up' : '')
  const [dueDate, setDueDate] = useState(format(addWeeks(new Date(), 1), 'yyyy-MM-dd'))
  const [notes, setNotes] = useState('')

  const handleSubmit = () => {
    if (!reason || !dueDate) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' })
      return
    }

    if (forClearance) {
      createClearanceReminder(patientId, patientName, reason, dueDate, notes)
    } else {
      addFollowUpReminder({
        patientId,
        patientName,
        reason,
        dueDate,
        notes,
      })
    }

    toast({ title: 'Follow-up reminder created', variant: 'success' })
    setShowForm(false)
    setReason(forClearance ? 'Medical clearance follow-up' : '')
    setNotes('')
  }

  return (
    <div className={cn("", className)}>
      {!showForm ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(true)}
          className={cn(
            forClearance && "border-amber-300 text-amber-700 hover:bg-amber-50"
          )}
        >
          <Bell className="w-4 h-4 mr-1.5" />
          {forClearance ? 'Set Clearance Reminder' : 'Add Follow-up'}
        </Button>
      ) : (
        <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[hsl(var(--primary))]" />
              <span className="font-semibold text-sm">
                {forClearance ? 'Clearance Reminder' : 'Follow-up Reminder'}
              </span>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase">
                Reason <span className="text-red-500">*</span>
              </label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Blood pressure check, Lab results review"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase">
                Due Date <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="flex-1"
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {QUICK_DATES.map((qd) => (
                  <button
                    key={qd.label}
                    onClick={() => setDueDate(qd.getValue())}
                    className="px-2 py-1 text-xs rounded-md bg-[hsl(var(--muted))] hover:bg-[hsl(var(--accent))] transition-colors cursor-pointer"
                  >
                    {qd.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={2}
                className="mt-1 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit}>
              <Plus className="w-4 h-4 mr-1" />
              Create Reminder
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FollowUpReminder
