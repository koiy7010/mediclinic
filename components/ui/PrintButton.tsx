"use client"

import { useState } from 'react'
import { Printer, Check, X, Download, FileText } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'
import { printReport, downloadAsPDF, batchPrint } from '@/lib/pdf-generator'

interface PrintSection {
  id: string
  label: string
  defaultChecked?: boolean
}

interface PrintButtonProps {
  sections?: PrintSection[]
  onPrint?: (selectedSections: string[]) => void
  className?: string
  reportTitle?: string
  patientInfo?: {
    name: string
    id: string
    birthdate?: string
    gender?: string
    employer?: string
  }
}

export function PrintButton({ sections, onPrint, className, reportTitle, patientInfo }: PrintButtonProps) {
  const [showOptions, setShowOptions] = useState(false)
  const [selectedSections, setSelectedSections] = useState<string[]>(
    sections?.filter(s => s.defaultChecked !== false).map(s => s.id) || []
  )

  const handlePrint = () => {
    if (onPrint) {
      onPrint(selectedSections)
    } else {
      printReport({
        title: reportTitle || 'Medical Report',
        sections: selectedSections,
        patientInfo,
        clinicInfo: {
          name: 'Medical Clinic',
          address: '123 Healthcare Ave, Medical City',
          phone: '+63 2 1234 5678',
        },
      })
    }
    setShowOptions(false)
  }

  const handleDownloadPDF = () => {
    const contentId = 'printable-content'
    const filename = `${reportTitle || 'report'}_${patientInfo?.name?.replace(/\s+/g, '_') || 'patient'}.pdf`
    downloadAsPDF(contentId, filename)
    setShowOptions(false)
  }

  const toggleSection = (id: string) => {
    setSelectedSections(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id]
    )
  }

  const selectAll = () => {
    setSelectedSections(sections?.map(s => s.id) || [])
  }

  const selectNone = () => {
    setSelectedSections([])
  }

  if (!sections || sections.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.print()}
        className={className}
      >
        <Printer className="w-4 h-4 mr-2" />
        Print
      </Button>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowOptions(!showOptions)}
      >
        <Printer className="w-4 h-4 mr-2" />
        Print
      </Button>

      {showOptions && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowOptions(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
              <p className="text-sm font-semibold">Print Options</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                Select sections to include
              </p>
            </div>
            
            <div className="px-3 py-2 border-b border-[hsl(var(--border))] flex gap-2">
              <button
                onClick={selectAll}
                className="text-xs text-[hsl(var(--primary))] hover:underline cursor-pointer"
              >
                Select All
              </button>
              <span className="text-[hsl(var(--muted-foreground))]">|</span>
              <button
                onClick={selectNone}
                className="text-xs text-[hsl(var(--primary))] hover:underline cursor-pointer"
              >
                Select None
              </button>
            </div>
            
            <div className="p-2 max-h-64 overflow-y-auto">
              {sections.map((section) => (
                <label
                  key={section.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[hsl(var(--muted)/0.5)] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedSections.includes(section.id)}
                    onChange={() => toggleSection(section.id)}
                    className="w-4 h-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--ring))]"
                  />
                  <span className="text-sm">{section.label}</span>
                </label>
              ))}
            </div>
            
            <div className="px-3 py-3 border-t border-[hsl(var(--border))] space-y-2">
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={handlePrint}
                  disabled={selectedSections.length === 0}
                  className="flex-1"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" />
                  Print ({selectedSections.length})
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleDownloadPDF}
                  disabled={selectedSections.length === 0}
                  title="Download as PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </div>
              <button
                onClick={() => setShowOptions(false)}
                className="w-full text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] py-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Batch print button for multiple reports
interface BatchPrintButtonProps {
  reports: { elementId: string; title: string; checked?: boolean }[]
  className?: string
}

export function BatchPrintButton({ reports, className }: BatchPrintButtonProps) {
  const [showOptions, setShowOptions] = useState(false)
  const [selectedReports, setSelectedReports] = useState<string[]>(
    reports.filter(r => r.checked !== false).map(r => r.elementId)
  )

  const handleBatchPrint = () => {
    const selectedItems = reports.filter(r => selectedReports.includes(r.elementId))
    batchPrint(selectedItems)
    setShowOptions(false)
  }

  const toggleReport = (id: string) => {
    setSelectedReports(prev =>
      prev.includes(id)
        ? prev.filter(r => r !== id)
        : [...prev, id]
    )
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowOptions(!showOptions)}
      >
        <FileText className="w-4 h-4 mr-2" />
        Batch Print
      </Button>

      {showOptions && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowOptions(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
              <p className="text-sm font-semibold">Batch Print</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                Select reports to print together
              </p>
            </div>
            
            <div className="p-2 max-h-64 overflow-y-auto">
              {reports.map((report) => (
                <label
                  key={report.elementId}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[hsl(var(--muted)/0.5)] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedReports.includes(report.elementId)}
                    onChange={() => toggleReport(report.elementId)}
                    className="w-4 h-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--ring))]"
                  />
                  <span className="text-sm">{report.title}</span>
                </label>
              ))}
            </div>
            
            <div className="px-3 py-2 border-t border-[hsl(var(--border))] flex items-center justify-between">
              <button
                onClick={() => setShowOptions(false)}
                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] px-3 py-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <Button 
                size="sm" 
                onClick={handleBatchPrint}
                disabled={selectedReports.length === 0}
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Print ({selectedReports.length})
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
