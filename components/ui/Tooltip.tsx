"use client"

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  className?: string
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
  className
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[hsl(var(--foreground))] border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[hsl(var(--foreground))] border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[hsl(var(--foreground))] border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[hsl(var(--foreground))] border-y-transparent border-l-transparent'
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {visible && (
        <div
          className={cn(
            "absolute z-50 px-2 py-1 text-xs font-medium text-white bg-[hsl(var(--foreground))] rounded-md whitespace-nowrap",
            "animate-in fade-in zoom-in-95 duration-150",
            positionClasses[position],
            className
          )}
        >
          {content}
          <div
            className={cn(
              "absolute w-0 h-0 border-4",
              arrowClasses[position]
            )}
          />
        </div>
      )}
    </div>
  )
}

// Medical abbreviation tooltips
const medicalAbbreviations: Record<string, string> = {
  'RBC': 'Red Blood Cells',
  'WBC': 'White Blood Cells',
  'HGB': 'Hemoglobin',
  'HCT': 'Hematocrit',
  'PLT': 'Platelet Count',
  'FBS': 'Fasting Blood Sugar',
  'BUN': 'Blood Urea Nitrogen',
  'SGPT': 'Serum Glutamic Pyruvic Transaminase (ALT)',
  'SGOT': 'Serum Glutamic Oxaloacetic Transaminase (AST)',
  'HDL': 'High-Density Lipoprotein',
  'LDL': 'Low-Density Lipoprotein',
  'VLDL': 'Very Low-Density Lipoprotein',
  'HbA1c': 'Glycated Hemoglobin',
  'HPF': 'High Power Field',
  'LPF': 'Low Power Field',
  'ECG': 'Electrocardiogram',
  'BP': 'Blood Pressure',
  'BMI': 'Body Mass Index',
  'OD': 'Oculus Dexter (Right Eye)',
  'OS': 'Oculus Sinister (Left Eye)',
  'OU': 'Oculus Uterque (Both Eyes)',
  'LMP': 'Last Menstrual Period',
  'PTB': 'Pulmonary Tuberculosis',
  'HBsAg': 'Hepatitis B Surface Antigen',
  'VDRL': 'Venereal Disease Research Laboratory',
}

interface MedicalTermProps {
  term: string
  children?: React.ReactNode
}

export function MedicalTerm({ term, children }: MedicalTermProps) {
  const explanation = medicalAbbreviations[term]
  
  if (!explanation) {
    return <>{children || term}</>
  }

  return (
    <Tooltip content={explanation}>
      <span className="border-b border-dotted border-[hsl(var(--muted-foreground))] cursor-help">
        {children || term}
      </span>
    </Tooltip>
  )
}
