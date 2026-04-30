"use client"

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isOnline, onOnlineStatusChange, getPendingSyncs, type PendingSync } from '@/lib/offline-storage'

interface OfflineIndicatorProps {
  className?: string
  showPendingCount?: boolean
}

export function OfflineIndicator({ className, showPendingCount = true }: OfflineIndicatorProps) {
  const [online, setOnline] = useState(true)
  const [pendingSyncs, setPendingSyncs] = useState<PendingSync[]>([])
  const [syncing, setSyncing] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    setOnline(isOnline())
    
    const unsubscribe = onOnlineStatusChange((status) => {
      setOnline(status)
      if (status) {
        // Trigger sync when coming back online
        syncPendingData()
      }
    })

    // Load pending syncs
    loadPendingSyncs()

    return unsubscribe
  }, [])

  const loadPendingSyncs = async () => {
    try {
      const syncs = await getPendingSyncs()
      setPendingSyncs(syncs)
    } catch (error) {
      console.error('Failed to load pending syncs:', error)
    }
  }

  const syncPendingData = async () => {
    if (syncing || !online) return
    
    setSyncing(true)
    try {
      // In a real app, this would sync with the backend
      await new Promise(resolve => setTimeout(resolve, 2000))
      await loadPendingSyncs()
    } finally {
      setSyncing(false)
    }
  }

  // Don't show anything if online and no pending syncs
  if (online && pendingSyncs.length === 0 && !showPendingCount) {
    return null
  }

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
          online
            ? pendingSyncs.length > 0
              ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
              : "bg-green-100 text-green-700 hover:bg-green-200"
            : "bg-red-100 text-red-700 hover:bg-red-200"
        )}
      >
        {online ? (
          pendingSyncs.length > 0 ? (
            <>
              <Cloud className="w-4 h-4" />
              <span className="hidden sm:inline">Syncing</span>
              {showPendingCount && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-200 text-xs">
                  {pendingSyncs.length}
                </span>
              )}
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4" />
              <span className="hidden sm:inline">Online</span>
            </>
          )
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="hidden sm:inline">Offline</span>
            {showPendingCount && pendingSyncs.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-200 text-xs">
                {pendingSyncs.length}
              </span>
            )}
          </>
        )}
      </button>

      {/* Details dropdown */}
      {showDetails && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDetails(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {online ? (
                    <Wifi className="w-4 h-4 text-green-600" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-600" />
                  )}
                  <span className="font-semibold text-sm">
                    {online ? 'Connected' : 'Offline Mode'}
                  </span>
                </div>
                {online && pendingSyncs.length > 0 && (
                  <button
                    onClick={syncPendingData}
                    disabled={syncing}
                    className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer disabled:opacity-50"
                    title="Sync now"
                  >
                    <RefreshCw className={cn("w-4 h-4", syncing && "animate-spin")} />
                  </button>
                )}
              </div>
            </div>

            <div className="p-4">
              {!online && (
                <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Working Offline</p>
                      <p className="text-xs text-amber-600 mt-1">
                        Your changes will be saved locally and synced when you're back online.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {pendingSyncs.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase mb-2">
                    Pending Changes ({pendingSyncs.length})
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {pendingSyncs.map(sync => (
                      <div
                        key={sync.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-[hsl(var(--muted)/0.3)]"
                      >
                        <CloudOff className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {sync.type} - {sync.action}
                          </p>
                          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                            {new Date(sync.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    All changes synced
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Simple status badge for compact display
export function OnlineStatusBadge() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    setOnline(isOnline())
    return onOnlineStatusChange(setOnline)
  }, [])

  return (
    <div className={cn(
      "w-2 h-2 rounded-full",
      online ? "bg-green-500" : "bg-red-500"
    )} title={online ? 'Online' : 'Offline'} />
  )
}

export default OfflineIndicator
