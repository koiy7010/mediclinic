"use client"

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ScrollText, Search, Filter, User, FlaskConical, Stethoscope,
  RadioTower, ScanLine, Zap, ConciergeBell, ClipboardCheck,
  Package, Eye, PenLine, Plus, ArrowRight, Mail, Globe, ChevronDown, Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api-client'

/* ── Types ── */
interface LogEntry {
  id: string
  timestamp: string
  action: 'created' | 'updated' | 'viewed' | 'released' | 'queued' | 'saved' | 'status_changed'
  module: string
  patientName: string
  patientId: string
  details: string
  user: string
}

/* ── Constants ── */
const MODULES = ['All', 'Information Desk', 'Patient Profile', 'Laboratory', 'Medical Exam', 'X-Ray', 'UTZ', 'ECG', 'Releasing']
const ACTIONS = ['All', 'created', 'updated', 'viewed', 'saved', 'queued', 'released', 'status_changed']

const ACTION_CONFIG: Record<string, { label: string; icon: typeof Plus; style: string }> = {
  created: { label: 'Created', icon: Plus, style: 'bg-[hsl(var(--success-muted))] text-[hsl(var(--success))] border-[hsl(var(--success)/0.3)]' },
  updated: { label: 'Updated', icon: PenLine, style: 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.3)]' },
  viewed: { label: 'Viewed', icon: Eye, style: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]' },
  saved: { label: 'Saved', icon: PenLine, style: 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.3)]' },
  queued: { label: 'Queued', icon: ArrowRight, style: 'bg-[hsl(var(--accent)/0.5)] text-[hsl(var(--accent-foreground))] border-[hsl(var(--accent))]' },
  released: { label: 'Released', icon: Package, style: 'bg-[hsl(var(--success-muted))] text-[hsl(var(--success))] border-[hsl(var(--success)/0.3)]' },
  status_changed: { label: 'Status Changed', icon: ArrowRight, style: 'bg-[hsl(var(--accent)/0.5)] text-[hsl(var(--accent-foreground))] border-[hsl(var(--accent))]' },
}

const MODULE_ICONS: Record<string, typeof FlaskConical> = {
  'Information Desk': ConciergeBell,
  'Patient Profile': User,
  'Laboratory': FlaskConical,
  'Medical Exam': Stethoscope,
  'X-Ray': RadioTower,
  'UTZ': ScanLine,
  'ECG': Zap,
  'Releasing': ClipboardCheck,
}

/* ── Action Badge ── */
function ActionBadge({ action }: { action: string }) {
  const config = ACTION_CONFIG[action]
  if (!config) return null
  const Icon = config.icon
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border", config.style)}>
      <Icon className="w-2.5 h-2.5" />
      {config.label}
    </span>
  )
}

/* ── Main Component ── */
export default function ActivityLogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [moduleFilter, setModuleFilter] = useState('All')
  const [actionFilter, setActionFilter] = useState('All')
  const [showFilters, setShowFilters] = useState(false)

  // Fetch activity logs from API
  const { data: logsResponse, isLoading, error } = useQuery({
    queryKey: ['activityLogs', moduleFilter, actionFilter, searchQuery],
    queryFn: () => apiClient.activityLogs.list({
      module: moduleFilter !== 'All' ? moduleFilter : undefined,
      action: actionFilter !== 'All' ? actionFilter : undefined,
      search: searchQuery || undefined,
      size: 100,
    }),
  })

  // Normalize API response data
  const normalizedLogs: LogEntry[] = (logsResponse?.content ?? []).map((log: any) => ({
    id: log.id,
    timestamp: log.timestamp || log.createdAt,
    action: log.action,
    module: log.module,
    patientName: log.patientName || log.patient_name,
    patientId: log.patientId || log.patient_id,
    details: log.details,
    user: log.user || 'System',
  }))

  const filtered = normalizedLogs.filter(log => {
    if (searchQuery) {
      const s = searchQuery.toLowerCase()
      return (
        log.patientName.toLowerCase().includes(s) ||
        log.patientId.toLowerCase().includes(s) ||
        log.details.toLowerCase().includes(s) ||
        log.user.toLowerCase().includes(s) ||
        log.module.toLowerCase().includes(s)
      )
    }
    return true
  })

  // Group by time blocks
  const groupByHour = (logs: LogEntry[]) => {
    const groups: { label: string; logs: LogEntry[] }[] = []
    let currentLabel = ''
    for (const log of logs) {
      const hour = format(new Date(log.timestamp), 'h:00 a')
      if (hour !== currentLabel) {
        currentLabel = hour
        groups.push({ label: hour, logs: [] })
      }
      groups[groups.length - 1].logs.push(log)
    }
    return groups
  }

  const grouped = groupByHour(filtered)
  const activeFilters = (moduleFilter !== 'All' ? 1 : 0) + (actionFilter !== 'All' ? 1 : 0)

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="max-w-4xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Page header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
            <ScrollText className="w-5 h-5 text-[hsl(var(--primary))]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">Activity Log</h1>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{format(new Date(), 'EEEE, MMMM dd, yyyy')} · {isLoading ? 'Loading...' : `${filtered.length} entries`}</p>
          </div>
        </div>

        {/* Search + Filter bar */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by patient, user, details…"
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-1.5" />
              Filters
              {activeFilters > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">{activeFilters}</span>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-4 p-3 bg-[hsl(var(--card))] rounded-lg border border-[hsl(var(--border))]">
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Module</p>
                <div className="flex flex-wrap gap-1">
                  {MODULES.map(m => (
                    <button
                      key={m}
                      onClick={() => setModuleFilter(m)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
                        moduleFilter === m
                          ? 'bg-[hsl(var(--primary))] text-white'
                          : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Action</p>
                <div className="flex flex-wrap gap-1">
                  {ACTIONS.map(a => (
                    <button
                      key={a}
                      onClick={() => setActionFilter(a)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer capitalize",
                        actionFilter === a
                          ? 'bg-[hsl(var(--primary))] text-white'
                          : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
                      )}
                    >
                      {a === 'All' ? 'All' : a === 'status_changed' ? 'Status' : a}
                    </button>
                  ))}
                </div>
              </div>
              {activeFilters > 0 && (
                <button
                  onClick={() => { setModuleFilter('All'); setActionFilter('All') }}
                  className="self-end text-xs text-[hsl(var(--primary))] hover:underline cursor-pointer"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* ═══ TIMELINE ═══ */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-[hsl(var(--primary))] animate-spin" />
            <span className="ml-2 text-sm text-[hsl(var(--muted-foreground))]">Loading activity logs...</span>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <ScrollText className="w-10 h-10 text-[hsl(var(--destructive)/0.3)] mx-auto mb-3" />
            <p className="text-sm text-[hsl(var(--destructive))]">
              Failed to load activity logs
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(group => (
              <div key={group.label}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{group.label}</span>
                  <div className="flex-1 h-px bg-[hsl(var(--border))]" />
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{group.logs.length} {group.logs.length === 1 ? 'entry' : 'entries'}</span>
                </div>

                <div className="space-y-1">
                  {group.logs.map(log => {
                    const ModuleIcon = MODULE_ICONS[log.module] || ScrollText
                    return (
                      <div
                        key={log.id}
                        className="flex gap-3 px-4 py-3 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:shadow-sm transition-shadow"
                      >
                        {/* Module icon */}
                        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center shrink-0 mt-0.5">
                          <ModuleIcon className="w-4 h-4 text-[hsl(var(--primary))]" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-[hsl(var(--foreground))]">{log.patientName}</span>
                            <ActionBadge action={log.action} />
                            <span className="text-[10px] text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-1.5 py-0.5 rounded">{log.module}</span>
                          </div>
                          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 leading-relaxed">{log.details}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                              {format(new Date(log.timestamp), 'h:mm a')}
                            </span>
                            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                              by {log.user}
                            </span>
                            <span className="text-[10px] text-[hsl(var(--muted-foreground))] font-mono">
                              {log.patientId}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <ScrollText className="w-10 h-10 text-[hsl(var(--muted-foreground)/0.3)] mx-auto mb-3" />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {searchQuery || activeFilters > 0 ? 'No matching log entries' : 'No activity recorded yet'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
