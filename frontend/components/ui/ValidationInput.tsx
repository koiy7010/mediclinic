"use client"

import { useState, useEffect } from 'react'
import { AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { Input } from './input'
import { cn } from '@/lib/utils'
import { checkReferenceRange, getReferenceRangeText, type FieldValidation } from '@/lib/validation'

interface ValidationInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fieldName?: string // For automatic reference range checking
  showReferenceRange?: boolean
  customValidation?: (value: string) => FieldValidation
  onValidationChange?: (validation: FieldValidation) => void
  highlightAbnormal?: boolean
}

export function ValidationInput({
  fieldName,
  showReferenceRange = true,
  customValidation,
  onValidationChange,
  highlightAbnormal = true,
  className,
  value,
  onChange,
  ...props
}: ValidationInputProps) {
  const [validation, setValidation] = useState<FieldValidation>({ isValid: true })
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (value === undefined || value === '') {
      setValidation({ isValid: true })
      return
    }

    let result: FieldValidation = { isValid: true }

    if (customValidation) {
      result = customValidation(String(value))
    } else if (fieldName) {
      result = checkReferenceRange(fieldName, String(value))
    }

    setValidation(result)
    onValidationChange?.(result)
  }, [value, fieldName, customValidation, onValidationChange])

  const referenceRange = fieldName ? getReferenceRangeText(fieldName) : ''

  const getBorderColor = () => {
    if (!highlightAbnormal) return ''
    if (validation.error) return 'border-red-500 focus:ring-red-200'
    if (validation.warning) return 'border-amber-500 focus:ring-amber-200'
    if (value && !validation.error && !validation.warning) return 'border-green-500 focus:ring-green-200'
    return ''
  }

  const getIcon = () => {
    if (validation.error) return <AlertCircle className="w-4 h-4 text-red-500" />
    if (validation.warning) return <AlertTriangle className="w-4 h-4 text-amber-500" />
    if (value && !validation.error && !validation.warning) return <CheckCircle className="w-4 h-4 text-green-500" />
    return null
  }

  return (
    <div className="relative">
      <div className="relative">
        <Input
          {...props}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            getBorderColor(),
            "pr-8",
            className
          )}
        />
        {value && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {getIcon()}
          </div>
        )}
      </div>

      {/* Reference range hint */}
      {showReferenceRange && referenceRange && isFocused && (
        <div className="absolute left-0 top-full mt-1 z-10 px-2 py-1 bg-[hsl(var(--popover))] border border-[hsl(var(--border))] rounded-md shadow-md text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
          <Info className="w-3 h-3" />
          Normal: {referenceRange}
        </div>
      )}

      {/* Validation message */}
      {(validation.error || validation.warning) && (
        <p className={cn(
          "mt-1 text-xs flex items-center gap-1",
          validation.error ? "text-red-600" : "text-amber-600"
        )}>
          {validation.error ? (
            <AlertCircle className="w-3 h-3" />
          ) : (
            <AlertTriangle className="w-3 h-3" />
          )}
          {validation.error || validation.warning}
        </p>
      )}
    </div>
  )
}

// Wrapper for form fields with validation
interface ValidatedFieldProps {
  label: string
  required?: boolean
  hint?: string
  fieldName?: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  className?: string
  showReferenceRange?: boolean
}

export function ValidatedField({
  label,
  required,
  hint,
  fieldName,
  value,
  onChange,
  type = 'text',
  placeholder,
  className,
  showReferenceRange = true,
}: ValidatedFieldProps) {
  const [validation, setValidation] = useState<FieldValidation>({ isValid: true })
  const referenceRange = fieldName ? getReferenceRangeText(fieldName) : ''

  return (
    <div className={cn("space-y-1", className)}>
      <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide flex items-center gap-2">
        {label}
        {required && <span className="text-red-500">*</span>}
        {referenceRange && showReferenceRange && (
          <span className="font-normal normal-case text-[10px] text-[hsl(var(--muted-foreground))]">
            ({referenceRange})
          </span>
        )}
      </label>
      <ValidationInput
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        fieldName={fieldName}
        showReferenceRange={false}
        onValidationChange={setValidation}
        placeholder={placeholder}
      />
      {hint && !validation.error && !validation.warning && (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{hint}</p>
      )}
    </div>
  )
}

export default ValidationInput
