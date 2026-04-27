"use client"

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { 
  Bell, AlertTriangle, AlertCircle, Info, X, Check, 
  ChevronRight, Calendar, User, Clock
} from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'
import {
  type CriticalAlert,
  type FollowUpReminder,
  getAlerts,
  getReminders,
  acknowledgeAlert,
  dismissAlert,
  completeReminder,
  deleteReminder,
  subscribeToAlerts,
  subscribeToReminders,
} from '@/lib/notifications'

interface AlertsPanelProps {
  className?: string
}

export function AlertsPanel({ className }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<CriticalAlert[]>([])
  const [reminders, setReminders] = useState<FollowUpReminder[]>([])
  const [activeTab, setActiveTab] = useState<'alerts' | 'reminders'>('alerts')

  useEffect(() => {
    setAlerts(getAlerts())
    setReminders(getReminders())

    const unsubAlerts = subscribeToAlerts(setAlerts)
    const unsubReminders = subscribeToReminders(setReminders)

    return () => {
      unsubAlerts()
      unsubReminders()
    }
  }, [])

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length
  const pendingRemindersCount = reminders.filter(r => !r.completed).length

  return (
    <div className={cn("bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-hidden", className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[hsl(var(--primary))]" />
          <h3 className="font-semibold">Notifications</h3>
          {(unacknowledgedCount > 0 || pendingRemindersCount > 0) && (
            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-medium">
              {unacknowledgedCount + pendingRemindersCount}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[hsl(var(--border))]">
        <button
          onClick={() => setActiveTab('alerts')}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
            activeTab === 'alerts'
              ? "text-[hsl(var(--primary))] border-b-2 border-[hsl(var(--primary))]"
              : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          )}
        >
          Alerts
          {unacknowledgedCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-xs">
              {unacknowledgedCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('reminders')}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
            activeTab === 'reminders'
              ? "text-[hsl(var(--primary))] border-b-2 border-[hsl(var(--primary))]"
              : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          )}
        >
          Reminders
          {pendingRemindersCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 text-xs">
              {pendingRemindersCount}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {activeTab === 'alerts' ? (
          <AlertsList alerts={alerts} />
        ) : (
          <RemindersList reminders={reminders} />
        )}
      </div>
    </div>
  )
}

function AlertsList({ alerts }: { alerts: CriticalAlert[] }) {
  if (alerts.length === 0) {
    return (
      <div className="p-8 text-center text-[hsl(var(--muted-foreground))]">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No alerts</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-[hsl(var(--border))]">
      {alerts.map(alert => (
        <AlertItem key={alert.id} alert={alert} />
      ))}
    </div>
  )
}

function AlertItem({ alert }: { alert: CriticalAlert }) {
  const severityConfig = {
    critical: {
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    info: {
      icon: Info,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
  }

  const config = severityConfig[alert.severity]
  const Icon = config.icon

  return (
    <div className={cn(
      "p-4 transition-colors",
      alert.acknowledged ? "opacity-60" : config.bg
    )}>
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg", config.bg, config.border, "border")}>
          <Icon className={cn("w-4 h-4", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{alert.title}</span>
            {!alert.acknowledged && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500 text-white">
                NEW
              </span>
            )}
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{alert.message}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-[hsl(var(--muted-foreground))]">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {alert.patientName}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format(alert.timestamp, 'MMM dd, HH:mm')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!alert.acknowledged && (
            <button
              onClick={() => acknowledgeAlert(alert.id)}
              className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
              title="Acknowledge"
            >
              <Check className="w-4 h-4 text-green-600" />
            </button>
          )}
          <button
            onClick={() => dismissAlert(alert.id)}
            className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          </button>
        </div>
      </div>
    </div>
  )
}

function RemindersList({ reminders }: { reminders: FollowUpReminder[] }) {
  if (reminders.length === 0) {
    return (
      <div className="p-8 text-center text-[hsl(var(--muted-foreground))]">
        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No reminders</p>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="divide-y divide-[hsl(var(--border))]">
      {reminders.map(reminder => {
        const isOverdue = !reminder.completed && reminder.dueDate < today
        const isDueToday = reminder.dueDate === today

        return (
          <div
            key={reminder.id}
            className={cn(
              "p-4 transition-colors",
              reminder.completed ? "opacity-60" : isOverdue ? "bg-red-50" : isDueToday ? "bg-amber-50" : ""
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg border",
                isOverdue ? "bg-red-100 border-red-200" : isDueToday ? "bg-amber-100 border-amber-200" : "bg-[hsl(var(--muted))] border-[hsl(var(--border))]"
              )}>
                <Calendar className={cn(
                  "w-4 h-4",
                  isOverdue ? "text-red-600" : isDueToday ? "text-amber-600" : "text-[hsl(var(--muted-foreground))]"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-medium text-sm",
                    reminder.completed && "line-through"
                  )}>
                    {reminder.reason}
                  </span>
                  {isOverdue && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500 text-white">
                      OVERDUE
                    </span>
                  )}
                  {isDueToday && !reminder.completed && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500 text-white">
                      TODAY
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {reminder.patientName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Due: {format(new Date(reminder.dueDate), 'MMM dd, yyyy')}
                  </span>
                </div>
                {reminder.notes && (
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{reminder.notes}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {!reminder.completed && (
                  <button
                    onClick={() => completeReminder(reminder.id)}
                    className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
                    title="Mark complete"
                  >
                    <Check className="w-4 h-4 text-green-600" />
                  </button>
                )}
                <button
                  onClick={() => deleteReminder(reminder.id)}
                  className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
                  title="Delete"
                >
                  <X className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Floating notification bell for header
export function NotificationBell() {
  const [alerts, setAlerts] = useState<CriticalAlert[]>([])
  const [reminders, setReminders] = useState<FollowUpReminder[]>([])
  const [showPanel, setShowPanel] = useState(false)

  useEffect(() => {
    setAlerts(getAlerts())
    setReminders(getReminders())

    const unsubAlerts = subscribeToAlerts(setAlerts)
    const unsubReminders = subscribeToReminders(setReminders)

    return () => {
      unsubAlerts()
      unsubReminders()
    }
  }, [])

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length
  const pendingRemindersCount = reminders.filter(r => !r.completed).length
  const totalCount = unacknowledgedCount + pendingRemindersCount

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
      >
        <Bell className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center">
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>

      {showPanel && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-96 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <AlertsPanel />
          </div>
        </>
      )}
    </div>
  )
}

export default AlertsPanel
