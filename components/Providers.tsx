"use client"

import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { PatientProvider } from '@/lib/patient-context'
import { SearchProvider } from '@/lib/search-context'

export default function Providers({ children }: { children: React.ReactNode }) {
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
