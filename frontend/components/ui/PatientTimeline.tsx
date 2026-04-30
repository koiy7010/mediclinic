"use client"

import { useState } from 'react'
import { format } from 'date-fns'
import { 
  FlaskConical, Stethoscope, RadioTower, ScanLine, Zap, 
  ChevronDown, ChevronUp, X, Eye, Calendar, Clock,
  AlertTriangle, CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

export interface TimelineEvent {
  id: string
  type: 'lab' | 'medical-exam' | 'xray' | 'utz' | 'ecg'
  subtype?: string // e.g., 'Urinalysis', 'Hematology'
  date: string
  title: string
  summary?: string
  isNormal?: boolean
  data?: any
}

interface PatientTimelineProps {
  events: TimelineEvent[]
  onEventClick?: (event: TimelineEvent) => void
  className?: string
}

const TYPE_CONFIG = {
  lab: { icon: FlaskConical, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Laboratory' },
  'medical-exam': { icon: Stethoscope, color: 'text-green-600', bg: 'bg-green-100', label: 'Medical Exam' },
  xray: { icon: RadioTower, color: 'text-purple-600', bg: 'bg-purple-100', label: 'X-Ray' },
  utz: { icon: ScanLine, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Ultrasound' },
  ecg: { icon: Zap, color: 'text-red-600', bg: 'bg-red-100', label: 'ECG' },
}

export function PatientTimeline({ events, onEventClick, className }: PatientTimelineProps) {
  const [expandedYear, setExpandedYear] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)

  // Group events by year
  const eventsByYear = events.reduce((acc, event) => {
    const year = new Date(event.date).getFullYear().toString()
    if (!acc[year]) acc[year] = []
    acc[year].push(event)
    return acc
  }, {} as Record<string, TimelineEvent[]>)

  // Sort years descending
  const years = Object.keys(eventsByYear).sort((a, b) => parseInt(b) - parseInt(a))

  // Auto-expand current year
  if (expandedYear === null && years.length > 0) {
    setExpandedYear(years[0])
  }

  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event)
    onEventClick?.(event)
  }

  return (
    <div className={cn("relative", className)}>
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[hsl(var(--border))]" />

      {years.map(year => (
        <div key={year} className="mb-4">
          {/* Year header */}
          <button
            onClick={() => setExpandedYear(expandedYear === year ? null : year)}
            className="relative z-10 flex items-center gap-2 mb-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary))] text-white flex items-center justify-center text-xs font-bold">
              {year.slice(2)}
            </div>
            <span className="font-semibold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">
              {year}
            </span>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              ({eventsByYear[year].length} records)
            </span>
            {expandedYear === year ? (
              <ChevronUp className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            )}
          </button>

          {/* Events for this year */}
          {expandedYear === year && (
            <div className="ml-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              {eventsByYear[year]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(event => {
                  const config = TYPE_CONFIG[event.type]
                  const Icon = config.icon

                  return (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className="relative pl-6 cursor-pointer group"
                    >
                      {/* Connector dot */}
                      <div className={cn(
                        "absolute left-0 top-3 w-2 h-2 rounded-full border-2 border-white",
                        event.isNormal === false ? 'bg-amber-500' : 'bg-[hsl(var(--primary))]'
                      )} />

                      {/* Event card */}
                      <div className={cn(
                        "p-3 rounded-lg border transition-all",
                        "hover:shadow-md hover:border-[hsl(var(--primary)/0.3)]",
                        "bg-[hsl(var(--card))] border-[hsl(var(--border))]"
                      )}>
                        <div className="flex items-start gap-3">
                          <div className={cn("p-2 rounded-lg", config.bg)}>
                            <Icon className={cn("w-4 h-4", config.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">{event.title}</span>
                              {event.isNormal !== undefined && (
                                event.isNormal ? (
                                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                )
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                              <Calendar className="w-3 h-3" />
                              <span>{format(new Date(event.date), 'MMM dd, yyyy')}</span>
                              {event.subtype && (
                                <>
                                  <span>•</span>
                                  <span>{event.subtype}</span>
                                </>
                              )}
                            </div>
                            {event.summary && (
                              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] line-clamp-2">
                                {event.summary}
                              </p>
                            )}
                          </div>
                          <Eye className="w-4 h-4 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      ))}

      {events.length === 0 && (
        <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No records found</p>
        </div>
      )}

      {/* Preview Modal */}
      {selectedEvent && (
        <TimelinePreviewModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  )
}

interface TimelinePreviewModalProps {
  event: TimelineEvent
  onClose: () => void
}

function TimelinePreviewModal({ event, onClose }: TimelinePreviewModalProps) {
  const config = TYPE_CONFIG[event.type]
  const Icon = config.icon

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-150"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[80vh] bg-[hsl(var(--card))] rounded-xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className={cn("px-5 py-4 border-b border-[hsl(var(--border))]", config.bg)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className={cn("w-5 h-5", config.color)} />
              <div>
                <h3 className="font-semibold">{event.title}</h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {format(new Date(event.date), 'MMMM dd, yyyy')}
                  {event.subtype && ` • ${event.subtype}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[60vh]">
          {event.isNormal !== undefined && (
            <div className={cn(
              "mb-4 px-4 py-3 rounded-lg flex items-center gap-2",
              event.isNormal 
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            )}>
              {event.isNormal ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              <span className="font-medium">
                {event.isNormal ? 'Results within normal range' : 'Abnormal findings detected'}
              </span>
            </div>
          )}

          {event.summary && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase mb-2">Summary</h4>
              <p className="text-sm">{event.summary}</p>
            </div>
          )}

          {event.data && (
            <div>
              <h4 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase mb-2">Details</h4>
              <div className="bg-[hsl(var(--muted)/0.3)] rounded-lg p-4">
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(event.data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[hsl(var(--border))] flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button size="sm">
            View Full Report
          </Button>
        </div>
      </div>
    </>
  )
}

export default PatientTimeline
