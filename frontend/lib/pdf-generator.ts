"use client"

// PDF Generation utility using browser's print functionality with enhanced styling
// For production, consider using libraries like jsPDF, react-pdf, or server-side PDF generation

export interface PDFOptions {
  title: string
  subtitle?: string
  sections: string[]
  patientInfo?: {
    name: string
    id: string
    birthdate?: string
    gender?: string
    employer?: string
  }
  clinicInfo?: {
    name: string
    address: string
    phone: string
    logo?: string
  }
}

export function generatePrintableHTML(options: PDFOptions): string {
  const { title, subtitle, patientInfo, clinicInfo } = options
  
  const header = `
    <div class="print-header" style="text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #0891b2;">
      ${clinicInfo ? `
        <h1 style="margin: 0; font-size: 18pt; color: #0891b2;">${clinicInfo.name}</h1>
        <p style="margin: 5px 0; font-size: 10pt; color: #666;">${clinicInfo.address}</p>
        <p style="margin: 5px 0; font-size: 10pt; color: #666;">Tel: ${clinicInfo.phone}</p>
      ` : ''}
      <h2 style="margin: 15px 0 5px; font-size: 14pt; text-transform: uppercase;">${title}</h2>
      ${subtitle ? `<p style="margin: 0; font-size: 10pt; color: #666;">${subtitle}</p>` : ''}
    </div>
  `

  const patientSection = patientInfo ? `
    <div style="margin-bottom: 20px; padding: 10px; background: #f8fafc; border-radius: 8px;">
      <table style="width: 100%; border: none;">
        <tr>
          <td style="border: none; padding: 5px;"><strong>Name:</strong> ${patientInfo.name}</td>
          <td style="border: none; padding: 5px;"><strong>ID:</strong> ${patientInfo.id}</td>
        </tr>
        <tr>
          <td style="border: none; padding: 5px;"><strong>Birthdate:</strong> ${patientInfo.birthdate || '—'}</td>
          <td style="border: none; padding: 5px;"><strong>Gender:</strong> ${patientInfo.gender || '—'}</td>
        </tr>
        ${patientInfo.employer ? `
        <tr>
          <td colspan="2" style="border: none; padding: 5px;"><strong>Employer:</strong> ${patientInfo.employer}</td>
        </tr>
        ` : ''}
      </table>
    </div>
  ` : ''

  return header + patientSection
}

export function printReport(options: PDFOptions) {
  // Add print-specific class to body
  document.body.classList.add('printing')
  
  // Hide sections not selected for printing
  const allSections = document.querySelectorAll('[data-print-section]')
  allSections.forEach(section => {
    const sectionId = section.getAttribute('data-print-section')
    if (sectionId && !options.sections.includes(sectionId)) {
      (section as HTMLElement).style.display = 'none'
    }
  })

  // Trigger print
  window.print()

  // Restore sections after print
  setTimeout(() => {
    document.body.classList.remove('printing')
    allSections.forEach(section => {
      (section as HTMLElement).style.display = ''
    })
  }, 1000)
}

export function downloadAsPDF(elementId: string, filename: string) {
  // For actual PDF download, you would use a library like html2pdf.js or jsPDF
  // This is a placeholder that opens print dialog
  const element = document.getElementById(elementId)
  if (!element) return

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
        .section { margin-bottom: 20px; page-break-inside: avoid; }
        h3 { color: #0891b2; border-bottom: 1px solid #0891b2; padding-bottom: 5px; }
      </style>
    </head>
    <body>
      ${element.innerHTML}
    </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}

// Batch print multiple reports
export async function batchPrint(reports: { elementId: string; title: string }[]) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  let content = ''
  reports.forEach((report, index) => {
    const element = document.getElementById(report.elementId)
    if (element) {
      content += `
        <div class="report-page" style="${index > 0 ? 'page-break-before: always;' : ''}">
          <h2 style="text-align: center; color: #0891b2;">${report.title}</h2>
          ${element.innerHTML}
        </div>
      `
    }
  })

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Batch Print</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
        .report-page { margin-bottom: 30px; }
        @media print {
          .report-page { page-break-after: always; }
          .report-page:last-child { page-break-after: avoid; }
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}
