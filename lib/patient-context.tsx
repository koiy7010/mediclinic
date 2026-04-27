"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface Patient {
  id: string
  last_name: string
  first_name: string
  middle_name?: string
  employer?: string
  birthdate?: string
  gender?: string
  contact_number?: string
  address?: string
  marital_status?: string
  nationality?: string
  registration_date?: string
}

interface PatientContextType {
  selectedPatient: Patient | null
  setSelectedPatient: (p: Patient | null) => void
  panelOpen: boolean
  setPanelOpen: (open: boolean) => void
}

const PatientContext = createContext<PatientContextType>({
  selectedPatient: null,
  setSelectedPatient: () => {},
  panelOpen: false,
  setPanelOpen: () => {},
})

export function PatientProvider({ children }: { children: ReactNode }) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  return (
    <PatientContext.Provider value={{ selectedPatient, setSelectedPatient, panelOpen, setPanelOpen }}>
      {children}
    </PatientContext.Provider>
  )
}

export function usePatient() {
  return useContext(PatientContext)
}
