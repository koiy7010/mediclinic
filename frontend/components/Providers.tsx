"use client"

import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { PatientProvider } from '@/lib/patient-context'
import { SearchProvider } from '@/lib/search-context'
import { registerServiceWorker, onServiceWorkerMessage } from '@/lib/service-worker'
import { initDB } from '@/lib/offline-storage'
import { toast } from '@/lib/use-toast'

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize IndexedDB for offline storage
    initDB().catch(console.error)
    
    // Register service worker for offline support
    registerServiceWorker()
    
    // Listen for service worker messages
    const unsubscribe = onServiceWorkerMessage((data) => {
      if (data.type === 'SYNC_COMPLETE') {
        toast({ title: 'Data synced successfully', variant: 'success' })
      }
    })
    
    return unsubscribe
  }, [])

  return (
    <QueryClientProvider client={queryClientInstance}>
      <SearchProvider>
        <PatientProvider>
          {children}
        </PatientProvider>
      </SearchProvider>
    </QueryClientProvider>
  )
}
