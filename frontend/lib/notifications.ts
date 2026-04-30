// Notification and alert system for critical values and reminders

export interface CriticalAlert {
  id: string
  patientId: string
  patientName: string
  type: 'critical_value' | 'follow_up' | 'clearance_needed'
  severity: 'critical' | 'warning' | 'info'
  title: string
  message: string
  field?: string
  value?: string | number
  referenceRange?: string
  timestamp: number
  acknowledged: boolean
}

export interface FollowUpReminder {
  id: string
  patientId: string
  patientName: string
  reason: string
  dueDate: string
  notes?: string
  completed: boolean
  createdAt: number
}

// Store alerts in memory (in production, use a proper state management or backend)
let alerts: CriticalAlert[] = []
let reminders: FollowUpReminder[] = []
let alertListeners: ((alerts: CriticalAlert[]) => void)[] = []
let reminderListeners: ((reminders: FollowUpReminder[]) => void)[] = []

// Alert management
export function addCriticalAlert(alert: Omit<CriticalAlert, 'id' | 'timestamp' | 'acknowledged'>): CriticalAlert {
  const newAlert: CriticalAlert = {
    ...alert,
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    acknowledged: false,
  }
  
  alerts = [newAlert, ...alerts]
  notifyAlertListeners()
  
  // Show browser notification if permitted
  showBrowserNotification(newAlert)
  
  return newAlert
}

export function acknowledgeAlert(id: string): void {
  alerts = alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a)
  notifyAlertListeners()
}

export function dismissAlert(id: string): void {
  alerts = alerts.filter(a => a.id !== id)
  notifyAlertListeners()
}

export function getAlerts(): CriticalAlert[] {
  return alerts
}

export function getUnacknowledgedAlerts(): CriticalAlert[] {
  return alerts.filter(a => !a.acknowledged)
}

export function getPatientAlerts(patientId: string): CriticalAlert[] {
  return alerts.filter(a => a.patientId === patientId)
}

export function subscribeToAlerts(listener: (alerts: CriticalAlert[]) => void): () => void {
  alertListeners.push(listener)
  return () => {
    alertListeners = alertListeners.filter(l => l !== listener)
  }
}

function notifyAlertListeners(): void {
  alertListeners.forEach(listener => listener(alerts))
}

// Follow-up reminder management
export function addFollowUpReminder(reminder: Omit<FollowUpReminder, 'id' | 'completed' | 'createdAt'>): FollowUpReminder {
  const newReminder: FollowUpReminder = {
    ...reminder,
    id: `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    completed: false,
    createdAt: Date.now(),
  }
  
  reminders = [newReminder, ...reminders]
  notifyReminderListeners()
  
  return newReminder
}

export function completeReminder(id: string): void {
  reminders = reminders.map(r => r.id === id ? { ...r, completed: true } : r)
  notifyReminderListeners()
}

export function deleteReminder(id: string): void {
  reminders = reminders.filter(r => r.id !== id)
  notifyReminderListeners()
}

export function getReminders(): FollowUpReminder[] {
  return reminders
}

export function getPendingReminders(): FollowUpReminder[] {
  return reminders.filter(r => !r.completed)
}

export function getOverdueReminders(): FollowUpReminder[] {
  const today = new Date().toISOString().split('T')[0]
  return reminders.filter(r => !r.completed && r.dueDate < today)
}

export function getPatientReminders(patientId: string): FollowUpReminder[] {
  return reminders.filter(r => r.patientId === patientId)
}

export function subscribeToReminders(listener: (reminders: FollowUpReminder[]) => void): () => void {
  reminderListeners.push(listener)
  return () => {
    reminderListeners = reminderListeners.filter(l => l !== listener)
  }
}

function notifyReminderListeners(): void {
  reminderListeners.forEach(listener => listener(reminders))
}

// Browser notifications
async function showBrowserNotification(alert: CriticalAlert): Promise<void> {
  if (!('Notification' in window)) return
  
  if (Notification.permission === 'granted') {
    new Notification(alert.title, {
      body: alert.message,
      icon: '/favicon.ico',
      tag: alert.id,
      requireInteraction: alert.severity === 'critical',
    })
  } else if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      new Notification(alert.title, {
        body: alert.message,
        icon: '/favicon.ico',
        tag: alert.id,
      })
    }
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// Check for critical lab values and create alerts
export function checkLabValuesForAlerts(
  patientId: string,
  patientName: string,
  labData: Record<string, any>,
  referenceRanges: Record<string, { min: number; max: number; criticalLow?: number; criticalHigh?: number; unit: string }>
): CriticalAlert[] {
  const newAlerts: CriticalAlert[] = []
  
  Object.entries(labData).forEach(([field, value]) => {
    const range = referenceRanges[field]
    if (!range || value === '' || value === null || value === undefined) return
    
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return
    
    // Check for critical values
    if (range.criticalLow !== undefined && numValue < range.criticalLow) {
      newAlerts.push(addCriticalAlert({
        patientId,
        patientName,
        type: 'critical_value',
        severity: 'critical',
        title: `Critical Low: ${field.toUpperCase()}`,
        message: `${patientName}'s ${field} is critically low at ${numValue} ${range.unit}`,
        field,
        value: numValue,
        referenceRange: `${range.min}-${range.max} ${range.unit}`,
      }))
    } else if (range.criticalHigh !== undefined && numValue > range.criticalHigh) {
      newAlerts.push(addCriticalAlert({
        patientId,
        patientName,
        type: 'critical_value',
        severity: 'critical',
        title: `Critical High: ${field.toUpperCase()}`,
        message: `${patientName}'s ${field} is critically high at ${numValue} ${range.unit}`,
        field,
        value: numValue,
        referenceRange: `${range.min}-${range.max} ${range.unit}`,
      }))
    }
    // Check for abnormal (but not critical) values
    else if (numValue < range.min || numValue > range.max) {
      newAlerts.push(addCriticalAlert({
        patientId,
        patientName,
        type: 'critical_value',
        severity: 'warning',
        title: `Abnormal: ${field.toUpperCase()}`,
        message: `${patientName}'s ${field} is ${numValue < range.min ? 'low' : 'high'} at ${numValue} ${range.unit}`,
        field,
        value: numValue,
        referenceRange: `${range.min}-${range.max} ${range.unit}`,
      }))
    }
  })
  
  return newAlerts
}

// Create clearance reminder
export function createClearanceReminder(
  patientId: string,
  patientName: string,
  reason: string,
  dueDate: string,
  notes?: string
): FollowUpReminder {
  return addFollowUpReminder({
    patientId,
    patientName,
    reason: `Clearance needed: ${reason}`,
    dueDate,
    notes,
  })
}
