// Form validation utilities with reference range checking

export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  message?: string
}

export interface FieldValidation {
  isValid: boolean
  error?: string
  warning?: string
}

export interface ReferenceRange {
  min: number
  max: number
  unit: string
  criticalLow?: number
  criticalHigh?: number
}

// Lab reference ranges (typical adult values)
export const LAB_REFERENCE_RANGES: Record<string, ReferenceRange> = {
  // Hematology
  rbc: { min: 4.0, max: 6.0, unit: 'x10¹²/L', criticalLow: 2.5, criticalHigh: 8.0 },
  hemoglobin: { min: 120, max: 180, unit: 'g/L', criticalLow: 70, criticalHigh: 200 },
  hematocrit: { min: 0.36, max: 0.54, unit: 'L/L', criticalLow: 0.20, criticalHigh: 0.65 },
  platelet: { min: 150, max: 400, unit: 'x10⁹/L', criticalLow: 50, criticalHigh: 1000 },
  wbc: { min: 4.0, max: 11.0, unit: 'x10⁹/L', criticalLow: 2.0, criticalHigh: 30.0 },
  
  // Differential
  neutrophil: { min: 40, max: 70, unit: '%' },
  lymphocyte: { min: 20, max: 40, unit: '%' },
  monocyte: { min: 2, max: 8, unit: '%' },
  eosinophil: { min: 1, max: 4, unit: '%' },
  basophil: { min: 0, max: 1, unit: '%' },
  
  // Chemistry
  fbs: { min: 3.9, max: 6.1, unit: 'mmol/L', criticalLow: 2.2, criticalHigh: 22.2 },
  bun: { min: 2.5, max: 7.1, unit: 'mmol/L', criticalLow: 1.0, criticalHigh: 35.7 },
  uric_acid: { min: 150, max: 420, unit: 'µmol/L' },
  creatinine: { min: 44, max: 115, unit: 'µmol/L', criticalLow: 20, criticalHigh: 884 },
  cholesterol: { min: 0, max: 5.2, unit: 'mmol/L' },
  triglyceride: { min: 0, max: 1.7, unit: 'mmol/L' },
  hdl: { min: 1.0, max: 999, unit: 'mmol/L' },
  ldl: { min: 0, max: 3.4, unit: 'mmol/L' },
  sgpt: { min: 0, max: 41, unit: 'U/L', criticalHigh: 1000 },
  sgot: { min: 0, max: 40, unit: 'U/L', criticalHigh: 1000 },
  
  // HbA1c
  hba1c: { min: 4.0, max: 5.6, unit: '%', criticalHigh: 14.0 },
  
  // Urinalysis
  specific_gravity: { min: 1.005, max: 1.030, unit: '' },
  ph: { min: 4.5, max: 8.0, unit: '' },
  
  // Vitals
  bp_systolic: { min: 90, max: 120, unit: 'mmHg', criticalLow: 70, criticalHigh: 180 },
  bp_diastolic: { min: 60, max: 80, unit: 'mmHg', criticalLow: 40, criticalHigh: 120 },
  pulse_rate: { min: 60, max: 100, unit: 'bpm', criticalLow: 40, criticalHigh: 150 },
  temperature: { min: 36.1, max: 37.2, unit: '°C', criticalLow: 35.0, criticalHigh: 39.0 },
  respiration: { min: 12, max: 20, unit: '/min', criticalLow: 8, criticalHigh: 30 },
}

export function validateField(value: any, rules: ValidationRule): FieldValidation {
  if (rules.required && (!value || value === '')) {
    return { isValid: false, error: rules.message || 'This field is required' }
  }

  if (value && rules.min !== undefined) {
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue < rules.min) {
      return { isValid: false, error: rules.message || `Value must be at least ${rules.min}` }
    }
  }

  if (value && rules.max !== undefined) {
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > rules.max) {
      return { isValid: false, error: rules.message || `Value must be at most ${rules.max}` }
    }
  }

  if (value && rules.pattern && !rules.pattern.test(value)) {
    return { isValid: false, error: rules.message || 'Invalid format' }
  }

  return { isValid: true }
}

export function checkReferenceRange(fieldName: string, value: string | number): FieldValidation {
  const range = LAB_REFERENCE_RANGES[fieldName]
  if (!range) return { isValid: true }

  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) return { isValid: true }

  // Check for critical values first
  if (range.criticalLow !== undefined && numValue < range.criticalLow) {
    return {
      isValid: false,
      error: `Critical low! Value ${numValue} is below ${range.criticalLow} ${range.unit}`,
    }
  }

  if (range.criticalHigh !== undefined && numValue > range.criticalHigh) {
    return {
      isValid: false,
      error: `Critical high! Value ${numValue} is above ${range.criticalHigh} ${range.unit}`,
    }
  }

  // Check for abnormal values
  if (numValue < range.min) {
    return {
      isValid: true,
      warning: `Low: ${numValue} (normal: ${range.min}-${range.max} ${range.unit})`,
    }
  }

  if (numValue > range.max) {
    return {
      isValid: true,
      warning: `High: ${numValue} (normal: ${range.min}-${range.max} ${range.unit})`,
    }
  }

  return { isValid: true }
}

export function isValueAbnormal(fieldName: string, value: string | number): boolean {
  const result = checkReferenceRange(fieldName, value)
  return !!result.warning || !!result.error
}

export function isCriticalValue(fieldName: string, value: string | number): boolean {
  const result = checkReferenceRange(fieldName, value)
  return !!result.error
}

export function getReferenceRangeText(fieldName: string): string {
  const range = LAB_REFERENCE_RANGES[fieldName]
  if (!range) return ''
  return `${range.min}-${range.max} ${range.unit}`
}

// Validate entire form
export interface FormValidationResult {
  isValid: boolean
  errors: Record<string, string>
  warnings: Record<string, string>
  criticalValues: string[]
}

export function validateLabForm(data: Record<string, any>, requiredFields: string[]): FormValidationResult {
  const errors: Record<string, string> = {}
  const warnings: Record<string, string> = {}
  const criticalValues: string[] = []

  // Check required fields
  requiredFields.forEach(field => {
    if (!data[field] || data[field] === '') {
      errors[field] = 'Required'
    }
  })

  // Check reference ranges for all numeric fields
  Object.entries(data).forEach(([key, value]) => {
    if (value && LAB_REFERENCE_RANGES[key]) {
      const result = checkReferenceRange(key, value)
      if (result.error) {
        errors[key] = result.error
        if (result.error.includes('Critical')) {
          criticalValues.push(key)
        }
      } else if (result.warning) {
        warnings[key] = result.warning
      }
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
    criticalValues,
  }
}
